import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateCollectionSchema } from "@/lib/validations/collection";
import { buildSupabasePublicUrl } from "@/lib/helpers/supabase-images";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subtitle: true,
        description: true,
        color: true,
        gradient: true,
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
                subtitle: true,
                image: true,
                color: true,
                gradient: true,
                products: {
                  where: { status: "active" },
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    featured: true,
                    bestseller: true,
                    status: true,
                    subcategory: true,
                  },
                },
              },
            },
          },
        },
        products: {
          orderBy: { sortOrder: "asc" },
          select: {
            sortOrder: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                featured: true,
                bestseller: true,
                status: true,
                subcategory: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", 404);
    }

    const normalized = {
      ...collection,
      imageUrl: buildSupabasePublicUrl(
        "collection",
        `${collection.id}.jpg`,
      ),
      categories: collection.categories.map((cc) => ({
        ...cc,
        category: cc.category
          ? {
              ...cc.category,
              imageUrl: buildSupabasePublicUrl("category", `${cc.category.id}.jpg`),
              products: cc.category.products.map((prod) => ({
                ...prod,
                images: prod.images.map((img) =>
                  buildSupabasePublicUrl("product", img),
                ),
              })),
            }
          : null,
      })),
      products: collection.products.map((cp) => ({
        ...cp,
        product: cp.product
          ? {
              ...cp.product,
              images: cp.product.images.map((img) =>
                buildSupabasePublicUrl("product", img),
              ),
            }
          : null,
      })),
    };

    return successResponse(normalized, 200);
  } catch {
    return errorResponse("Failed to fetch collection", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateCollectionSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid collection payload", 400, details);
    }

    const data = { ...parsed.data };
    delete (data as { id?: string }).id;

    const updated = await prisma.collection.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        subtitle: true,
        description: true,
        color: true,
        gradient: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const normalized = {
      ...updated,
      imageUrl: buildSupabasePublicUrl(
        "collection",
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
      return errorResponse("Collection not found", 404);
    }

    return errorResponse("Failed to update collection", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    await prisma.collection.delete({
      where: { id },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Collection not found", 404);
    }

    return errorResponse("Failed to delete collection", 500);
  }
}

