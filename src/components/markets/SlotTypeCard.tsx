import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, Zap, Droplets, Wifi, Sun, TableIcon, 
  Armchair, Tent, Shield, Trash2, DoorOpen, 
  ParkingCircle, Car, Package, MapPin
} from 'lucide-react';
import { SlotType } from '@/hooks/useMarketDetail';

const amenityIcons: Record<string, React.ReactNode> = {
  'Power access': <Zap className="w-3 h-3" />,
  'Water access': <Droplets className="w-3 h-3" />,
  'Wi-Fi': <Wifi className="w-3 h-3" />,
  'Lighting': <Sun className="w-3 h-3" />,
  'Table provided': <TableIcon className="w-3 h-3" />,
  'Chairs provided': <Armchair className="w-3 h-3" />,
  'Tent allowed': <Tent className="w-3 h-3" />,
  'Tent provided': <Tent className="w-3 h-3" />,
  'Security': <Shield className="w-3 h-3" />,
  'Trash service': <Trash2 className="w-3 h-3" />,
  'Indoor': <DoorOpen className="w-3 h-3" />,
  'Loading zone': <Car className="w-3 h-3" />,
  'Parking pass': <ParkingCircle className="w-3 h-3" />,
};

interface SlotTypeCardProps {
  slotType: SlotType;
  isSelected: boolean;
  onSelect: () => void;
  availableCount?: number;
}

export function SlotTypeCard({ slotType, isSelected, onSelect, availableCount }: SlotTypeCardProps) {
  const pricingLabels: Record<string, string> = {
    per_day: '/day',
    per_event: '/event',
    per_weekend: '/weekend',
  };

  const getSize = () => {
    if (slotType.sizePreset) return slotType.sizePreset;
    if (slotType.widthFeet && slotType.lengthFeet) {
      return `${slotType.widthFeet}×${slotType.lengthFeet} ft`;
    }
    return null;
  };

  const size = getSize();

  return (
    <Card 
      variant={isSelected ? 'default' : 'glass'}
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{slotType.name}</h3>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {slotType.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ${slotType.price}
            </div>
            <div className="text-sm text-muted-foreground">
              {pricingLabels[slotType.pricingUnit] || '/day'}
            </div>
          </div>
        </div>

        {size && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Package className="w-4 h-4" />
            {size}
          </div>
        )}

        {slotType.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {slotType.amenities.slice(0, 6).map(amenity => (
              <Badge key={amenity} variant="secondary" className="text-xs gap-1">
                {amenityIcons[amenity] || <Check className="w-3 h-3" />}
                {amenity}
              </Badge>
            ))}
            {slotType.amenities.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{slotType.amenities.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {slotType.requirements.length > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Requirements:</span>{' '}
            {slotType.requirements.join(', ')}
          </div>
        )}

        {slotType.notes && (
          <p className="text-xs text-muted-foreground italic mb-3">
            {slotType.notes}
          </p>
        )}

        {availableCount !== undefined && (
          <div className="text-sm">
            {availableCount > 0 ? (
              <span className="text-trust font-medium">
                {availableCount} slot{availableCount !== 1 ? 's' : ''} available
              </span>
            ) : (
              <span className="text-destructive font-medium">Sold out</span>
            )}
          </div>
        )}

        <Button 
          variant={isSelected ? 'default' : 'outline'} 
          size="sm" 
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Selected' : 'Select this slot type'}
        </Button>
      </CardContent>
    </Card>
  );
}
