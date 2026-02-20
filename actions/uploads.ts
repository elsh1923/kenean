"use server";

import { requireAuth } from "@/lib/auth-utils";
import { uploadImage, uploadDocument, deleteFile } from "@/lib/cloudinary";
import { z } from "zod";

// Validation schemas
const uploadFileSchema = z.object({
  type: z.enum(["image", "document"]).default("image"),
  folder: z.string().optional(),
});

// Types
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

/**
 * Upload a file to Cloudinary (authenticated users)
 */
export async function uploadFile(formData: FormData) {
  try {
    await requireAuth();

    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image";
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    // Validate file type
    if (type === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid image type. Allowed types: JPEG, PNG, GIF, WebP",
      };
    }

    if (type === "document" && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid document type. Allowed types: PDF",
      };
    }

    let result;
    if (type === "image") {
      result = await uploadImage(
        file,
        folder || "orthodox-learning-hub/images"
      );
    } else {
      result = await uploadDocument(
        file,
        folder || "orthodox-learning-hub/documents"
      );
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to upload file" };
  }
}

/**
 * Delete a file from Cloudinary (authenticated users)
 */
export async function removeFile(publicId: string, resourceType: "image" | "raw" = "image") {
  try {
    await requireAuth();

    if (!publicId) {
      return { success: false, error: "No public ID provided" };
    }

    await deleteFile(publicId, resourceType);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete file" };
  }
}

/**
 * Upload multiple images (authenticated users)
 */
export async function uploadMultipleImages(formData: FormData) {
  try {
    await requireAuth();

    const files = formData.getAll("files") as File[];
    const folder = formData.get("folder") as string | null;

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    if (files.length > 10) {
      return { success: false, error: "Maximum 10 files allowed" };
    }

    // Validate all files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: `File ${file.name} is too large` };
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { success: false, error: `File ${file.name} has invalid type` };
      }
    }

    // Upload all files
    const results = await Promise.all(
      files.map((file) =>
        uploadImage(file, folder || "orthodox-learning-hub/images")
      )
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to upload files" };
  }
}
