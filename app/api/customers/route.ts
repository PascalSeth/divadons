import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  customerListQuerySchema,
  createCustomerSchema,
} from "@/lib/validations/customer";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = customerListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    const [total, customers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(customers, 200, meta);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch customers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createCustomerSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid customer payload", 400, details);
    }

    const data = parsed.data;

    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      return errorResponse("Customer with this email already exists", 409);
    }

    const customer = await prisma.customer.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return successResponse(customer, 201);
  } catch {
    return errorResponse("Failed to create customer", 500);
  }
}

