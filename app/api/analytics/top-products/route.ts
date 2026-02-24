import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";

export async function GET() {
  try {
    await requireAdmin();

    const top = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const productIds = top
      .map((t) => t.productId)
      .filter((id): id is string => !!id);

    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            featured: true,
            bestseller: true,
          },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    const results = top.map((t) => ({
      productId: t.productId,
      productName: t.productName,
      totalQuantity: t._sum.quantity ?? 0,
      product: t.productId ? productMap.get(t.productId) ?? null : null,
    }));

    return successResponse(results, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch top products analytics", 500);
  }
}

