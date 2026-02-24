import { NextRequest } from "next/server";
import { ZodError } from "zod";
import type { Prisma } from "@/app/generated/prisma";

import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateContentBlockSchema } from "@/lib/validations/content";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateContentBlockSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid content block payload", 400, details);
    }

    const data = parsed.data;
    const payload = { ...data, data: data.data as Prisma.InputJsonValue };

    const updated = await prisma.contentBlock.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        type: true,
        sortOrder: true,
        active: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updated, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Content block not found", 404);
    }
    return errorResponse("Failed to update content block", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    await prisma.contentBlock.delete({
      where: { id },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Content block not found", 404);
    }
    return errorResponse("Failed to delete content block", 500);
  }
}

