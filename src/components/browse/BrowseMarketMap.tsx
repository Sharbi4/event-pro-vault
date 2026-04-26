import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Star, Calendar, Users, DollarSign } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { BrowseMarket } from '@/hooks/useBrowseMarkets';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

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

// Market type to emoji/color
const marketTypeConfig: Record<string, { emoji: string; color: string }> = {
  'Farmers Market': { emoji: '🥬', color: '#22c55e' },
  'Flea Market': { emoji: '🛍️', color: '#f59e0b' },
  'Vendor Market': { emoji: '🏪', color: '#3b82f6' },
  'Night Market': { emoji: '🌙', color: '#8b5cf6' },
  'Pop-up Event': { emoji: '🎪', color: '#ec4899' },
  'Food Truck Roundup': { emoji: '🚚', color: '#f97316' },
  'Festival Vendor Area': { emoji: '🎉', color: '#ef4444' },
};

interface BrowseMarketMapProps {
  markets: BrowseMarket[];
  onMarketSelect?: (marketId: string) => void;
  selectedMarketId?: string | null;
}

export function BrowseMarketMap({ markets, onMarketSelect, selectedMarketId }: BrowseMarketMapProps) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError, apiKey } = useGoogleMaps();

  // Filter markets with valid coordinates
  const marketsWithCoords = markets.filter(m => m.lat != null && m.lng != null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Fit bounds to show all markers
    if (marketsWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      marketsWithCoords.forEach(market => {
        bounds.extend({ lat: market.lat!, lng: market.lng! });
      });
      map.fitBounds(bounds, 50);
    }
  }, [marketsWithCoords]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (marketId: string) => {
    setActiveMarker(marketId);
    onMarketSelect?.(marketId);
    
    const market = markets.find(m => m.id === marketId);
    if (market && market.lat && market.lng && map) {
      map.panTo({ lat: market.lat, lng: market.lng });
      map.setZoom(12);
    }
  };

  // Pan to selected market when it changes
  useEffect(() => {
    if (selectedMarketId && map) {
      const market = markets.find(m => m.id === selectedMarketId);
      if (market && market.lat && market.lng) {
        map.panTo({ lat: market.lat, lng: market.lng });
        map.setZoom(12);
        setActiveMarker(selectedMarketId);
      }
    }
  }, [selectedMarketId, map, markets]);

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

  const activeMarket = markets.find(m => m.id === activeMarker);
  const typeConfig = activeMarket ? marketTypeConfig[activeMarket.marketType] : null;

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
        {marketsWithCoords.map(market => {
          const isSelected = selectedMarketId === market.id || activeMarker === market.id;
          const config = marketTypeConfig[market.marketType] || { emoji: '🏪', color: '#6b7280' };

          return (
            <Marker
              key={market.id}
              position={{ lat: market.lat!, lng: market.lng! }}
              onClick={() => handleMarkerClick(market.id)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 16 : 12,
                fillColor: isSelected ? '#f97316' : config.color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            >
              {activeMarker === market.id && activeMarket && (
                <InfoWindow 
                  onCloseClick={() => setActiveMarker(null)}
                  options={{
                    pixelOffset: new google.maps.Size(0, -10),
                    maxWidth: 280,
                  }}
                >
                  <div className="p-1 min-w-[240px] max-w-[280px]">
                    {/* Header with emoji and name */}
                    <div className="flex items-start gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${typeConfig?.color || '#6b7280'}20` }}
                      >
                        {typeConfig?.emoji || '🏪'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                          {activeMarket.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activeMarket.city}, {activeMarket.state}
                        </p>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-gray-900">
                        {activeMarket.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({activeMarket.reviewCount} reviews)
                      </span>
                    </div>
                    
                    {/* Info rows */}
                    <div className="space-y-1.5 mb-3">
                      {activeMarket.nextDate && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-gray-700">
                            Next: {format(parseISO(activeMarket.nextDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      
                      {activeMarket.totalSlotsRemaining > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-gray-700">
                            {activeMarket.totalSlotsRemaining} spots available
                          </span>
                        </div>
                      )}
                      
                      {activeMarket.minPrice && (
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-gray-700">
                            ${activeMarket.minPrice}/spot
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* View Button */}
                    <Link 
                      to={`/market/${activeMarket.id}`}
                      className="block w-full px-3 py-2 text-center text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Reserve a Spot
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">Farmers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-muted-foreground">Flea</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="text-muted-foreground">Night</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-muted-foreground">Vendor</span>
          </div>
        </div>
      </div>
      
      {/* Market count */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
        <span className="text-sm font-medium text-foreground">{markets.length} markets</span>
      </div>
    </div>
  );
}
