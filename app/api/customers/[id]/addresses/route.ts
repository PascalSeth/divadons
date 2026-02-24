import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { customerAddressSchema } from "@/lib/validations/customer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: customerId } = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
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

    return successResponse(addresses, 200);
  } catch {
    return errorResponse("Failed to fetch customer addresses", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: customerId } = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    const json = await request.json();
    const parsed = customerAddressSchema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.issues : parsed.error;
      return errorResponse("Invalid address payload", 400, details);
    }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      const address = await tx.customerAddress.create({
        data: {
          customerId,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          isDefault: data.isDefault ?? false,
        },
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

      return address;
    });

    return successResponse(result, 201);
  } catch {
    return errorResponse("Failed to create customer address", 500);
  }
}

