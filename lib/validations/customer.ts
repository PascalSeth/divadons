import { z } from "zod";
import { paginationQuerySchema, emailSchema } from "./common";

export const customerListQuerySchema = paginationQuerySchema;

const baseCustomerSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
  phone: z.string().optional(),
});

export const createCustomerSchema = baseCustomerSchema;

export const updateCustomerSchema = baseCustomerSchema.partial();

export const customerAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

