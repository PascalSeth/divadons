import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { z } from "zod";

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  type: z.enum(["banner", "popup"]).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  linkText: z.string().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return errorResponse("Announcement not found", 404);
    }

    return successResponse(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return errorResponse("Failed to fetch announcement", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid input", 400, parsed.error.issues);
    }

    const data = parsed.data;

    // Handle date conversions
    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    return successResponse(announcement);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    console.error("Error updating announcement:", error);
    return errorResponse("Failed to update announcement", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.announcement.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    console.error("Error deleting announcement:", error);
    return errorResponse("Failed to delete announcement", 500);
  }
}
