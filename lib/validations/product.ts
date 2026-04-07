import { z } from "zod";
import { paginationQuerySchema, booleanStringSchema } from "./common";

export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]).optional(),
  featured: booleanStringSchema.optional(),
  bestseller: booleanStringSchema.optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

const baseProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  subcategory: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  currency: z.enum(["USD", "EUR", "GBP", "NGN"]).optional().default("USD"),
  description: z.string().optional(),
  // Allow either full URLs or Supabase object paths
  images: z.array(z.string().min(1)).min(1),
  color: z.string().optional(),
  sizes: z.array(z.string().min(1)).optional().default([]),
  featured: z.boolean().optional().default(false),
  bestseller: z.boolean().optional().default(false),
  vegan: z.boolean().optional().default(false),
  concern: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional().default(0),
  status: z
    .enum(["active", "inactive", "out_of_stock"])
    .optional()
    .default("active"),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.coerce.number().int().min(0),
        priceOverride: z.coerce.number().nonnegative().optional(),
      })
    )
    .optional(),
});

export const createProductSchema = baseProductSchema;

export const updateProductSchema = baseProductSchema.partial();

