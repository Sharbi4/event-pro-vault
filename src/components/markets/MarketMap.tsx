import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Market } from '@/data/markets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, MapPin, Star } from 'lucide-react';
import { format } from 'date-fns';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 39.8283, lng: -98.5795 };

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

interface MarketMapProps {
  markets: Market[];
  onMarketSelect?: (marketId: string) => void;
  selectedMarketId?: string | null;
}

export function MarketMap({ markets, onMarketSelect, selectedMarketId }: MarketMapProps) {
  const [googleApiKey, setGoogleApiKey] = useState<string>(
    localStorage.getItem('google_maps_token') || ''
  );
  const [isTokenSet, setIsTokenSet] = useState(!!localStorage.getItem('google_maps_token'));
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: localStorage.getItem('google_maps_token') || '',
  });

  const handleSetToken = () => {
    if (googleApiKey.trim()) {
      localStorage.setItem('google_maps_token', googleApiKey.trim());
      setIsTokenSet(true);
      window.location.reload();
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (marketId: string) => {
    setActiveMarker(marketId);
    onMarketSelect?.(marketId);
    
    const market = markets.find(m => m.id === marketId);
    if (market && map) {
      map.panTo(market.coordinates);
      map.setZoom(12);
    }
  };

  // Pan to selected market
  useEffect(() => {
    if (selectedMarketId && map) {
      const market = markets.find(m => m.id === selectedMarketId);
      if (market) {
        map.panTo(market.coordinates);
        map.setZoom(12);
        setActiveMarker(selectedMarketId);
      }
    }
  }, [selectedMarketId, map, markets]);

  if (!isTokenSet) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card/50 rounded-xl p-8">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Google Maps API Key Required
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
          Enter your Google Maps API key to enable the map view. 
          Get one at <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
        </p>
        <div className="flex gap-2 w-full max-w-sm">
          <Input
            type="text"
            placeholder="AIza..."
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            className="flex-1"
          />
          <Button variant="gradient" onClick={handleSetToken}>
            <MapPin className="w-4 h-4 mr-2" />
            Set Key
          </Button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-card/50 rounded-xl p-8">
        <p className="text-destructive">Error loading Google Maps. Please check your API key.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            localStorage.removeItem('google_maps_token');
            setIsTokenSet(false);
          }}
        >
          Reset API Key
        </Button>
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
        {markets.map(market => (
          <Marker
            key={market.id}
            position={market.coordinates}
            onClick={() => handleMarkerClick(market.id)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: selectedMarketId === market.id ? 14 : 12,
              fillColor: market.type === 'farmers' ? '#22c55e' : '#f59e0b',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          >
            {activeMarker === market.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{market.type === 'farmers' ? '🥬' : '🛍️'}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{market.name}</h4>
                      <p className="text-xs text-gray-600">{market.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-gray-900">{market.rating}</span>
                    <span className="text-xs text-gray-500">({market.reviewCount} reviews)</span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>📅 Next: {format(new Date(market.nextDate), 'MMM d, yyyy')}</p>
                    <p>🎯 {market.availableSpots} spots available</p>
                    <p>💰 ${market.pricePerSpot}/spot</p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-border" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-foreground mb-2">Market Types</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Farmers Market</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Flea Market</span>
          </div>
        </div>
      </div>
    </div>
  );
}
