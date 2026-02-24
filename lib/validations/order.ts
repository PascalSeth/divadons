import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  postalCode: z.string().optional(),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  paymentMethod: z.string().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  items: z.array(orderItemInputSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

