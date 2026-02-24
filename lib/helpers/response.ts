import { NextResponse } from "next/server";

type SuccessPayload<T> = {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

type ErrorPayload = {
  success: false;
  error: string;
  details?: unknown;
};

export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: SuccessPayload<T>["meta"],
) {
  const body: SuccessPayload<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };

  return NextResponse.json(body, { status });
}

export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown,
) {
  const body: ErrorPayload = details
    ? { success: false, error: message, details }
    : { success: false, error: message };

  return NextResponse.json(body, { status });
}

