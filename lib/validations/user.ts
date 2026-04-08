import { z } from "zod";
import { paginationQuerySchema, emailSchema } from "./common";

export const userListQuerySchema = paginationQuerySchema;

const baseUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["admin", "editor", "customer"]).default("customer"),
  avatar: z.string().url().optional(),
});

export const createUserSchema = baseUserSchema;

export const updateUserSchema = baseUserSchema.partial().extend({
  password: z.string().min(8).optional(),
});

