import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string; categoryId: string }>;
};

const updateCollectionCategorySchema = z.object({
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: collectionId, categoryId } = await context.params;
    const json = await request.json();
    const parsed = updateCollectionCategorySchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid payload", 400, details);
    }

    const { sortOrder } = parsed.data;

    const updated = await prisma.collectionCategory.update({
      where: {
        collectionId_categoryId: {
          collectionId,
          categoryId,
        },
      },
      data: sortOrder !== undefined ? { sortOrder } : {},
      select: {
        collectionId: true,
        categoryId: true,
        sortOrder: true,
      },
    });

    return successResponse(updated, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Category not found in this collection", 404);
    }

    return errorResponse("Failed to update collection category", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: collectionId, categoryId } = await context.params;

    await prisma.collectionCategory.delete({
      where: {
        collectionId_categoryId: {
          collectionId,
          categoryId,
        },
      },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Category not found in this collection", 404);
    }

    return errorResponse("Failed to remove category from collection", 500);
  }
}
