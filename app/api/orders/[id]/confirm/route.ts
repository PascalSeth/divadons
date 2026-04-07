import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";

/**
 * MANUAL PAYMENT CONFIRMATION
 * This endpoint allows admins to manually fulfill a 'pending' order if the 
 * Stripe webhook fails to reach the server.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true }
    });

    if (!order) return errorResponse("Order not found", 404);
    if (order.status !== 'pending') return errorResponse("Order is already processed or cancelled", 400);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          status: 'processing',
          paymentMethod: 'manual_admin'
        },
        include: { items: true, customer: true }
      });

      // 2. Create local payment record
      await tx.paymentTransaction.create({
        data: {
          orderId: id,
          stripePaymentIntentId: `manual_${id}_${Date.now()}`,
          amount: Number(updatedOrder.total),
          status: 'succeeded',
          currency: updatedOrder.currency || 'USD',
        }
      });

      // 3. Decrement Inventory
      for (const item of updatedOrder.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity }
            }
          });
        }
      }

      return updatedOrder;
    });

    // 4. Send Notifications in background
    if (updated.customer) {
      // Email
      import('@/lib/email').then(({ sendOrderConfirmationEmail }) => {
        sendOrderConfirmationEmail(updated.customer!.email, updated.id, Number(updated.total));
      }).catch(e => console.error('[MANUAL_CONFIRM_EMAIL_ERROR]', e));

      // Notification
      await prisma.notification.create({
        data: {
          title: "Order Confirmed!",
          message: `Your payment was manually confirmed and order ${updated.id} is now processing.`,
          type: "order_status",
          orderId: updated.id,
          customerId: updated.customer.id,
          isAdmin: false,
        }
      });
    }

    return successResponse(updated, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) return errorResponse(error.message, error.status);
    console.error("[MANUAL_CONFIRM_ERROR]", error);
    return errorResponse("Failed to confirm order manually", 500);
  }
}
