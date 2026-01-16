import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { LoadScript, Libraries } from '@react-google-maps/api';

// Define all libraries needed across the app - must be stable reference
const libraries: Libraries = ['places'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: false,
});

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [googleApiKey, setGoogleApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('google_maps_token') || '';
    setGoogleApiKey(key);
  }, []);

  // If no API key, just render children without the script
  if (!googleApiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: false }}>
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
      <GoogleMapsContext.Provider value={{ isLoaded: true, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
