import { useCallback, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Vendor } from '@/types';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

// vendor location coordinates (mock data based on their cities)
const vendorCoordinates: Record<string, { lat: number; lng: number }> = {
  'v1': { lat: 34.0522, lng: -118.2437 },   // Los Angeles
  'v2': { lat: 25.7617, lng: -80.1918 },    // Miami
  'v3': { lat: 40.7128, lng: -74.006 },     // New York
  'v4': { lat: 37.7749, lng: -122.4194 },   // San Francisco
  'v5': { lat: 36.1699, lng: -115.1398 },   // Las Vegas
  'v6': { lat: 30.2672, lng: -97.7431 },    // Austin
  'v7': { lat: 39.7392, lng: -104.9903 },   // Denver
  'v8': { lat: 32.7157, lng: -117.1611 },   // San Diego
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of US

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

interface VendorMapProps {
  vendors: Vendor[];
  onVendorSelect?: (vendorId: string) => void;
  selectedVendorId?: string | null;
}

export function VendorMap({ vendors, onVendorSelect, selectedVendorId }: VendorMapProps) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError, apiKey } = useGoogleMaps();

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (vendorId: string) => {
    setActiveMarker(vendorId);
    onVendorSelect?.(vendorId);
    
    const coords = vendorCoordinates[vendorId];
    if (coords && map) {
      map.panTo(coords);
      map.setZoom(10);
    }
  };

  // Pan to selected vendor when it changes
  if (selectedVendorId && map) {
    const coords = vendorCoordinates[selectedVendorId];
    if (coords) {
      map.panTo(coords);
      map.setZoom(10);
    }
  }

  // Show fallback if no API key
  if (!apiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card/50 rounded-xl p-8">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">Map view unavailable</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card/50 rounded-xl p-8">
        <p className="text-destructive">Error loading Google Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-card/50 rounded-xl">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {vendors.map(vendor => {
          const coords = vendorCoordinates[vendor.id];
          if (!coords) return null;

          return (
            <Marker
              key={vendor.id}
              position={coords}
              onClick={() => handleMarkerClick(vendor.id)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: selectedVendorId === vendor.id ? 12 : 10,
                fillColor: selectedVendorId === vendor.id ? '#f97316' : '#ec4899',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            >
              {activeMarker === vendor.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 min-w-[180px]">
                    <h4 className="font-semibold text-gray-900 text-sm">{vendor.name}</h4>
                    <p className="text-xs text-gray-600">{vendor.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-xs font-medium text-gray-900">{vendor.avgRating}</span>
                      <span className="text-xs text-gray-500">({vendor.reviewCount})</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-border" />
    </div>
  );
}
