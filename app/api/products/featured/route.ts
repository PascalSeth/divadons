import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        subcategory: true,
        price: true,
        description: true,
        images: true,
      },
    });
    return successResponse(products, 200);
  } catch (error) {
    return errorResponse("Failed to fetch featured products", 500);
  }
}
