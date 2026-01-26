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

  // If no API key, just render children without the script
  if (!googleApiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: false, apiKey: '' }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={googleApiKey}
      libraries={libraries}
      onLoad={() => setIsLoaded(true)}
      onError={() => setLoadError(true)}
    >
      <GoogleMapsContext.Provider value={{ isLoaded: true, loadError, apiKey: googleApiKey }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
