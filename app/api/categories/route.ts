import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { categoryListQuerySchema, createCategorySchema } from "@/lib/validations/category";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = categoryListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    const [total, categories] = await Promise.all([
      prisma.category.count(),
      prisma.category.findMany({
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
          productCount: true,
          createdAt: true,
          updatedAt: true,
          collections: {
            select: {
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(categories, 200, meta);
  } catch {
    return errorResponse("Failed to fetch categories", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createCategorySchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid category payload", 400, details);
    }

    const data = parsed.data;

    const category = await prisma.category.create({
      data,
      select: {
        id: true,
        name: true,
        subtitle: true,
        description: true,
        color: true,
        gradient: true,
        productCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const normalized = {
      ...category,
      imageUrl: buildSupabasePublicUrl(
        "category",
        `${category.id}.jpg`,
      ),
    };

    return successResponse(normalized, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Category with this id already exists", 409);
    }

    return errorResponse("Failed to create category", 500);
  }
}

