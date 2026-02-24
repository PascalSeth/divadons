import { NextRequest } from "next/server";
import { ZodError } from "zod";
import type { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  contentListQuerySchema,
  createContentBlockSchema,
} from "@/lib/validations/content";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = contentListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize, type } = parsed.data;

    const where: Prisma.ContentBlockWhereInput = { active: true };
    if (type) where.type = type;

    const { skip, take } = paginate(page, pageSize);

    const [total, blocks] = await Promise.all([
      prisma.contentBlock.count({ where }),
      prisma.contentBlock.findMany({
        where,
        skip,
        take,
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          type: true,
          sortOrder: true,
          active: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(blocks, 200, meta);
  } catch {
    return errorResponse("Failed to fetch content blocks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createContentBlockSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid content block payload", 400, details);
    }

    const data = parsed.data;
    const payload = { ...data, data: data.data as Prisma.InputJsonValue };

    const block = await prisma.contentBlock.create({
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

    return successResponse(block, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to create content block", 500);
  }
}

