import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  newsletterSubscribeSchema,
  newsletterListQuerySchema,
} from "@/lib/validations/newsletter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    
    // Allow getting just the count without full admin auth (for announcements page)
    if (url.searchParams.get("count") === "true") {
      const count = await prisma.newsletterSubscription.count({
        where: { active: true },
      });
      return successResponse({ count });
    }

    await requireAdmin();

    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = newsletterListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    const [total, subscribers] = await Promise.all([
      prisma.newsletterSubscription.count(),
      prisma.newsletterSubscription.findMany({
        skip,
        take,
        orderBy: { subscribedAt: "desc" },
        select: {
          id: true,
          email: true,
          subscribedAt: true,
          active: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(subscribers, 200, meta);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch newsletter subscribers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = newsletterSubscribeSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid newsletter payload", 400, details);
    }

    const { email } = parsed.data;

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
      select: { id: true, active: true },
    });

    if (existing) {
      if (!existing.active) {
        const updated = await prisma.newsletterSubscription.update({
          where: { email },
          data: { active: true },
          select: {
            id: true,
            email: true,
            subscribedAt: true,
            active: true,
          },
        });
        return successResponse(updated, 200);
      }
      return errorResponse("Email already subscribed", 409);
    }

    const subscriber = await prisma.newsletterSubscription.create({
      data: { email },
      select: {
        id: true,
        email: true,
        subscribedAt: true,
        active: true,
      },
    });

    return successResponse(subscriber, 201);
  } catch {
    return errorResponse("Failed to subscribe to newsletter", 500);
  }
}

