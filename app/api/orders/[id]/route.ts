import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateOrderStatusSchema } from "@/lib/validations/order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const orderSelect = {
  id: true,
  customerId: true,
  total: true,
  status: true,
  currency: true,
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
  trackingId: true,
  carrierName: true,
  shippedAt: true,
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
  transactions: {
    select: {
      id: true,
      stripePaymentIntentId: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  },
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: orderSelect,
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

    // 1. Mandatory Field Validation for Shipped status
    if (parsed.data.status === 'shipped') {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        select: { trackingId: true, carrierName: true }
      });

      const trackingId = parsed.data.trackingId || existingOrder?.trackingId;
      const carrierName = parsed.data.carrierName || existingOrder?.carrierName;

      if (!trackingId || !carrierName) {
        return errorResponse("Carrier Name and Tracking ID are required to mark an order as shipped.", 400);
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        trackingId: parsed.data.trackingId,
        carrierName: parsed.data.carrierName,
        shippedAt: parsed.data.shippedAt || (parsed.data.status === 'shipped' ? new Date() : undefined),
      },
      select: orderSelect,
    });

    if (updated.customer && parsed.data.status) {
      // 1. Send Email Notification (Non-blocking)
      // 1. Send Email Notification (Non-blocking)
      import('@/lib/email').then(({ sendStatusUpdateEmail }) => {
        sendStatusUpdateEmail(
          updated.customer!.email, 
          updated.id, 
          updated.status, 
          { trackingId: updated.trackingId || undefined, carrierName: updated.carrierName || undefined }
        ).catch(emailError => {
          console.error('[EMAIL_STATUS_UPDATE_ERROR]', emailError);
        });
      }).catch(err => {
        console.error('[EMAIL_MODULE_LOAD_ERROR]', err);
      });

      // 2. Specialized Dashoard Notification
      try {
        let notificationTitle = "Order Status Updated";
        let notificationMessage = `Your order ${updated.id} is now ${updated.status}.${updated.trackingId ? ` Track it using: ${updated.trackingId}` : ''}`;

        if (updated.status === 'shipped') {
          notificationTitle = "Your order has been shipped! 📦";
          notificationMessage = `Order #${updated.id} is on its way via ${updated.carrierName}. Tracking ID: ${updated.trackingId}`;
        } else if (updated.status === 'processing') {
          notificationTitle = "Order Processing ⚙️";
          notificationMessage = `We've started preparing your order #${updated.id}. We'll notify you once it ships!`;
        } else if (updated.status === 'delivered') {
          notificationTitle = "Order Delivered! ✅";
          notificationMessage = `Your order #${updated.id} has been successfully delivered. We hope you love your purchase!`;
        } else if (updated.status === 'cancelled') {
          notificationTitle = "Order Cancelled ⚠️";
          notificationMessage = `Your order #${updated.id} has been cancelled. If you have questions, please contact support.`;
        }

        console.log(`[ORDER_NOTIFICATION] Creating for customer: ${updated.customerId} (Order: ${updated.id})`);
        await prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: "order_status",
            orderId: updated.id,
            customerId: updated.customerId,
            isAdmin: false // Explicitly customer-facing
          }
        });
      } catch (notifWarn) {
        console.warn('[ORDER_NOTIFICATION_WARN] Dashboard notification skipped:', notifWarn);
      }
    }

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
      select: orderSelect,
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

