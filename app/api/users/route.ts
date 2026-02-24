import { NextRequest } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { paginate, buildPaginationMeta } from "@/lib/helpers/pagination";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import {
  userListQuerySchema,
  createUserSchema,
} from "@/lib/validations/user";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const parsed = userListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid query parameters", 400, details);
    }

    const { page, pageSize } = parsed.data;
    const { skip, take } = paginate(page, pageSize);

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, pageSize);
    return successResponse(users, 200, meta);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const parsed = createUserSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid user payload", 400, details);
    }

    const data = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      return errorResponse("User with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return successResponse(user, 201);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to create user", 500);
  }
}

