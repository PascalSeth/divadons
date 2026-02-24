import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { customerAddressSchema } from "@/lib/validations/customer";

type RouteContext = {
  params: Promise<{ id: string; adId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: customerId, adId } = await context.params;

    const json = await request.json();
    const parsed = customerAddressSchema.partial().safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid address payload", 400, details);
    }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.customerAddress.update({
        where: { id: adId },
        data,
        select: {
          id: true,
          street: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          isDefault: true,
          createdAt: true,
        },
      });

      return updated;
    });

    return successResponse(result, 200);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Address not found", 404);
    }
    return errorResponse("Failed to update customer address", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { adId } = await context.params;

    await prisma.customerAddress.delete({
      where: { id: adId },
    });

    return successResponse(null, 204);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2025") {
      return errorResponse("Address not found", 404);
    }
    return errorResponse("Failed to delete customer address", 500);
  }
}

