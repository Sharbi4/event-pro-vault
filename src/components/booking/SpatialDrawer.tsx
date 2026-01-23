import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Banknote, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { saveBookingDraft, buildAuthUrl } from '@/lib/authIntent';

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
    vendor_user_id?: string;
    payment_options?: string;
    vendor?: {
      display_name?: string;
      avatar_url?: string;
      is_verified?: boolean;
      stripe_account_status?: string;
    };
  } | null;
  eventDate?: Date;
}

type BookingState = 'idle' | 'loading' | 'success' | 'error';

export function SpatialDrawer({ open, onOpenChange, package: pkg, eventDate }: SpatialDrawerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { toast } = useToast();

  const [hours, setHours] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [eventLocation, setEventLocation] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingState, setBookingState] = useState<BookingState>('idle');

  useEffect(() => {
    if (pkg?.min_hours) {
      setHours(pkg.min_hours);
    }
  }, [pkg]);

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setBookingState('idle');
      setEventLocation('');
      setCustomerEmail('');
    }
  }, [open]);

  if (!pkg) return null;

  const isInstant = pkg.booking_mode === 'INSTANT';
  const isHourly = pkg.pricing_type === 'hourly' || pkg.type === 'hourly' || pkg.type === 'HOURLY';
  const basePrice = isHourly ? pkg.price * hours : pkg.price;
  const totalPrice = basePrice;
  
  // Check payment options
  const paymentOptions = pkg.payment_options || 'ONLINE';
  const canPayOnline = paymentOptions === 'ONLINE' || paymentOptions === 'BOTH';
  const canPayCash = paymentOptions === 'CASH' || paymentOptions === 'BOTH';

  const handleSecure = async () => {
    // Validate inputs
    if (!eventDate) {
      toast({
        title: "Date required",
        description: "Please select an event date",
        variant: "destructive"
      });
      return;
    }

    if (!eventLocation.trim()) {
      toast({
        title: "Location required",
        description: "Please enter your event location",
        variant: "destructive"
      });
      return;
    }

    // For guest checkout, require email
    const isGuest = !user;
    if (isGuest && !customerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setBookingState('loading');

    try {
      // Create the booking
      const booking = await createBooking({
        vendor_id: pkg.id,
        vendor_user_id: pkg.vendor_user_id || null,
        package_id: pkg.id,
        event_date: format(eventDate, 'yyyy-MM-dd'),
        event_location: eventLocation.trim(),
        units: isHourly ? hours : 1,
        add_ons: [],
        total_price: totalPrice,
        payment_method: paymentMethod,
        booking_mode: isInstant ? 'INSTANT' : 'REQUEST',
        customer_email: isGuest ? customerEmail.trim() : user?.email,
        customer_name: user?.user_metadata?.full_name || customerEmail.split('@')[0],
        vendor_name: pkg.vendor?.display_name || 'Vendor',
        package_name: pkg.name,
        unit_type: isHourly ? 'hours' : 'booking',
        is_guest: isGuest,
      });

      if (!booking) {
        setBookingState('error');
        return;
      }

      // For Stripe payments with instant booking, create checkout session
      if (paymentMethod === 'stripe' && isInstant && pkg.vendor?.stripe_account_status === 'active') {
        const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
          body: { booking_id: booking.id }
        });

        if (error) {
          console.error('Checkout error:', error);
          toast({
            title: "Payment setup failed",
            description: "Booking created but payment could not be processed. The vendor will contact you.",
          });
          setBookingState('success');
          return;
        }

        if (data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
          return;
        }
      }

      // For cash payments or request mode, show success
      setBookingState('success');
      toast({
        title: isInstant ? "Booking confirmed!" : "Request sent!",
        description: isInstant 
          ? "Your event is secured. Check your email for details."
          : "The vendor will review your request and respond soon.",
      });

      // Close drawer after delay
      setTimeout(() => {
        onOpenChange(false);
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      setBookingState('error');
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLoading = bookingState === 'loading';
  const isSuccess = bookingState === 'success';
  const isGuest = !user;

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
            onClick={() => !isLoading && onOpenChange(false)}
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
                  onClick={() => !isLoading && onOpenChange(false)}
                  className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="font-mono text-sm text-muted-foreground">
                  {eventDate ? format(eventDate, 'MMM d, yyyy') : 'Select date'}
                </span>
              </div>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6"
                >
                  <Check className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  {isInstant ? 'Booking Confirmed!' : 'Request Sent!'}
                </h2>
                <p className="text-muted-foreground text-center">
                  {isInstant 
                    ? 'Check your email for booking details.'
                    : 'The vendor will respond to your request soon.'}
                </p>
              </div>
            ) : (
              /* Content */
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

                {/* Event Location */}
                <div>
                  <h3 className="font-semibold mb-3">Event Location</h3>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Enter your event address"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Guest Email */}
                {isGuest && (
                  <div>
                    <h3 className="font-semibold mb-3">Your Email</h3>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send booking confirmation and updates to this email
                    </p>
                  </div>
                )}

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
                      disabled={isLoading}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{pkg.min_hours || 1}hr min</span>
                      <span>${pkg.price}/hr</span>
                    </div>
                  </div>
                )}

                <div className="h-px bg-border" />

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-4">Payment method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {canPayOnline && (
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'stripe'
                            ? "border-foreground bg-secondary"
                            : "border-border hover:border-muted-foreground",
                          !canPayCash && "col-span-2"
                        )}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">Pay Online</span>
                      </button>
                    )}
                    {canPayCash && (
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'cash'
                            ? "border-foreground bg-secondary"
                            : "border-border hover:border-muted-foreground",
                          !canPayOnline && "col-span-2"
                        )}
                      >
                        <Banknote className="w-5 h-5" />
                        <span className="font-medium">Cash</span>
                      </button>
                    )}
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
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2",
                    isInstant 
                      ? "shimmer-button" 
                      : "bg-foreground text-background",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                  whileHover={!isLoading ? { scale: 1.01 } : {}}
                  whileTap={!isLoading ? { scale: 0.99 } : {}}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    isInstant ? 'Secure This Date' : 'Send Booking Request'
                  )}
                </motion.button>

                {/* Social Proof */}
                <p className="text-sm text-muted-foreground text-center">
                  Booked by 14 couples in your area this month
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
