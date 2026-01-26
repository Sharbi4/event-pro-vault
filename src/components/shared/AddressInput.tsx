import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
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

export function AddressInput({ 
  value, 
  onChange, 
  disabled = false,
  showLabels = true,
  required = false 
}: AddressInputProps) {
  const updateField = (field: keyof AddressData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-3">
      {/* Street Address Line 1 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="text-sm font-medium">
            Street Address {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          value={value.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          placeholder="123 Main Street"
          disabled={disabled}
        />
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
        />
      </div>

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-6 gap-3">
        {/* City */}
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
          />
        </div>

        {/* State */}
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

        {/* Zip */}
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
