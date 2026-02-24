import { NextRequest } from "next/server";
import { ZodError } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  blogListQuerySchema,
  createBlogPostSchema,
} from "@/lib/validations/blog";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = blogListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize, status, category } = parsed.data;

    const where: Prisma.BlogPostWhereInput = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const { skip, take } = paginate(page, pageSize);

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
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
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(posts, 200, meta);
  } catch {
    return errorResponse("Failed to fetch blog posts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createBlogPostSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid blog post payload", 400, details);
    }

    const data = parsed.data;

    const post = await prisma.blogPost.create({
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
      },
    });

    return successResponse(post, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Blog post with this slug already exists", 409);
    }
    return errorResponse("Failed to create blog post", 500);
  }
}

