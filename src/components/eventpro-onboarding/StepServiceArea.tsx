import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, DollarSign, Info } from 'lucide-react';
import { ServiceAreaData } from '@/hooks/useEventProOnboarding';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StepServiceAreaProps {
  data: ServiceAreaData;
  onChange: (data: ServiceAreaData) => void;
}

export function StepServiceArea({ data, onChange }: StepServiceAreaProps) {
  const { isLoaded, apiKey } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(data.formattedAddress);

  const updateField = <K extends keyof ServiceAreaData>(
    field: K,
    value: ServiceAreaData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Extract city and state from address components
    let city = '';
    let state = '';
    place.address_components?.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
    });

    onChange({
      ...data,
      formattedAddress: place.formatted_address || '',
      city,
      state,
      lat,
      lng,
    });
    setInputValue(place.formatted_address || '');
  }, [data, onChange]);

  const serviceAreaOptions = [
    { id: 'on-site', label: 'I travel to venues', description: 'You go to the customer' },
    { id: 'come-to-me', label: 'Customer comes to me', description: 'You have a fixed location' },
    { id: 'either', label: 'Either', description: 'You offer both options' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Where do you serve?
        </h2>
        <p className="text-muted-foreground text-sm">
          Set your base location and travel radius
        </p>
      </div>

      {/* Location Input */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">Base Location</span>
            <span className="text-destructive">*</span>
          </div>

          {!apiKey ? (
            <div className="space-y-2">
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  updateField('formattedAddress', e.target.value);
                }}
                placeholder="Enter your city and state (e.g., Phoenix, AZ)"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Enter your address manually
              </p>
            </div>
          ) : isLoaded ? (
            <LocationAutocomplete
              value={inputValue}
              onChange={setInputValue}
              onPlaceSelect={handlePlaceSelect}
            />
          ) : (
            <div className="h-12 bg-muted animate-pulse rounded-lg" />
          )}

          {data.city && data.state && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span>Serving from {data.city}, {data.state}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Radius */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <span className="font-medium">Travel Radius</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {data.travelRadiusMiles} miles
            </span>
          </div>

          <Slider
            value={[data.travelRadiusMiles]}
            onValueChange={([value]) => updateField('travelRadiusMiles', value)}
            min={5}
            max={150}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 mi</span>
            <span>150 mi</span>
          </div>

          {/* Travel Fee Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Charge travel fee beyond radius</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">You can set specific travel fees per package</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={data.travelFeeEnabled}
              onCheckedChange={(checked) => updateField('travelFeeEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Area Type */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Service Type</span>
            <span className="text-xs text-muted-foreground">(optional)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {serviceAreaOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateField('serviceAreaType', option.id as 'on-site' | 'come-to-me' | 'either')}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all',
                  data.serviceAreaType === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {data.serviceAreaType === option.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {data.formattedAddress && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-center">
            <span className="font-medium">Preview:</span>{' '}
            Serving within <span className="text-primary font-bold">{data.travelRadiusMiles} miles</span> of{' '}
            <span className="font-medium">{data.city || data.formattedAddress}</span>
            {data.state && `, ${data.state}`}
          </p>
        </div>
      )}
    </div>
  );
}

// Simple location autocomplete component
function LocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input,
        types: ['(cities)'],
        componentRestrictions: { country: 'us' },
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setIsOpen(true);
        }
      }
    );
  }, []);

  const handleSelect = (placeId: string, description: string) => {
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );
    service.getDetails(
      { placeId, fields: ['geometry', 'formatted_address', 'address_components'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          onPlaceSelect(place);
          setIsOpen(false);
          setSuggestions([]);
        }
      }
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search for a city..."
          className="h-12 pl-10"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion.place_id, suggestion.description)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors text-sm"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
