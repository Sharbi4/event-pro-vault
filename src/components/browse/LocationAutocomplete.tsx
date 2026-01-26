import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { toast } from 'sonner';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    formatted_address: string;
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  showGeolocation?: boolean;
}

export const LocationAutocomplete = forwardRef<HTMLDivElement, LocationAutocompleteProps>(({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Where",
  className,
  showGeolocation = true,
}, forwardedRef) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, apiKey } = useGoogleMaps();

  // Combine refs
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [forwardedRef]);

  // Initialize services when API is loaded
  useEffect(() => {
    if (isLoaded && apiKey) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy element for PlacesService
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded, apiKey]);

  // Handle geolocation
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        if (geocoderRef.current && isLoaded) {
          geocoderRef.current.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setIsGeolocating(false);
              
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                // Find city and state from address components
                let city = '';
                let state = '';
                
                for (const component of results[0].address_components) {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  }
                  if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  }
                }

                const displayValue = city ? (state ? `${city}, ${state}` : city) : results[0].formatted_address;
                onChange(displayValue);
                
                if (onPlaceSelect) {
                  onPlaceSelect({
                    formatted_address: results[0].formatted_address,
                    lat: latitude,
                    lng: longitude,
                    city,
                    state,
                  });
                }

                toast.success('Location detected');
              } else {
                toast.error('Could not determine your location');
              }
            }
          );
        } else {
          setIsGeolocating(false);
          // Fallback without geocoding
          onChange(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      (error) => {
        setIsGeolocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An error occurred while getting your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [isLoaded, onChange, onPlaceSelect]);

  // Fetch suggestions when input changes
  const fetchSuggestions = useCallback((input: string) => {
    if (!input.trim() || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        types: ['(cities)'], // Focus on cities for location search
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  // Debounced input handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && isFocused) {
        fetchSuggestions(value);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, isFocused, fetchSuggestions]);

  // Handle place selection
  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    onChange(prediction.structured_formatting.main_text);
    setIsOpen(false);
    setSuggestions([]);

    // Get full place details if callback provided
    if (onPlaceSelect && placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: prediction.place_id, fields: ['geometry', 'formatted_address', 'name', 'address_components'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            let city = '';
            let state = '';
            
            if (place.address_components) {
              for (const component of place.address_components) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                }
              }
            }

            onPlaceSelect({
              formatted_address: place.formatted_address || '',
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
              city,
              state,
            });
          }
        }
      );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const currentRef = containerRef.current;
      if (currentRef && !currentRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no API key, show basic input with geolocation
  if (!apiKey) {
    return (
      <div ref={setRefs} className={cn("flex items-center gap-2", className)}>
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm w-full"
        />
        {showGeolocation && (
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="p-1 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary disabled:opacity-50"
            title="Use my location"
          >
            {isGeolocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={setRefs} className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm w-full"
        />
        {showGeolocation && (
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="p-1 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary disabled:opacity-50"
            title="Use my location"
          >
            {isGeolocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </button>
        )}
        {!isLoaded && apiKey && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[280px] -ml-4">
          <div className="py-2">
            {suggestions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

LocationAutocomplete.displayName = 'LocationAutocomplete';