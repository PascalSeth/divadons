import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";

export async function GET() {
  try {
    // Get or create the settings (singleton)
    let settings = await prisma.setting.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.setting.create({
        data: {
          currency: "USD",
        },
      });
    }

    return successResponse(settings, 200);
  } catch {
    return errorResponse("Failed to fetch settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const {
      currency,
      siteName,
      logoUrl,
      faviconUrl,
      supportEmail,
      supportPhone,
      storeAddress,
      socialLinks,
      brandValues,
      metaTitle,
      metaDescription,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
    } = json;

    // Get the settings
    let settings = await prisma.setting.findFirst();

    const updateData = {
      currency,
      siteName,
      logoUrl,
      faviconUrl,
      supportEmail,
      supportPhone,
      storeAddress,
      socialLinks,
      brandValues,
      metaTitle,
      metaDescription,
      stripePublishableKey: stripePublishableKey?.trim(),
      stripeSecretKey: stripeSecretKey?.trim(),
      stripeWebhookSecret: stripeWebhookSecret?.trim(),
    };

    if (settings) {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.setting.create({
        data: updateData,
      });
    }

    return successResponse(settings, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    console.error("[SETTINGS_PUT_ERROR]", error);
    return errorResponse("Failed to update settings", 500);
  }
}
