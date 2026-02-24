import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { errorResponse, successResponse } from "@/lib/helpers/response";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();

    // Validate Supabase configuration
    if (!supabaseUrl) {
      console.error("Missing Supabase URL configuration");
      return errorResponse("Server configuration error: Missing Supabase URL", 500);
    }

    if (!supabaseServiceKey) {
      console.error("Missing Supabase service key configuration");
      return errorResponse("Server configuration error: Missing Supabase service key", 500);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const collection = formData.get("collection") as string;
    const product = formData.get("product") as string;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    if (!category && !collection && !product) {
      return errorResponse("Either category, collection, or product must be specified", 400);
    }

    // Determine bucket and path
    let bucket: string;
    let path: string;

    if (category) {
      bucket = "category";
      path = `${category}-${Date.now()}.jpg`;
    } else if (collection) {
      bucket = "collection";
      path = `${collection}-${Date.now()}.jpg`;
    } else {
      bucket = "product";
      path = `${product}-${Date.now()}.jpg`;
    }

    // Initialize Supabase client with service key (for server-side uploads)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return errorResponse(`Upload failed: ${error.message}`, 500);
    }

    // Build the public URL
    // Format: {supabaseUrl}/storage/v1/object/public/{bucket}/{path}
    const publicUrl = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${path}`;

    return successResponse({ url: publicUrl }, 200);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.status);
    }

    console.error("Upload error:", error);
    return errorResponse("Failed to upload file", 500);
  }
}
