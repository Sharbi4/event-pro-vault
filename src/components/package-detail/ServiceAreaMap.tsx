import { GoogleMap, Circle, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

interface ServiceAreaMapProps {
  lat: number;
  lng: number;
  radiusMiles: number;
  vendorName?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '12px',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export function ServiceAreaMap({ lat, lng, radiusMiles, vendorName }: ServiceAreaMapProps) {
  const { isLoaded, loadError, apiKey } = useGoogleMaps();

  // Convert miles to meters for the circle radius
  const radiusMeters = radiusMiles * 1609.34;

  // Calculate appropriate zoom level based on radius
  const getZoomLevel = (miles: number) => {
    if (miles <= 10) return 10;
    if (miles <= 25) return 9;
    if (miles <= 50) return 8;
    if (miles <= 100) return 7;
    return 6;
  };

  if (!apiKey) {
    return (
      <div className="rounded-xl bg-muted/50 border border-border p-6 flex items-center justify-center h-[200px]">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Service area: {radiusMiles} miles</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 flex items-center justify-center h-[200px]">
        <p className="text-sm text-destructive">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-[200px] rounded-xl" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>Service area: {radiusMiles} mile radius</span>
      </div>
      <div className="rounded-xl overflow-hidden border border-border shadow-sm">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat, lng }}
          zoom={getZoomLevel(radiusMiles)}
          options={mapOptions}
        >
          {/* Service area circle */}
          <Circle
            center={{ lat, lng }}
            radius={radiusMeters}
            options={{
              fillColor: 'hsl(var(--primary))',
              fillOpacity: 0.15,
              strokeColor: 'hsl(var(--primary))',
              strokeOpacity: 0.6,
              strokeWeight: 2,
            }}
          />
          {/* Vendor location marker */}
          <Marker
            position={{ lat, lng }}
            title={vendorName || 'Vendor location'}
          />
        </GoogleMap>
      </div>
    </div>
  );
}
