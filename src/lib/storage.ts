import { supabase } from "./supabaseClient";

const BUCKET_NAME = "blog-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * Sanitizes a filename to be safe for storage
 */
const sanitizeFilename = (filename: string): string => {
  // Remove path separators and keep only safe characters
  return filename
    .replace(/^.*[\\/]/, "") // Remove path
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace unsafe chars with underscore
    .substring(0, 100); // Limit length
};

/**
 * Generates a unique storage path for a blog image.
 * Path convention: blog-images/{postId}/{variant}/{timestamp}-{filename}
 */
const generateStoragePath = (
  postId: string,
  filename: string,
  variant: "hero" | "inline"
): string => {
  const sanitized = sanitizeFilename(filename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = sanitized.split(".").pop() || "jpg";
  const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, "");
  return `${postId}/${variant}/${timestamp}-${random}-${nameWithoutExt}.${ext}`;
};

/**
 * Extracts the storage path from a public URL
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    // Supabase public URLs are typically:
    // https://<project>.supabase.co/storage/v1/object/public/blog-images/blog/...
    const match = url.match(/\/storage\/v1\/object\/public\/blog-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Uploads a blog image to Supabase Storage
 * @param file - The image file to upload
 * @param postId - The blog post ID (use "temp" for new posts)
 * @returns The public URL of the uploaded image
 */
export const uploadBlogImage = async (
  file: File,
  postId: string,
  variant: "hero" | "inline" = "inline"
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Generate storage path
  const path = generateStoragePath(postId, file.name, variant);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded image");
  }

  return urlData.publicUrl;
};

/**
 * Deletes a blog image from Supabase Storage
 * @param path - The storage path of the image to delete
 */
export const deleteBlogImageByPath = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Deletes a blog image by its public URL
 * @param url - The public URL of the image to delete
 */
export const deleteBlogImageByUrl = async (url: string): Promise<void> => {
  const path = extractPathFromUrl(url);
  if (!path) {
    throw new Error("Could not extract path from URL");
  }
  await deleteBlogImageByPath(path);
};
