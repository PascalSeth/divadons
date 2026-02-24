import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateCategorySchema } from "@/lib/validations/category";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
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
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            images: true,
            color: true,
            sizes: true,
            featured: true,
            bestseller: true,
            vegan: true,
            concern: true,
            stock: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    const normalized = {
      ...category,
      imageUrl: buildSupabasePublicUrl(
        "category",
        `${category.id}.jpg`,
      ),
      products: category.products.map((p) => ({
        ...p,
        images: p.images.map((img) =>
          buildSupabasePublicUrl("product", img),
        ),
      })),
    };

    return successResponse(normalized, 200);
  } catch {
    return errorResponse("Failed to fetch category", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateCategorySchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid category payload", 400, details);
    }

    const data = { ...parsed.data };
    delete (data as { id?: string }).id;

    const updated = await prisma.category.update({
      where: { id },
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
      ...updated,
      imageUrl: buildSupabasePublicUrl(
        "category",
        `${updated.id}.jpg`,
      ),
    };

    return successResponse(normalized, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Category not found", 404);
    }

    return errorResponse("Failed to update category", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    await prisma.category.delete({
      where: { id },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Category not found", 404);
    }

    if (e.code === "P2003") {
      return errorResponse(
        "Cannot delete category while products are linked to it",
        409,
      );
    }

    return errorResponse("Failed to delete category", 500);
  }
}

