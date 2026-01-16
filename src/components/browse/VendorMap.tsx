import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Vendor } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, MapPin } from 'lucide-react';

// Vendor location coordinates (mock data based on their cities)
const vendorCoordinates: Record<string, [number, number]> = {
  'v1': [-118.2437, 34.0522],   // Los Angeles
  'v2': [-80.1918, 25.7617],    // Miami
  'v3': [-74.006, 40.7128],     // New York
  'v4': [-122.4194, 37.7749],   // San Francisco
  'v5': [-115.1398, 36.1699],   // Las Vegas
  'v6': [-97.7431, 30.2672],    // Austin
  'v7': [-104.9903, 39.7392],   // Denver
  'v8': [-117.1611, 32.7157],   // San Diego
};

interface VendorMapProps {
  vendors: Vendor[];
  onVendorSelect?: (vendorId: string) => void;
  selectedVendorId?: string | null;
}

export function VendorMap({ vendors, onVendorSelect, selectedVendorId }: VendorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox_token') || ''
  );
  const [isTokenSet, setIsTokenSet] = useState(!!localStorage.getItem('mapbox_token'));

  const handleSetToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setIsTokenSet(true);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet) return;

    const token = localStorage.getItem('mapbox_token');
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3.5,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for each vendor
    vendors.forEach(vendor => {
      const coords = vendorCoordinates[vendor.id];
      if (!coords || !map.current) return;

      const el = document.createElement('div');
      el.className = 'vendor-marker';
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
          selectedVendorId === vendor.id 
            ? 'bg-gradient-to-br from-primary to-accent ring-2 ring-white shadow-lg scale-110' 
            : 'bg-gradient-to-br from-orange-500 to-fuchsia-500'
        }">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
      `;

      el.addEventListener('click', () => {
        onVendorSelect?.(vendor.id);
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div class="p-2 bg-card rounded-lg min-w-[180px]">
          <h4 class="font-semibold text-foreground text-sm">${vendor.name}</h4>
          <p class="text-xs text-muted-foreground">${vendor.location}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-yellow-500">★</span>
            <span class="text-xs font-medium">${vendor.avgRating}</span>
            <span class="text-xs text-muted-foreground">(${vendor.reviewCount})</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [vendors, isTokenSet, selectedVendorId, onVendorSelect]);

  // Fly to selected vendor
  useEffect(() => {
    if (!map.current || !selectedVendorId) return;
    const coords = vendorCoordinates[selectedVendorId];
    if (coords) {
      map.current.flyTo({
        center: coords,
        zoom: 10,
        duration: 1500,
      });
    }
  }, [selectedVendorId]);

  if (!isTokenSet) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card/50 rounded-xl p-8">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Mapbox Token Required
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
          Enter your Mapbox public token to enable the map view. 
          Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
        <div className="flex gap-2 w-full max-w-sm">
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="flex-1"
          />
          <Button variant="gradient" onClick={handleSetToken}>
            <MapPin className="w-4 h-4 mr-2" />
            Set Token
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-border" />
    </div>
  );
}
