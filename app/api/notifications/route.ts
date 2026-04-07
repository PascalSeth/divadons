import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const isAdmin = session.user.role === "admin";

    // If strictly in customer mode OR user is not an admin, fetch customer notifications
    if (mode === "customer" || !isAdmin) {
      const customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
      });

      if (!customer) {
        console.log(`[NOTIFICATIONS_GET] No customer record found for email: ${session.user.email}`);
        return successResponse([], 200);
      }

      const notifications = await prisma.notification.findMany({
        where: { customerId: customer.id, isAdmin: false },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      return successResponse(notifications, 200);
    } else {
      // Regular Admin mode: Fetch all recent admin notifications
      const notifications = await prisma.notification.findMany({
        where: { isAdmin: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return successResponse(notifications, 200);
    }
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return errorResponse("Failed to fetch notifications", 500);
  }
}

// Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const isAdmin = session.user.role === "admin";

    if (mode === "customer" || !isAdmin) {
      // Mark specific customer notifications as read
      const customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
      });

      if (!customer) {
        return successResponse({ count: 0 }, 200);
      }

      const update = await prisma.notification.updateMany({
        where: { customerId: customer.id, isRead: false, isAdmin: false },
        data: { isRead: true },
      });

      return successResponse({ count: update.count }, 200);
    } else {
      // Regular Admin mode: Mark all admin notifications as read
      await prisma.notification.updateMany({
        where: { isAdmin: true, isRead: false },
        data: { isRead: true },
      });
      return successResponse({ success: true }, 200);
    }
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
    return errorResponse("Failed to mark notifications as read", 500);
  }
}
