import { z } from "zod";
import { paginationQuerySchema, emailSchema } from "./common";

export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
});

export const newsletterListQuerySchema = paginationQuerySchema;

