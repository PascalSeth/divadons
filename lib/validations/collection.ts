import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const collectionListQuerySchema = paginationQuerySchema.extend({
  excludeIds: z.string().optional(),
});

const baseCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  gradient: z.string().optional(),
  image: z.string().min(1).optional(),
});

export const createCollectionSchema = baseCollectionSchema;

export const updateCollectionSchema = baseCollectionSchema.partial().extend({
  id: z.string().optional(),
});

export const collectionProductSchema = z.object({
  productId: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const collectionCategorySchema = z.object({
  categoryId: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

