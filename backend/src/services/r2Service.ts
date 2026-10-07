import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // Force single-part uploads for smaller files to avoid multipart minimum size requirements
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL!;

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export class R2Service {
  /**
   * Upload a file to Cloudflare R2 with a custom key
   */
  static async uploadFile(
    filePath: string,
    key: string,
    contentType?: string
  ): Promise<UploadResult> {
    try {
      // Check file size first
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      // Cloudflare R2 has a minimum object size requirement
      // If file is too small, we'll pad it or handle it differently
      if (fileSizeInBytes < 1) {
        return {
          success: false,
          error: "File is empty or too small to upload to R2",
        };
      }

      // Read file as buffer to avoid multipart upload issues
      const fileBuffer = fs.readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType || "image/jpeg",
        // Add metadata to help with small files
        Metadata: {
          "original-size": fileSizeInBytes.toString(),
        },
        // Explicitly set content length to ensure single-part upload
        ContentLength: fileSizeInBytes,
      });
      const result = await r2Client.send(command);
      const url = `${PUBLIC_BASE_URL}/${key}`;

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      console.error("Error uploading to R2:", error);

      // Handle specific R2 errors
      if (error instanceof Error && error.message.includes("EntityTooSmall")) {
        return {
          success: false,
          error:
            "File is too small for R2 upload. Minimum size requirement not met.",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate a unique key for an image based on classification and ID
   */
  static generateImageKey(
    classification: string,
    id: string,
    originalExtension: string
  ): string {
    // Normalize classification name (remove special characters, preserve case)
    const normalizedClassification = classification
      .replace(/[^a-zA-Z0-9-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    // Pad ID with zeros to 7 digits
    const paddedId = id.padStart(7, "0");

    return `${normalizedClassification}_${paddedId}${originalExtension}`;
  }

  /**
   * Get the public URL for a given key
   */
  static getPublicUrl(key: string): string {
    return `${PUBLIC_BASE_URL}/${key}`;
  }

  /**
   * Check if a key is a valid R2 key (starts with classification prefix)
   */
  static isR2Key(key: string): boolean {
    // Check if the key follows our naming pattern: classification_id.extension
    return /^[a-z0-9_]+_\d{7}\.[a-zA-Z0-9]+$/.test(key);
  }

  /**
   * Rename an object in R2 by copying to the new key and deleting the old one
   */
  static async renameObject(
    oldKey: string,
    newKey: string
  ): Promise<UploadResult> {
    try {
      // Copy to new key
      const copy = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
      });
      await r2Client.send(copy);

      // Delete old key
      const del = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: oldKey });
      await r2Client.send(del);

      return { success: true, key: newKey, url: this.getPublicUrl(newKey) };
    } catch (error) {
      console.error("Error renaming R2 object:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if a file is too small for R2 upload
   */
  static isFileTooSmall(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      // R2 has a minimum object size requirement (usually 1 byte, but some cases need more)
      return stats.size < 1;
    } catch (error) {
      console.error("Error checking file size:", error);
      return true; // Assume too small if we can't check
    }
  }
}
