import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { collectionCategorySchema } from "@/lib/validations/collection";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: collectionId } = await context.params;

    const categories = await prisma.collectionCategory.findMany({
      where: { collectionId },
      orderBy: { sortOrder: "asc" },
      select: {
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            subtitle: true,
            description: true,
            color: true,
            gradient: true,
            image: true,
          },
        },
      },
    });

    const normalized = categories.map((cc) => ({
      ...cc,
      category: {
        ...cc.category,
        imageUrl: cc.category.image
          ? buildSupabasePublicUrl("category", cc.category.image)
          : null,
      },
    }));

    return successResponse(normalized, 200);
  } catch {
    return errorResponse("Failed to fetch collection categories", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: collectionId } = await context.params;
    const json = await request.json();
    const parsed = collectionCategorySchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid collection category payload", 400, details);
    }

    const { categoryId, sortOrder } = parsed.data;

    const link = await prisma.collectionCategory.create({
      data: {
        collectionId,
        categoryId,
        sortOrder,
      },
      select: {
        collectionId: true,
        categoryId: true,
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return successResponse(link, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Category is already in this collection", 409);
    }

    if (e.code === "P2003") {
      return errorResponse("Invalid collection or category reference", 400);
    }

    return errorResponse("Failed to add category to collection", 500);
  }
}
