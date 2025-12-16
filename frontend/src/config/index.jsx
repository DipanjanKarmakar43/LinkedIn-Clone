// frontend/src/config/index.jsx
const { default: axios } = require("axios");

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const clientServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Helper function to get image URL
// Since Cloudinary URLs are already complete, we just return them
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default.jpg";
  
  // If it's already a full URL (Cloudinary), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fallback for local images (backward compatibility)
  return `${baseURL}/${imagePath}`;
};