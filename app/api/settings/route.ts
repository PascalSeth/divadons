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
    const { currency } = json;

    // Validate currency if provided
    const validCurrencies = ["USD", "EUR", "GBP", "NGN"];
    if (currency && !validCurrencies.includes(currency)) {
      return errorResponse("Invalid currency value", 400);
    }

    // Get or create the settings
    let settings = await prisma.setting.findFirst();

    if (settings) {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          currency: currency || settings.currency,
        },
      });
    } else {
      settings = await prisma.setting.create({
        data: {
          currency: currency || "USD",
        },
      });
    }

    return successResponse(settings, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    return errorResponse("Failed to update settings", 500);
  }
}
