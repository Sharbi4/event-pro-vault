// Google Maps API key configuration
// Publishable key — must be set via env var and restricted by HTTP referrer
// in Google Cloud Console. No hardcoded fallback to avoid leaking a key in
// the source bundle / git history.

export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';

if (!GOOGLE_MAPS_API_KEY && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[googleMaps] VITE_GOOGLE_MAPS_API_KEY is not set. Map features will be disabled.'
  );
}
