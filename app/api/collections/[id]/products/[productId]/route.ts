import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";

type RouteContext = {
  params: Promise<{ id: string; productId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: collectionId, productId } = await context.params;

    await prisma.collectionProduct.delete({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
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
      return errorResponse("Collection product link not found", 404);
    }

    return errorResponse("Failed to remove product from collection", 500);
  }
}

