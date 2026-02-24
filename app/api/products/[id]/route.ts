import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateProductSchema } from "@/lib/validations/product";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        categoryId: true,
        subcategory: true,
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        collections: {
          select: {
            collectionId: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const normalized = {
      ...product,
      images: product.images.map((img) =>
        buildSupabasePublicUrl("product", img),
      ),
    };

    return successResponse(normalized, 200);
  } catch {
    return errorResponse("Failed to fetch product", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateProductSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid product payload", 400, details);
    }

    const data = parsed.data;

    const updated = await prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        categoryId: true,
        subcategory: true,
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
    });

    const normalized = {
      ...updated,
      images: updated.images.map((img) =>
        buildSupabasePublicUrl("product", img),
      ),
    };

    return successResponse(normalized, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Product not found", 404);
    }

    if (e.code === "P2003") {
      return errorResponse("Invalid category reference", 400);
    }

    return errorResponse("Failed to update product", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status: "inactive",
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return successResponse(updated, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Product not found", 404);
    }

    return errorResponse("Failed to deactivate product", 500);
  }
}

