import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";

export async function GET() {
  try {
    await requireAdmin();

    const [ordersAgg, totalOrders, totalCustomers, pendingOrders] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: {
            total: true,
          },
          where: {
            status: {
              not: "cancelled",
            },
          },
        }),
        prisma.order.count(),
        prisma.customer.count(),
        prisma.order.count({
          where: { status: "pending" },
        }),
      ]);

    const totalRevenue =
      ordersAgg._sum.total !== null
        ? Number(ordersAgg._sum.total)
        : 0;

    const summary = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingOrders,
    };

    return successResponse(summary, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch analytics summary", 500);
  }
}

