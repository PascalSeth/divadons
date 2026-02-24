import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { collectionProductSchema } from "@/lib/validations/collection";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: collectionId } = await context.params;
    const json = await request.json();
    const parsed = collectionProductSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid collection product payload", 400, details);
    }

    const { productId, sortOrder } = parsed.data;

    const link = await prisma.collectionProduct.create({
      data: {
        collectionId,
        productId,
        sortOrder,
      },
      select: {
        collectionId: true,
        productId: true,
        sortOrder: true,
      },
    });

    return successResponse(link, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Product is already in this collection", 409);
    }

    if (e.code === "P2003") {
      return errorResponse("Invalid collection or product reference", 400);
    }

    return errorResponse("Failed to add product to collection", 500);
  }
}

