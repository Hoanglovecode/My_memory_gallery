export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function optimizeImageUrl(url: string, width: number = 1920): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_limit/`);
  }
  return url;
}
