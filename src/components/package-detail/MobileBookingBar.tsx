import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldCheck } from 'lucide-react';

interface MobileBookingBarProps {
  price: number;
  type: string;
  pricingType: string | null;
  bookingMode: 'INSTANT' | 'REQUEST';
  onBookNow: () => void;
}

export function MobileBookingBar({
  price,
  type,
  pricingType,
  bookingMode,
  onBookNow
}: MobileBookingBarProps) {
  const isInstant = bookingMode === 'INSTANT';

  const getPriceUnit = () => {
    switch (pricingType?.toLowerCase() || type.toLowerCase()) {
      case 'hourly':
        return '/hr';
      case 'daily':
        return '/day';
      case 'flat':
      case 'fixed':
        return '';
      case 'per_guest':
        return '/guest';
      default:
        return type === 'HOURLY' ? '/hr' : '/day';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 z-50 lg:hidden">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">From ${price}</span>
            <span className="text-sm text-muted-foreground">{getPriceUnit()}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {isInstant ? (
              <Badge variant="trust" className="text-xs gap-1 py-0">
                <Zap className="w-3 h-3" />
                Instant
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs gap-1 py-0">
                <ShieldCheck className="w-3 h-3" />
                Approval needed
              </Badge>
            )}
          </div>
        </div>
        
        <Button 
          variant="gradient" 
          size="lg"
          className="flex-shrink-0"
          onClick={onBookNow}
        >
          {isInstant ? 'Book now' : 'Request'}
        </Button>
      </div>
    </div>
  );
}
