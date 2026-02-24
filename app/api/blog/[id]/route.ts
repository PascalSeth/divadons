import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateBlogPostSchema } from "@/lib/validations/blog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const post = await prisma.blogPost.findFirst({
      where: {
        slug: id,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        category: true,
        featuredImage: true,
        author: true,
        tags: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) {
      return errorResponse("Blog post not found", 404);
    }

    return successResponse(post, 200);
  } catch {
    return errorResponse("Failed to fetch blog post", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateBlogPostSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid blog post payload", 400, details);
    }

    const data = parsed.data;

    const updated = await prisma.blogPost.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        featuredImage: true,
        author: true,
        tags: true,
        status: true,
        publishedAt: true,
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
      return errorResponse("Blog post not found", 404);
    }
    if (e.code === "P2002") {
      return errorResponse("Blog post with this slug already exists", 409);
    }
    return errorResponse("Failed to update blog post", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Blog post not found", 404);
    }
    return errorResponse("Failed to delete blog post", 500);
  }
}

