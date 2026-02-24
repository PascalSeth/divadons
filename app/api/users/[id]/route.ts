import { NextRequest } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { updateUserSchema } from "@/lib/validations/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Failed to fetch user", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateUserSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid user payload", 400, details);
    }

    const data = parsed.data;

    const updateData: Prisma.UserUpdateInput = {
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return successResponse(updated, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("User not found", 404);
    }
    if (e.code === "P2002") {
      return errorResponse("User with this email already exists", 409);
    }
    return errorResponse("Failed to update user", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("User not found", 404);
    }
    return errorResponse("Failed to delete user", 500);
  }
}

