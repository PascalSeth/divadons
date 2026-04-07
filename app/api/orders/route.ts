import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/app/generated/prisma";

import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  orderListQuerySchema,
  createOrderSchema,
} from "@/lib/validations/order";

function generateOrderId() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  return `ORD-${timestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = orderListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize, status, startDate, endDate } = parsed.data;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const { skip, take } = paginate(page, pageSize);

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerId: true,
          total: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(orders, 200, meta);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createOrderSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid order payload", 400, details);
    }

    const { customerId, paymentMethod, shippingAddress, billingAddress, items } =
      parsed.data;

    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        status: "active",
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return errorResponse(
          `Product not found or inactive: ${item.productId}`,
          404,
        );
      }
      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for product ${product.name}`,
          409,
        );
      }
    }

    let total = new Prisma.Decimal(0);
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      total = total.plus(product.price.mul(item.quantity));
    }

    const orderWithItems = await prisma.$transaction(async (tx) => {
      const orderId = generateOrderId();

      const order = await tx.order.create({
        data: {
          id: orderId,
          customerId,
          total,
          status: "pending",
          paymentMethod: paymentMethod ?? null,
          shippingStreet: shippingAddress?.street ?? null,
          shippingCity: shippingAddress?.city ?? null,
          shippingState: shippingAddress?.state ?? null,
          shippingCountry: shippingAddress?.country ?? null,
          shippingPostalCode: shippingAddress?.postalCode ?? null,
          billingStreet: billingAddress?.street ?? null,
          billingCity: billingAddress?.city ?? null,
          billingState: billingAddress?.state ?? null,
          billingCountry: billingAddress?.country ?? null,
          billingPostalCode: billingAddress?.postalCode ?? null,
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => {
          const product = productMap.get(item.productId)!;
          return {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            size: item.size ?? null,
            color: item.color ?? null,
          };
        }),
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        select: {
          id: true,
          customerId: true,
          total: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
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

      return fullOrder!;
    });

    return successResponse(orderWithItems, 201);
  } catch {
    return errorResponse("Failed to create order", 500);
  }
}

