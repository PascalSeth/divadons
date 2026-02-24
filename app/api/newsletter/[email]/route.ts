import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { emailSchema } from "@/lib/validations/common";

type RouteContext = {
  params: Promise<{ email: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { email: raw } = await context.params;
    const rawEmail = decodeURIComponent(raw);
    const parsed = emailSchema.safeParse(rawEmail);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid email address", 400, details);
    }

    const email = parsed.data;

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
      select: { id: true, active: true },
    });

    if (!existing) {
      return errorResponse("Subscriber not found", 404);
    }

    if (!existing.active) {
      return successResponse(null, 204);
    }

    await prisma.newsletterSubscription.update({
      where: { email },
      data: { active: false },
    });

    return successResponse(null, 204);
  } catch {
    return errorResponse("Failed to unsubscribe from newsletter", 500);
  }
}

