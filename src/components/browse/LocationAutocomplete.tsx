import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Where",
  className,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const googleApiKey = localStorage.getItem('google_maps_token') || '';
  const { isLoaded } = useGoogleMaps();

  // Initialize services when API is loaded
  useEffect(() => {
    if (isLoaded && googleApiKey) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy element for PlacesService
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, [isLoaded, googleApiKey]);

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
        { placeId: prediction.place_id, fields: ['geometry', 'formatted_address', 'name'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            onPlaceSelect(place);
          }
        }
      );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no API key, show basic input
  if (!googleApiKey) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm w-full"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
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
        {!isLoaded && googleApiKey && (
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
}