import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

type RouteContext = {
  params: Promise<{ customerId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    const items = await prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: {
        customerId: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            featured: true,
            bestseller: true,
            status: true,
          },
        },
      },
    });

    return successResponse(items, 200);
  } catch {
    return errorResponse("Failed to fetch wishlist", 500);
  }
}

