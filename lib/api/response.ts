import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Create a success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success data
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Create an error response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error message
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status }
  );
}

/**
 * Create a validation error response from Zod errors
 *
 * @param error - Zod validation error
 * @returns NextResponse with validation errors
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(err.message);
  });

  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors,
    } as ApiResponse,
    { status: 422 }
  );
}

/**
 * Create an unauthorized response
 *
 * @param message - Error message (default: "Unauthorized")
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return errorResponse(message, 401);
}

/**
 * Create a forbidden response
 *
 * @param message - Error message (default: "Forbidden")
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return errorResponse(message, 403);
}

/**
 * Create a not found response
 *
 * @param message - Error message (default: "Not found")
 * @returns NextResponse with 404 status
 */
export function notFoundResponse(message: string = "Not found"): NextResponse {
  return errorResponse(message, 404);
}

/**
 * Create a server error response
 *
 * @param message - Error message (default: "Internal server error")
 * @returns NextResponse with 500 status
 */
export function serverErrorResponse(message: string = "Internal server error"): NextResponse {
  return errorResponse(message, 500);
}

/**
 * Handle API errors and return appropriate response
 *
 * @param error - Error object
 * @returns NextResponse with appropriate error response
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes("Unauthorized") || error.message.includes("not authenticated")) {
      return unauthorizedResponse(error.message);
    }

    if (error.message.includes("Forbidden") || error.message.includes("permission")) {
      return forbiddenResponse(error.message);
    }

    if (error.message.includes("not found")) {
      return notFoundResponse(error.message);
    }

    return errorResponse(error.message);
  }

  return serverErrorResponse();
}
