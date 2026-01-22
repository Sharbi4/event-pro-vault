import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, Zap, ShieldCheck, CreditCard, 
  Banknote, Clock, ChevronDown 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StickyBookingCardProps {
  price: number;
  type: string;
  pricingType: string | null;
  minUnits: number;
  bookingMode: 'INSTANT' | 'REQUEST';
  paymentOptions: 'ONLINE' | 'CASH' | 'BOTH';
  vendorStripeStatus: string | null;
  onBookNow: (date: Date | undefined, paymentMethod: 'stripe' | 'cash') => void;
  initialDate?: Date;
}

export function StickyBookingCard({
  price,
  type,
  pricingType,
  minUnits,
  bookingMode,
  paymentOptions,
  vendorStripeStatus,
  onBookNow,
  initialDate
}: StickyBookingCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>(
    paymentOptions === 'CASH' ? 'cash' : 'stripe'
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isInstant = bookingMode === 'INSTANT';
  const showPaymentSelector = paymentOptions === 'BOTH';
  const stripeAvailable = vendorStripeStatus === 'active';
  
  // If online is required but stripe not available, show disabled state
  const onlineUnavailable = paymentOptions === 'ONLINE' && !stripeAvailable;

  const getPriceUnit = () => {
    switch (pricingType?.toLowerCase() || type.toLowerCase()) {
      case 'hourly':
        return '/hour';
      case 'daily':
        return '/day';
      case 'flat':
      case 'fixed':
        return ' flat';
      case 'per_guest':
        return '/guest';
      default:
        return type === 'HOURLY' ? '/hour' : '/day';
    }
  };

  const handleBookNow = () => {
    onBookNow(selectedDate, paymentMethod);
  };

  return (
    <Card variant="gradient" className="p-6 sticky top-24">
      {/* Price */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold gradient-text">${price}</span>
        <span className="text-muted-foreground">{getPriceUnit()}</span>
      </div>

      {/* Minimum */}
      {minUnits > 1 && (
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {minUnits} {type === 'HOURLY' ? 'hour' : 'day'} minimum
        </p>
      )}

      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Event Date
        </label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center justify-between gap-3 bg-card rounded-xl px-4 py-3 border border-border text-left hover:border-primary/50 transition-colors",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setCalendarOpen(false);
              }}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="p-3"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Payment Method Selector */}
      {showPaymentSelector && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Payment Method
          </label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as 'stripe' | 'cash')}
            className="space-y-2"
          >
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
              paymentMethod === 'stripe' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50",
              !stripeAvailable && "opacity-50 cursor-not-allowed"
            )}>
              <RadioGroupItem value="stripe" id="card" disabled={!stripeAvailable} />
              <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Pay online</span>
              </Label>
            </div>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
              paymentMethod === 'cash' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                <span>Pay in cash</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Payment info for non-BOTH options */}
      {!showPaymentSelector && (
        <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border">
          {paymentOptions === 'ONLINE' ? (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Pay securely online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Banknote className="w-4 h-4 text-green-600" />
              <span>Pay in cash at the event</span>
            </div>
          )}
        </div>
      )}

      {/* Booking mode badge */}
      <div className="mb-4">
        {isInstant ? (
          <Badge variant="trust" className="gap-1 w-full justify-center py-2">
            <Zap className="w-4 h-4" />
            Instant confirmation
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 w-full justify-center py-2">
            <ShieldCheck className="w-4 h-4" />
            Requires approval
          </Badge>
        )}
      </div>

      {/* Book Now Button */}
      <Button 
        variant="gradient" 
        size="lg" 
        className="w-full"
        onClick={handleBookNow}
        disabled={onlineUnavailable}
      >
        {isInstant ? 'Book now' : 'Request to book'}
      </Button>

      {onlineUnavailable && (
        <p className="text-xs text-destructive mt-2 text-center">
          Online payments not available for this package
        </p>
      )}

      {/* Request mode notice */}
      {!isInstant && paymentMethod === 'stripe' && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          You'll only be charged if the Event Pro approves
        </p>
      )}
    </Card>
  );
}
