import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["banner", "popup"]).default("banner"),
  bgColor: z.string().default("#1a1a1a"),
  textColor: z.string().default("#ffffff"),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("activeOnly") === "true";

    const now = new Date();

    const whereClause = activeOnly
      ? {
          active: true,
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
          AND: [
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } },
              ],
            },
          ],
        }
      : {};

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return errorResponse("Failed to fetch announcements", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid input", 400, parsed.error.issues);
    }

    const { title, message, type, bgColor, textColor, linkText, linkUrl, startDate, endDate } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        type,
        bgColor,
        textColor,
        linkText: linkText || null,
        linkUrl: linkUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active: true,
      },
    });

    return successResponse(announcement, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    console.error("Error creating announcement:", error);
    return errorResponse("Failed to create announcement", 500);
  }
}
