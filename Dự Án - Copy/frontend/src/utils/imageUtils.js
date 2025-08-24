// Get backend URL from environment or default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${BACKEND_URL}/storage/${imagePath}`;
};

export const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // Already full URL
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};