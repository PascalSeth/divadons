import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { getSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * Shared logic to fulfill an order once payment is confirmed.
 * Uses idempotency to ensure we don't process the same payment twice.
 */
async function fulfillOrder(orderId: string, paymentIntentId: string, session?: Stripe.Checkout.Session) {
  console.log('[FULFILL_ORDER] Attempting to fulfill:', orderId, '| PI:', paymentIntentId);

  return await prisma.$transaction(async (tx) => {
    // 1. Idempotency Check
    const existingTx = await tx.paymentTransaction.findUnique({
      where: { stripePaymentIntentId: paymentIntentId }
    });

    if (existingTx) {
      console.log('[WEBHOOK_SKIP] Transaction already processed for PI:', paymentIntentId);
      return null;
    }

    // 2. Fetch Order
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true }
    });

    if (!order) {
      console.error('[WEBHOOK_ERROR] Order not found in DB:', orderId);
      throw new Error(`Order ${orderId} not found`);
    }

    // 3. Update Order Status & Customer Name if available
    const customerName = session?.customer_details?.name;
    if (customerName && order.customer) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { name: customerName }
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { 
        status: 'processing',
        paymentMethod: session?.payment_method_types?.[0] || 'card',
      },
      include: { items: true, customer: true }
    });

    // 4. Create Payment Transaction record
    await tx.paymentTransaction.create({
      data: {
        orderId: updatedOrder.id,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: session?.customer as string || null,
        amount: Number(updatedOrder.total),
        currency: updatedOrder.currency || 'USD',
        status: 'succeeded',
      }
    });

    // 5. Inventory Management
    for (const item of updatedOrder.items) {
      if (item.productId) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock >= item.quantity) {
          const newStock = product.stock - item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              status: (newStock === 0) ? 'out_of_stock' : undefined
            },
          });

          if (newStock <= 5) {
            await tx.notification.create({
              data: {
                title: "Low Stock Alert",
                message: `${product.name} is low on stock (${newStock} remaining).`,
                type: "system",
                isAdmin: true,
              }
            });
          }
        }
      }
    }

    return updatedOrder;
  });
}

interface OrderWithCustomer {
  id: string;
  total: number | import('@/app/generated/prisma').Prisma.Decimal;
  customer: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

/**
 * Dispatch Notifications for a newly fulfilled order.
 */
async function dispatchNotifications(order: OrderWithCustomer) {
  try {
    if (order && order.customer) {
      const { email, name, id: customerId } = order.customer;
      
      // Background Email
      import('@/lib/email').then(({ sendOrderConfirmationEmail }) => {
        sendOrderConfirmationEmail(email, order.id, Number(order.total));
      }).catch(e => console.error('[EMAIL_ASYNC_ERROR]', e));

      // Customer Dashboard Notification
      await prisma.notification.create({
        data: {
          title: "Order Confirmed!",
          message: `Your payment was successful and order ${order.id} is now processing.`,
          type: "order_status",
          orderId: order.id,
          customerId,
          isAdmin: false,
        }
      });

      // Admin Dashboard Notification
      await prisma.notification.create({
        data: {
          title: "New Order Received",
          message: `Order #${order.id} from ${name || 'Guest'} ($${Number(order.total)})`,
          type: "order_status",
          orderId: order.id,
          isAdmin: true,
        }
      });

      console.log('[NOTIFICATIONS_DISPATCHED] for Order:', order.id);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[NOTIFICATION_DISPATCH_ERROR]', message);
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    message: 'Stripe Webhook Endpoint is REACHABLE. Use POST for actual webhooks.',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  console.log('>>> [WEBHOOK_TRACE] BEGIN POST REQUEST');
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  
  const settings = await getSettings();
  const stripe = await getServerStripe();
  const webhookSecret = (settings.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET)?.trim();

  console.log('>>> [WEBHOOK_TRACE] Signature Present:', !!signature);
  console.log('>>> [WEBHOOK_TRACE] Secret Present:', !!webhookSecret);
  
  if (webhookSecret) {
    console.log('>>> [WEBHOOK_TRACE] Secret Prefix:', webhookSecret.substring(0, 7) + '...');
  }

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      console.error('[WEBHOOK_ERROR] Missing signature or webhook secret');
      return new NextResponse('Webhook error: Missing signature or secret', { status: 400 });
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('>>> [WEBHOOK_TRACE] Event Constructed Successfully:', event.type);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[WEBHOOK_ERROR] Signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  console.log('[WEBHOOK_RECEIVED]', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const piId = session.payment_intent as string || session.id;

        if (orderId) {
          const order = await fulfillOrder(orderId, piId, session);
          if (order) await dispatchNotifications(order);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.orderId;

        if (orderId) {
          const order = await fulfillOrder(orderId, pi.id);
          if (order) await dispatchNotifications(order);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log('[WEBHOOK_FAILED] Payment failed for PI:', pi.id);
        break;
      }

      default:
        console.log(`[WEBHOOK_IGNORED] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[WEBHOOK_PROCESSING_ERROR]', message);
    return new NextResponse(message, { status: 500 });
  }
}
