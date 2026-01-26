import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { LoadScript, Libraries } from '@react-google-maps/api';

// Define all libraries needed across the app - must be stable reference
const libraries: Libraries = ['places'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: boolean;
  apiKey: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: false,
  apiKey: '',
});

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Use environment variable for API key
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Debug logging
  useEffect(() => {
    console.log('[GoogleMapsContext] API Key available:', !!googleApiKey);
    console.log('[GoogleMapsContext] API Key length:', googleApiKey?.length || 0);
  }, [googleApiKey]);

  // If no API key, just render children without the script
  if (!googleApiKey) {
    console.log('[GoogleMapsContext] No API key - rendering without LoadScript');
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: false, apiKey: '' }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  console.log('[GoogleMapsContext] Loading Google Maps with key');

  return (
    <LoadScript
      googleMapsApiKey={googleApiKey}
      libraries={libraries}
      onLoad={() => {
        console.log('[GoogleMapsContext] Google Maps loaded successfully');
        setIsLoaded(true);
      }}
      onError={(error) => {
        console.error('[GoogleMapsContext] Google Maps load error:', error);
        setLoadError(true);
      }}
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey: googleApiKey }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
