// Google Maps API key configuration
// This key is a publishable key and is safe to include in frontend code
// Security is handled via domain restrictions in Google Cloud Console

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// For development/testing when env var isn't available, you can set a fallback:
// export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
