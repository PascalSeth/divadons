import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  collectionListQuerySchema,
  createCollectionSchema,
} from "@/lib/validations/collection";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = collectionListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize, excludeIds } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    // Parse excludeIds (comma-separated string) into array
    const excludeArray = excludeIds ? excludeIds.split(',').map(id => id.trim()) : [];

    const [total, collections] = await Promise.all([
      prisma.collection.count({
        where: excludeArray.length > 0 ? { NOT: { id: { in: excludeArray } } } : {},
      }),
      prisma.collection.findMany({
        where: excludeArray.length > 0 ? { NOT: { id: { in: excludeArray } } } : {},
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subtitle: true,
          description: true,
          color: true,
          gradient: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          categories: {
            orderBy: { sortOrder: "asc" },
            select: {
              sortOrder: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          products: {
            select: { productId: true },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(collections, 200, meta);
  } catch {
    return errorResponse("Failed to fetch collections", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createCollectionSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid collection payload", 400, details);
    }

    const data = parsed.data;

    const collection = await prisma.collection.create({
      data,
      select: {
        id: true,
        name: true,
        subtitle: true,
        description: true,
        color: true,
        gradient: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(collection, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Collection with this id already exists", 409);
    }

    return errorResponse("Failed to create collection", 500);
  }
}

