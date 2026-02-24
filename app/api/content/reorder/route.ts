import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { reorderContentBlocksSchema } from "@/lib/validations/content";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = reorderContentBlocksSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid reorder payload", 400, details);
    }

    const { blocks } = parsed.data;

    await prisma.$transaction(
      blocks.map((block) =>
        prisma.contentBlock.update({
          where: { id: block.id },
          data: { sortOrder: block.sortOrder },
        }),
      ),
    );

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to reorder content blocks", 500);
  }
}

