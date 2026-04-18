// In development, we use localhost:5000. 
// In production, we use the URL provided by the VITE_API_URL environment variable.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
