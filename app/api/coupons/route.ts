import { NextRequest } from "next/server";
import { ZodError, z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";

const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  minSpend: z.coerce.number().nonnegative().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
  active: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50");
    
    const { skip, take } = paginate(page, pageSize);

    const [total, coupons] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(coupons, 200, meta);
  } catch {
    return errorResponse("Failed to fetch coupons", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = couponSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid coupon payload", 400, details);
    }

    const coupon = await prisma.coupon.create({
      data: parsed.data,
    });

    return successResponse(coupon, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return errorResponse("Coupon code already exists", 400);
    }

    return errorResponse("Failed to create coupon", 500);
  }
}
