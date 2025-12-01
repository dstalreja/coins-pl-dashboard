// API Configuration
// Render backend URL: https://coins-pl-dashboard.onrender.com
// In production (Vercel), set VITE_API_BASE_URL environment variable to the Render URL above
// In development, defaults to localhost
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

