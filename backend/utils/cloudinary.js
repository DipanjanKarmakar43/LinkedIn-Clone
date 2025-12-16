// backend/utils/cloudinary.js
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise} - Cloudinary upload response
 */
export const uploadToCloudinary = (
  fileBuffer,
  folder = "linkedin-clone",
  resourceType = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        transformation:
          resourceType === "image"
            ? [
                { width: 1000, height: 1000, crop: "limit" },
                { quality: "auto" },
              ]
            : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file to delete
 * @param {String} resourceType - 'image', 'video', 'raw'
 * @returns {Promise} - Cloudinary delete response
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1) return null;

  // Get everything after 'upload' and version (v1234567890)
  const pathParts = parts.slice(uploadIndex + 2);
  const fullPath = pathParts.join("/");

  // Remove file extension
  return fullPath.substring(0, fullPath.lastIndexOf("."));
};

/**
 * Determine resource type from mimetype
 * @param {String} mimetype - File mimetype
 * @returns {String} - Cloudinary resource type
 */
export const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("application/pdf") || mimetype.includes("document"))
    return "raw";
  return "auto";
};
