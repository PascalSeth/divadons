import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

type RouteContext = {
  params: Promise<{ customerId: string; productId: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { customerId, productId } = await context.params;

    const [customer, product] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
    ]);

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        customerId,
        productId,
      },
      select: {
        customerId: true,
        productId: true,
        createdAt: true,
      },
    });

    return successResponse(item, 201);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Product already in wishlist", 409);
    }
    return errorResponse("Failed to add to wishlist", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { customerId, productId } = await context.params;

    await prisma.wishlistItem.delete({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Wishlist item not found", 404);
    }
    return errorResponse("Failed to remove from wishlist", 500);
  }
}

