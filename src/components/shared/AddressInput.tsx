import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LocateFixed, MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington DC' },
];

export interface AddressData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (value: AddressData) => void;
  disabled?: boolean;
  showLabels?: boolean;
  required?: boolean;
}

function parsePlace(place: google.maps.places.PlaceResult): Partial<AddressData> {
  const out: Partial<AddressData> = {};
  let streetNumber = '';
  let route = '';
  for (const c of place.address_components || []) {
    if (c.types.includes('street_number')) streetNumber = c.long_name;
    else if (c.types.includes('route')) route = c.long_name;
    else if (c.types.includes('locality')) out.city = c.long_name;
    else if (!out.city && c.types.includes('postal_town')) out.city = c.long_name;
    else if (!out.city && c.types.includes('sublocality_level_1')) out.city = c.long_name;
    else if (c.types.includes('administrative_area_level_1')) out.state = c.short_name;
    else if (c.types.includes('postal_code')) out.zip = c.long_name;
  }
  out.addressLine1 = [streetNumber, route].filter(Boolean).join(' ').trim();
  return out;
}

export function AddressInput({
  value,
  onChange,
  disabled = false,
  showLabels = true,
  required = false,
}: AddressInputProps) {
  const { isLoaded, apiKey } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const updateField = (field: keyof AddressData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  // Attach Google Places Autocomplete to street address input
  useEffect(() => {
    if (!isLoaded || !apiKey || !inputRef.current || autocompleteRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry'],
    });
    autocompleteRef.current = ac;

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place || !place.address_components) return;
      const parsed = parsePlace(place);
      onChange({
        addressLine1: parsed.addressLine1 || value.addressLine1,
        addressLine2: value.addressLine2,
        city: parsed.city || '',
        state: parsed.state || '',
        zip: parsed.zip || '',
      });
    });

    return () => {
      listener.remove();
      autocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, apiKey]);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    if (!isLoaded || !window.google?.maps?.Geocoder) {
      toast.error('Maps not ready yet, please try again');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          setIsGeolocating(false);
          if (status === 'OK' && results && results[0]) {
            const parsed = parsePlace(results[0] as unknown as google.maps.places.PlaceResult);
            onChange({
              addressLine1: parsed.addressLine1 || '',
              addressLine2: value.addressLine2,
              city: parsed.city || '',
              state: parsed.state || '',
              zip: parsed.zip || '',
            });
            toast.success('Address detected');
          } else {
            toast.error('Could not determine your address');
          }
        });
      },
      (err) => {
        setIsGeolocating(false);
        toast.error(err.code === err.PERMISSION_DENIED ? 'Location access denied' : 'Could not get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [isLoaded, onChange, value.addressLine2]);

  return (
    <div className="space-y-3">
      {/* Street Address Line 1 with Google Places autocomplete */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="text-sm font-medium flex items-center justify-between">
            <span>
              Street Address {required && <span className="text-destructive">*</span>}
            </span>
            {isLoaded && apiKey && (
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={isGeolocating || disabled}
                className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                title="Use my current location"
              >
                {isGeolocating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <LocateFixed className="w-3 h-3" />
                )}
                Use my location
              </button>
            )}
          </Label>
        )}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={value.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            placeholder="Start typing your address..."
            disabled={disabled}
            autoComplete="street-address"
            className="pl-9"
          />
        </div>
      </div>

      {/* Street Address Line 2 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="text-sm font-medium text-muted-foreground">
            Address Line 2 <span className="text-xs">(optional)</span>
          </Label>
        )}
        <Input
          value={value.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
          placeholder="Apt, Suite, Unit, Building, Floor, etc."
          disabled={disabled}
          autoComplete="address-line2"
        />
      </div>

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-3 space-y-1.5">
          {showLabels && (
            <Label className="text-sm font-medium">
              City {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Input
            value={value.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="City"
            disabled={disabled}
            autoComplete="address-level2"
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          {showLabels && (
            <Label className="text-sm font-medium">
              State {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={value.state}
            onValueChange={(val) => updateField('state', val)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 space-y-1.5">
          {showLabels && (
            <Label className="text-sm font-medium">
              Zip {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Input
            value={value.zip}
            onChange={(e) => updateField('zip', e.target.value)}
            placeholder="12345"
            maxLength={10}
            disabled={disabled}
            autoComplete="postal-code"
          />
        </div>
      </div>
    </div>
  );
}

// Helper to format address as single string
export function formatAddress(address: AddressData): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zip,
  ].filter(Boolean);
  return parts.join(', ');
}

// Helper to validate address
export function isAddressComplete(address: AddressData): boolean {
  return !!(
    address.addressLine1.trim() &&
    address.city.trim() &&
    address.state &&
    address.zip.trim()
  );
}
