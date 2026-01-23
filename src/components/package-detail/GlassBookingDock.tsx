import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, Zap, ShieldCheck, CreditCard, 
  Banknote, Clock, ChevronDown, Check, MessageCircle
} from 'lucide-react';
import { format, getDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePackageAvailabilityCheck } from '@/hooks/usePackageAvailabilityCheck';
import { motion } from 'framer-motion';

interface GlassBookingDockProps {
  packageId: string;
  packageName: string;
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

export function GlassBookingDock({
  packageId,
  packageName,
  price,
  type,
  pricingType,
  minUnits,
  bookingMode,
  paymentOptions,
  vendorStripeStatus,
  onBookNow,
  initialDate
}: GlassBookingDockProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>(
    paymentOptions === 'CASH' ? 'cash' : 'stripe'
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    loading: availabilityLoading,
    getUnavailableDates,
    getDisabledDaysOfWeek,
    isDateAvailable
  } = usePackageAvailabilityCheck(packageId);

  const disabledDaysOfWeek = useMemo(() => getDisabledDaysOfWeek(), [getDisabledDaysOfWeek]);
  const unavailableDates = useMemo(() => getUnavailableDates(), [getUnavailableDates]);

  const isInstant = bookingMode === 'INSTANT';
  const showPaymentSelector = paymentOptions === 'BOTH';
  const stripeAvailable = vendorStripeStatus === 'active';
  const onlineUnavailable = paymentOptions === 'ONLINE' && !stripeAvailable;

  const getPriceUnit = () => {
    switch (pricingType?.toLowerCase() || type.toLowerCase()) {
      case 'hourly':
        return 'hr';
      case 'daily':
        return 'day';
      case 'flat':
      case 'fixed':
        return 'flat';
      case 'per_guest':
        return 'guest';
      default:
        return type === 'HOURLY' ? 'hr' : 'day';
    }
  };

  const handleBookNow = () => {
    onBookNow(selectedDate, paymentMethod);
  };

  // Calculate estimated total
  const estimatedTotal = price * minUnits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-float rounded-3xl p-8 sticky top-24 shadow-elevated"
    >
      {/* Package Name */}
      <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
        {packageName}
      </h3>
      <div className="w-16 h-0.5 bg-border mb-6" />

      {/* Price - Massive Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight">${price}</span>
          <span className="text-muted-foreground text-lg">/{getPriceUnit()}</span>
        </div>
        {minUnits > 1 && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {minUnits} {type === 'HOURLY' ? 'hour' : 'day'} minimum
          </p>
        )}
      </div>

      {/* Date Picker - Glass Input */}
      <div className="mb-4">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center justify-between gap-3 bg-secondary/50 rounded-2xl px-4 py-4 text-left hover:bg-secondary/80 transition-colors",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Event Date</p>
                  <p className="font-medium">
                    {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : "Select a date"}
                  </p>
                </div>
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
              disabled={(date) => {
                if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                if (disabledDaysOfWeek.includes(getDay(date))) return true;
                if (unavailableDates.some(d => isSameDay(d, date))) return true;
                return false;
              }}
              className="p-3 rounded-2xl"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Payment Method Selector */}
      {showPaymentSelector && (
        <div className="mb-6">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val as 'stripe' | 'cash')}
            className="space-y-2"
          >
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
              paymentMethod === 'stripe' 
                ? "bg-accent/10 ring-1 ring-accent" 
                : "bg-secondary/50 hover:bg-secondary/80",
              !stripeAvailable && "opacity-50 cursor-not-allowed"
            )}>
              <RadioGroupItem value="stripe" id="card" disabled={!stripeAvailable} />
              <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <span>Pay online</span>
              </Label>
            </div>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
              paymentMethod === 'cash' 
                ? "bg-accent/10 ring-1 ring-accent" 
                : "bg-secondary/50 hover:bg-secondary/80"
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

      {/* Estimated Total */}
      <div className="flex items-center justify-between py-4 border-t border-border mb-6">
        <span className="text-muted-foreground">Estimated Total</span>
        <span className="text-2xl font-bold">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Shimmer CTA Button */}
      <Button 
        className="btn-shimmer text-white w-full h-14 text-base font-semibold rounded-2xl"
        onClick={handleBookNow}
        disabled={onlineUnavailable}
      >
        {isInstant ? 'Secure this date' : 'Reserve your spot'}
      </Button>

      {onlineUnavailable && (
        <p className="text-xs text-destructive mt-2 text-center">
          Online payments not available for this package
        </p>
      )}

      {/* Trust Signals */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <span className="text-muted-foreground">Verified Pro</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-muted-foreground">100% Refund Guarantee</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-accent" />
          </div>
          <span className="text-muted-foreground">Instant Chat</span>
        </div>
      </div>

      {/* Request mode notice */}
      {!isInstant && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          You'll only be charged if the vendor approves
        </p>
      )}
    </motion.div>
  );
}
