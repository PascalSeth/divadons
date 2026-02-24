import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { paginationQuerySchema } from "@/lib/validations/common";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string; categoryId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: collectionId, categoryId } = await context.params;

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = paginationQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    // Verify category exists in collection
    const collectionCategory = await prisma.collectionCategory.findUnique({
      where: {
        collectionId_categoryId: {
          collectionId,
          categoryId,
        },
      },
    });

    if (!collectionCategory) {
      return errorResponse("Category not found in this collection", 404);
    }

    // Get products from this category (optionally filtered to collection products)
    const [total, products] = await Promise.all([
      prisma.product.count({
        where: { categoryId },
      }),
      prisma.product.findMany({
        where: { categoryId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          color: true,
          featured: true,
          bestseller: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const normalized = products.map((p) => ({
      ...p,
      images: p.images.map((img) => buildSupabasePublicUrl("product", img)),
    }));

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(normalized, 200, meta);
  } catch {
    return errorResponse("Failed to fetch category products", 500);
  }
}
