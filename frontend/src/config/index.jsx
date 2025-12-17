// frontend/src/config/index.jsx
const { default: axios } = require("axios");

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const clientServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Helper function to get image URL
// Cloudinary URLs are complete URLs, so we return them as-is
// Legacy local images are prefixed with baseURL
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "default.jpg") {
    return "/default.jpg";
  }

  // If it's already a full Cloudinary URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Fallback for legacy local images (backward compatibility)
  return `${baseURL}/${imagePath}`;
};
