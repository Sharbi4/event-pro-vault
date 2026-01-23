import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Banknote, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SpatialDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: {
    id: string;
    name: string;
    price: number;
    pricing_type?: string;
    type?: string;
    description?: string;
    includes?: string[];
    booking_mode: string;
    min_hours?: number;
    vendor?: {
      display_name?: string;
      avatar_url?: string;
      is_verified?: boolean;
    };
  } | null;
  eventDate?: Date;
}

export function SpatialDrawer({ open, onOpenChange, package: pkg, eventDate }: SpatialDrawerProps) {
  const [hours, setHours] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');

  useEffect(() => {
    if (pkg?.min_hours) {
      setHours(pkg.min_hours);
    }
  }, [pkg]);

  if (!pkg) return null;

  const isInstant = pkg.booking_mode === 'INSTANT';
  const isHourly = pkg.pricing_type === 'hourly' || pkg.type === 'hourly';
  const basePrice = isHourly ? pkg.price * hours : pkg.price;
  const totalPrice = basePrice;

  const handleSecure = () => {
    // Navigate to booking flow
    console.log('Securing booking:', { pkg, hours, paymentMethod, eventDate });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[480px] bg-background overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border p-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => onOpenChange(false)}
                  className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="font-mono text-sm text-muted-foreground">
                  {eventDate ? format(eventDate, 'MMM d, yyyy') : 'Select date'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Vendor Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border border-border">
                  <AvatarImage src={pkg.vendor?.avatar_url} alt={pkg.vendor?.display_name} />
                  <AvatarFallback className="bg-secondary text-lg font-medium">
                    {pkg.vendor?.display_name?.slice(0, 2).toUpperCase() || 'EP'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{pkg.vendor?.display_name || 'Event Pro'}</span>
                    {pkg.vendor?.is_verified && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">127 bookings</p>
                </div>
              </div>

              {/* Package Name */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{pkg.name}</h2>
                {pkg.description && (
                  <p className="mt-2 text-muted-foreground">{pkg.description}</p>
                )}
              </div>

              {/* What's Included */}
              {pkg.includes && pkg.includes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">What's included</h3>
                  <ul className="space-y-2">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <Check className="w-4 h-4 mt-0.5 text-foreground" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="h-px bg-border" />

              {/* Duration Slider (for hourly) */}
              {isHourly && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Duration</h3>
                    <span className="font-mono text-muted-foreground">
                      {hours} {hours === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                  <Slider
                    value={[hours]}
                    onValueChange={(val) => setHours(val[0])}
                    min={pkg.min_hours || 1}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{pkg.min_hours || 1}hr min</span>
                    <span>${pkg.price}/hr</span>
                  </div>
                </div>
              )}

              {/* Travel */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Travel fee may apply based on location</span>
              </div>

              <div className="h-px bg-border" />

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold mb-4">Payment method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      paymentMethod === 'online'
                        ? "border-foreground bg-secondary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Pay Online</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      paymentMethod === 'cash'
                        ? "border-foreground bg-secondary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-medium">Cash</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono text-3xl font-bold">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleSecure}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-lg",
                  isInstant 
                    ? "shimmer-button" 
                    : "bg-foreground text-background"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isInstant ? 'Secure This Date' : 'Send Booking Request'}
              </motion.button>

              {/* Social Proof */}
              <p className="text-sm text-muted-foreground text-center">
                Booked by 14 couples in your area this month
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
