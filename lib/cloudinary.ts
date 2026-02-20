import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary
 */
export async function uploadFile(
  file: File,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
  } = {}
): Promise<UploadResult> {
  const { folder = "orthodox-learning-hub", resourceType = "auto" } = options;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              resourceType: result.resource_type,
            });
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        }
      )
      .end(buffer);
  });
}

/**
 * Upload an image specifically (with image optimizations)
 */
export async function uploadImage(
  file: File,
  folder: string = "orthodox-learning-hub/images"
): Promise<UploadResult> {
  return uploadFile(file, { folder, resourceType: "image" });
}

/**
 * Upload a document (PDF, etc.)
 */
export async function uploadDocument(
  file: File,
  folder: string = "orthodox-learning-hub/documents"
): Promise<UploadResult> {
  return uploadFile(file, { folder, resourceType: "raw" });
}

/**
 * Delete a file from Cloudinary by public ID
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Generate a thumbnail URL for a Cloudinary image
 */
export function getThumbnailUrl(
  publicId: string,
  width: number = 300,
  height: number = 200
): string {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
}

export { cloudinary };
