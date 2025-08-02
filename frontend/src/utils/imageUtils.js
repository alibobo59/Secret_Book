// Get backend URL from environment or default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Default placeholder image
const DEFAULT_BOOK_IMAGE = '/assets/placeholder-book.png';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_BOOK_IMAGE;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path starting with /storage/, construct full URL
  if (imagePath.startsWith('/storage/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a storage path without /storage/ prefix
  return `${BACKEND_URL}/storage/${imagePath}`;
};

export const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // Already full URL
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Function to handle image loading errors
export const handleImageError = (event) => {
  event.target.src = DEFAULT_BOOK_IMAGE;
};