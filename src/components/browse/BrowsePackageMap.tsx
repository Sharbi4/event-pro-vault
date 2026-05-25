import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Zap, ShieldCheck } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { BrowsePackage } from '@/hooks/useBrowsePackages';
import { Link } from 'react-router-dom';

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

// Mock coordinates for demo - in real app, these would come from geocoding the service_area
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'nashville': { lat: 36.1627, lng: -86.7816 },
  'orlando': { lat: 28.5383, lng: -81.3792 },
};

function getCoordinatesForLocation(location: string | null): { lat: number; lng: number } | null {
  if (!location) return null;
  
  const locationLower = location.toLowerCase();
  
  // Check for exact match first
  if (locationCoordinates[locationLower]) {
    return locationCoordinates[locationLower];
  }
  
  // Check for partial match
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (locationLower.includes(key) || key.includes(locationLower)) {
      return coords;
    }
  }
  
  // Return random coordinates within US for demo purposes
  return {
    lat: 35 + Math.random() * 10,
    lng: -120 + Math.random() * 40
  };
}

interface BrowsePackageMapProps {
  packages: BrowsePackage[];
  onPackageSelect?: (packageId: string) => void;
  selectedPackageId?: string | null;
}

export function BrowsePackageMap({ packages, onPackageSelect, selectedPackageId }: BrowsePackageMapProps) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError, apiKey } = useGoogleMaps();

  // Build package coordinates map
  const packageCoordinates = packages.reduce((acc, pkg) => {
    const coords = getCoordinatesForLocation(pkg.vendor_location);
    if (coords) {
      // Add slight offset for packages at the same location
      const existingAtLocation = Object.values(acc).filter(
        c => Math.abs(c.lat - coords.lat) < 0.01 && Math.abs(c.lng - coords.lng) < 0.01
      ).length;
      
      acc[pkg.id] = {
        lat: coords.lat + (existingAtLocation * 0.02),
        lng: coords.lng + (existingAtLocation * 0.02)
      };
    }
    return acc;
  }, {} as Record<string, { lat: number; lng: number }>);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Fit bounds to show all markers
    if (packages.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      packages.forEach(pkg => {
        const coords = packageCoordinates[pkg.id];
        if (coords) {
          bounds.extend(coords);
        }
      });
      map.fitBounds(bounds, 50);
    }
  }, [packages, packageCoordinates]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (packageId: string) => {
    setActiveMarker(packageId);
    onPackageSelect?.(packageId);
    
    const coords = packageCoordinates[packageId];
    if (coords && map) {
      map.panTo(coords);
      map.setZoom(12);
    }
  };

  // Pan to selected package when it changes
  useEffect(() => {
    if (selectedPackageId && map) {
      const coords = packageCoordinates[selectedPackageId];
      if (coords) {
        map.panTo(coords);
        map.setZoom(12);
        setActiveMarker(selectedPackageId);
      }
    }
  }, [selectedPackageId, map, packageCoordinates]);

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

  const activePackage = packages.find(p => p.id === activeMarker);

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
        {packages.map(pkg => {
          const coords = packageCoordinates[pkg.id];
          if (!coords) return null;

          const isSelected = selectedPackageId === pkg.id || activeMarker === pkg.id;

          return (
            <Marker
              key={pkg.id}
              position={coords}
              onClick={() => handleMarkerClick(pkg.id)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 14 : 10,
                fillColor: isSelected ? '#f97316' : pkg.instant_book ? '#22c55e' : '#ec4899',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            >
              {activeMarker === pkg.id && activePackage && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 min-w-[220px] max-w-[280px]">
                    {/* Image */}
                    {activePackage.images[0] && (
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                        <img 
                          src={activePackage.images[0]} 
                          alt={activePackage.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {activePackage.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">{activePackage.vendor_name}</p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {activePackage.instant_book && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          <Zap className="w-2.5 h-2.5" />
                          Instant
                        </span>
                      )}
                      {activePackage.is_verified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    {/* Rating & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <RatingDisplay
                          avgRating={activePackage.avg_rating}
                          reviewCount={activePackage.review_count}
                          size="xs"
                          variant="inline"
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${activePackage.price}
                        <span className="text-xs font-normal text-gray-500">
                          /{activePackage.type === 'HOURLY' ? 'hr' : activePackage.type === 'PER_PERSON' ? 'person' : 'pkg'}
                        </span>
                      </span>
                    </div>
                    
                    {/* View Button */}
                    <Link 
                      to={`/packages/${activePackage.id}`}
                      className="block w-full mt-2 px-3 py-1.5 text-center text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      View Package
                    </Link>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
      
      {/* Map overlay border */}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-border" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-muted-foreground">Instant Book</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
            <span className="text-muted-foreground">Request Only</span>
          </div>
        </div>
      </div>
      
      {/* Package count */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
        <span className="text-sm font-medium text-foreground">{packages.length} packages</span>
      </div>
    </div>
  );
}
