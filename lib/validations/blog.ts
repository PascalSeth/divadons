import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const blogListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["draft", "published"]).optional(),
  category: z.string().optional(),
});

const baseBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  category: z.string().min(1),
  featuredImage: z.string().url().optional(),
  author: z.string().min(1),
  tags: z.array(z.string().min(1)).optional().default([]),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  publishedAt: z.coerce.date().optional(),
});

export const createBlogPostSchema = baseBlogPostSchema;

export const updateBlogPostSchema = baseBlogPostSchema.partial().extend({
  slug: z.string().optional(),
});

