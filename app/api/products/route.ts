import { NextRequest } from "next/server";
import { ZodError } from "zod";
import type { Prisma } from "@/app/generated/prisma";

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
          createdAt: true,
          updatedAt: true,
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
  } catch {
    return errorResponse("Failed to fetch products", 500);
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

    const data = parsed.data;

    const product = await prisma.product.create({
      data,
      select: {
        id: true,
        name: true,
        categoryId: true,
        subcategory: true,
        price: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(product, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2003") {
      return errorResponse("Invalid category reference", 400);
    }

    return errorResponse("Failed to create product", 500);
  }
}

