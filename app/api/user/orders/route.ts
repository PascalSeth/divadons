import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    // Find the customer associated with this user's email
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
    });

    if (!customer) {
      // User hasn't made any purchases yet, return empty list
      return successResponse([], 200);
    }

    // Fetch all orders for this customer, including items
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        transactions: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      },
    });

    return successResponse(orders, 200);
  } catch (error) {
    console.error("[USER_ORDERS_GET_ERROR]", error);
    return errorResponse("Failed to fetch user orders", 500);
  }
}
