import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const categoryListQuerySchema = paginationQuerySchema.extend({
  excludeCollectionId: z.string().optional(),
});

const baseCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  gradient: z.string().optional(),
  image: z.string().min(1).optional(),
});

export const createCategorySchema = baseCategorySchema;

export const updateCategorySchema = baseCategorySchema.partial().extend({
  // id is immutable once created
  id: z.string().optional(),
});

