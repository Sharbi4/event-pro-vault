import { Badge } from '@/components/ui/badge';
import { 
  Clock, Calendar, Zap, ShieldCheck, Users, MapPin, 
  Truck, Timer, Sparkles 
} from 'lucide-react';

interface PackageSummaryProps {
  name: string;
  description: string | null;
  category: string | null;
  type: string;
  pricingType: string | null;
  price: number;
  startingAt: number | null;
  minUnits: number;
  minHours: number | null;
  minGuests: number | null;
  durationMinutes: number | null;
  bookingMode: 'INSTANT' | 'REQUEST';
  travelRadius: number | null;
  pickupOnly: boolean | null;
  setupTime: number | null;
}

export function PackageSummary({
  name,
  description,
  category,
  type,
  pricingType,
  price,
  startingAt,
  minUnits,
  minHours,
  minGuests,
  durationMinutes,
  bookingMode,
  travelRadius,
  pickupOnly,
  setupTime
}: PackageSummaryProps) {
  const isInstant = bookingMode === 'INSTANT';
  
  // Format price display based on pricing type
  const getPriceDisplay = () => {
    const displayPrice = startingAt || price;
    const prefix = startingAt ? 'From ' : '';
    
    switch (pricingType?.toLowerCase() || type.toLowerCase()) {
      case 'hourly':
        return { price: `${prefix}$${displayPrice}`, unit: '/hour' };
      case 'daily':
        return { price: `${prefix}$${displayPrice}`, unit: '/day' };
      case 'flat':
      case 'fixed':
        return { price: `$${displayPrice}`, unit: ' flat rate' };
      case 'per_guest':
        return { price: `${prefix}$${displayPrice}`, unit: '/guest' };
      default:
        return { price: `${prefix}$${displayPrice}`, unit: type === 'HOURLY' ? '/hour' : '/day' };
    }
  };

  const priceDisplay = getPriceDisplay();

  // Generate highlight chips
  const highlights: { icon: React.ReactNode; label: string }[] = [];
  
  if (setupTime && setupTime > 0) {
    highlights.push({ icon: <Timer className="w-3 h-3" />, label: 'Setup included' });
  }
  if (travelRadius && travelRadius > 0 && !pickupOnly) {
    highlights.push({ icon: <Truck className="w-3 h-3" />, label: `Travels up to ${travelRadius} mi` });
  }
  if (pickupOnly) {
    highlights.push({ icon: <MapPin className="w-3 h-3" />, label: 'Pickup only' });
  }
  if (durationMinutes && durationMinutes >= 120) {
    highlights.push({ icon: <Sparkles className="w-3 h-3" />, label: 'Great for events' });
  }

  return (
    <div className="space-y-4">
      {/* Category badge */}
      {category && (
        <Badge variant="secondary" className="capitalize">
          {category.replace(/-/g, ' ')}
        </Badge>
      )}

      {/* Title */}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        {name}
      </h1>

      {/* Booking mode badge */}
      <div className="flex flex-wrap items-center gap-3">
        {isInstant ? (
          <Badge variant="gradient" className="gap-1">
            <Zap className="w-3.5 h-3.5" />
            Instant confirmation
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Requires approval
          </Badge>
        )}
        
        {/* Pricing type badge */}
        <Badge variant="outline" className="gap-1">
          {type === 'HOURLY' ? (
            <><Clock className="w-3.5 h-3.5" /> Hourly</>
          ) : (
            <><Calendar className="w-3.5 h-3.5" /> Daily</>
          )}
        </Badge>
      </div>

      {/* Price display */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold gradient-text">{priceDisplay.price}</span>
        <span className="text-lg text-muted-foreground">{priceDisplay.unit}</span>
      </div>

      {/* Minimums */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {minUnits > 1 && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {minUnits} {type === 'HOURLY' ? 'hour' : 'day'} minimum
          </span>
        )}
        {minHours && minHours > 1 && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {minHours} hour minimum
          </span>
        )}
        {minGuests && minGuests > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {minGuests}+ guests
          </span>
        )}
        {durationMinutes && (
          <span className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            {Math.floor(durationMinutes / 60)}h {durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''} duration
          </span>
        )}
      </div>

      {/* Highlight chips */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {highlights.map((h, i) => (
            <Badge key={i} variant="outline" className="gap-1 bg-primary/5 border-primary/20 text-primary">
              {h.icon}
              {h.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-muted-foreground leading-relaxed pt-2">
          {description}
        </p>
      )}
    </div>
  );
}
