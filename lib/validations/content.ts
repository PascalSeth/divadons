import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const contentListQuerySchema = paginationQuerySchema.extend({
  type: z
    .enum(["hero_slide", "testimonial", "brand_value", "shipping_info"])
    .optional(),
});

const baseContentBlockSchema = z.object({
  type: z.enum(["hero_slide", "testimonial", "brand_value", "shipping_info"]),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  data: z.record(z.string(), z.any()),
});

export const createContentBlockSchema = baseContentBlockSchema;

export const updateContentBlockSchema = baseContentBlockSchema.partial();

export const reorderContentBlocksSchema = z.object({
  blocks: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
});

