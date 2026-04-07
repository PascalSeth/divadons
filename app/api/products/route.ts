import { NextRequest } from "next/server";
import { ZodError } from "zod";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  productListQuerySchema,
  createProductSchema,
} from "@/lib/validations/product";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = productListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const {
      page,
      pageSize,
      category,
      status,
      featured,
      bestseller,
      search,
      minPrice,
      maxPrice,
    } = parsed.data;

    const where: Prisma.ProductWhereInput = {};

    if (category) where.categoryId = category;
    if (status) where.status = status;
    if (typeof featured === "boolean") where.featured = featured;
    if (typeof bestseller === "boolean") where.bestseller = bestseller;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const { skip, take } = paginate(page, pageSize);

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          categoryId: true,
          subcategory: true,
          price: true,
          currency: true,
          description: true,
          images: true,
          color: true,
          sizes: true,
          featured: true,
          bestseller: true,
          vegan: true,
          concern: true,
          stock: true,
          status: true,
          metaTitle: true,
          metaDescription: true,
          createdAt: true,
          updatedAt: true,
          variants: {
            select: {
              sku: true,
              size: true,
              color: true,
              stock: true,
            }
          },
          collections: {
            select: {
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(products, 200, meta);
  } catch (e: unknown) {
    console.error("GET Products Error:", e);
    const message = e instanceof Error ? e.message : "Failed to fetch products";
    return errorResponse(message, 500, e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createProductSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid product payload", 400, details);
    }

    const { variants, ...productData } = parsed.data;
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants
        } : undefined
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        subcategory: true,
        price: true,
        currency: true,
        description: true,
        images: true,
        color: true,
        sizes: true,
        featured: true,
        bestseller: true,
        vegan: true,
        concern: true,
        stock: true,
        status: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
        variants: true,
      },
    });

    return successResponse(product, 201);
  } catch (error: unknown) {
    console.error("POST Products Error:", error);
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const message = error instanceof Error ? error.message : "Failed to create product";
    const e = error as { code?: string };
    if (e.code === "P2003") {
      return errorResponse("Invalid category reference", 400);
    }

    return errorResponse(message, 500, error);
  }
}
