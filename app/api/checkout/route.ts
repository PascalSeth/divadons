import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { getSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { errorResponse } from '@/lib/helpers/response';

/**
 * Generates a unique, stable order ID for the database.
 */
function generateOrderReference() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  return `ORD-${timestamp}-${Math.floor(Math.random() * 1000)}`;
}

interface CheckoutItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
  price: number;
  name: string;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerEmail: string;
  customerName?: string;
  orderId?: string;
}

import { Prisma, Order, OrderItem, Customer } from '@prisma/client';

type OrderWithItems = Order & {
  items: OrderItem[];
  customer: Customer | null;
};

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, customerName, orderId }: CheckoutRequest = await req.json();
    const settings = await getSettings();
    const stripe = await getServerStripe();

    type CheckoutSessionParams = Parameters<typeof stripe.checkout.sessions.create>[0];
    type StripeLineItem = NonNullable<NonNullable<CheckoutSessionParams>['line_items']>[number];

    let order: OrderWithItems | null = null;
    let line_items: StripeLineItem[] = [];
    let customerId = '';
    let emailForStripe = customerEmail;

    // 1. Existing Order Recovery
    if (orderId) {
      console.log('[CHECKOUT_RECOVERY] Attempting to recover order:', orderId);
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, customer: true }
      }) as OrderWithItems | null;

      if (!order) return errorResponse('Order not found', 404);
      if (order.status !== 'pending') return errorResponse('Order is already processed', 400);

      // Verify ownership if email is provided
      if (customerEmail && order.customer?.email !== customerEmail) {
        return errorResponse('Unauthorized: Order does not match customer info', 403);
      }

      emailForStripe = order.customer?.email || customerEmail;
      customerId = order.customerId;

      // Map existing order items to Stripe line items
      line_items = order.items.map((item: OrderItem) => ({
        price_data: {
          currency: order!.currency.toLowerCase(),
          product_data: {
            name: item.productName,
            images: [],
            description: `Color: ${item.color || 'N/A'}, Size: ${item.size || 'N/A'}`,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));
    } 
    // 2. Standard New Order Creation
    else {
      if (!items || items.length === 0) {
        return errorResponse('Cart is empty', 400);
      }

      console.log('[CHECKOUT_START] Processing new checkout for:', customerEmail);

      // Fetch products from DB for price integrity
      const productIds = items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map(dbProducts.map(p => [p.id, p]));

      // Build Stripe items and internal items
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) return errorResponse(`Product not found: ${item.productId}`, 404);
        
        line_items.push({
          price_data: {
            currency: settings.currency.toLowerCase(),
            product_data: {
              name: product.name,
              images: [],
              description: `Color: ${item.color || 'N/A'}, Size: ${item.size || 'N/A'}`,
            },
            unit_amount: Math.round(Number(product.price) * 100),
          },
          quantity: item.quantity,
        });
      }

      // Create/Find Customer
      let customer = await prisma.customer.findUnique({ where: { email: customerEmail } });
      if (!customer && customerEmail) {
        customer = await prisma.customer.create({
          data: { email: customerEmail, name: customerName || 'Guest Customer' }
        });
      }
      customerId = customer?.id || '';

      // Create PENDING Order
      const totalAmount = line_items.reduce((acc, item) => {
        return acc + ((item.price_data?.unit_amount || 0) * (item.quantity || 0));
      }, 0) / 100;

      const createdOrder = await prisma.order.create({
        data: {
          id: generateOrderReference(),
          customerId,
          total: totalAmount,
          status: 'pending',
          currency: settings.currency,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                size: item.size || null,
                color: item.color || null,
              };
            })
          }
        },
        include: { items: true, customer: true }
      });
      order = createdOrder as OrderWithItems;
    }

    // 0. Resolve Base URL for redirects
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer') || 
                   `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    
    let baseURL: string;
    try {
      baseURL = new URL(origin).origin;
    } catch (e) {
      baseURL = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    }

    // 3. Create the Checkout Session
    const idempotencyKey = `checkout_${order.id}_${new Date().getTime()}`; // unique key per attempt for same order

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseURL}/orders/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseURL}/cart?cancelled=true`,
      customer_email: emailForStripe || undefined,
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'NG', 'FR', 'DE'], 
      },
      billing_address_collection: 'required',
      metadata: {
        orderId: order.id,
        customerEmail: emailForStripe || 'guest',
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          customerEmail: emailForStripe || 'guest',
        }
      }
    }, {
      idempotencyKey,
    });

    console.log('[CHECKOUT_SUCCESS] Session created:', session.id, '| Request ID:', session.lastResponse?.requestId);
    
    return NextResponse.json({ success: true, url: session.url });

  } catch (err) {
    const stripe = await getServerStripe();
    
    // Detailed Error Handling based on Stripe Docs
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[STRIPE_ERROR]', {
        type: err.type,
        message: err.message,
        requestId: err.requestId,
        statusCode: err.statusCode
      });

      switch (err.type) {
        case 'StripeCardError':
          return errorResponse(`Payment declined: ${err.message}`, 402);
        case 'StripeRateLimitError':
          return errorResponse('Too many requests. Please try again later.', 429);
        case 'StripeInvalidRequestError':
          return errorResponse(`Invalid parameters: ${err.message}`, 400);
        case 'StripeAPIError':
          return errorResponse('Stripe API error. Please try again.', 500);
        case 'StripeConnectionError':
          return errorResponse('Network error. Check your connection.', 500);
        case 'StripeAuthenticationError':
          return errorResponse('Authentication failed. Check API keys.', 401);
        default:
          return errorResponse(err.message, err.statusCode || 500);
      }
    }

    console.error('[CHECKOUT_INTERNAL_ERROR]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}

