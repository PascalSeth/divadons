import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateOrderStatusSchema } from "@/lib/validations/order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        total: true,
        status: true,
        paymentMethod: true,
        shippingStreet: true,
        shippingCity: true,
        shippingState: true,
        shippingCountry: true,
        shippingPostalCode: true,
        billingStreet: true,
        billingCity: true,
        billingState: true,
        billingCountry: true,
        billingPostalCode: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            quantity: true,
            price: true,
            size: true,
            color: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse(order, 200);
  } catch {
    return errorResponse("Failed to fetch order", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid order status payload", 400, details);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return successResponse(updated, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse("Failed to update order", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return successResponse(updated, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse("Failed to cancel order", 500);
  }
}

