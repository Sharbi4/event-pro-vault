import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, MapPin, CreditCard, Banknote, 
  Zap, ShieldCheck, Check, ChevronLeft, ChevronRight,
  Loader2, Users, FileText, AlertCircle, Calendar as CalendarAlt,
  Mail, User, Car, Info, ExternalLink
} from 'lucide-react';
import { format, getDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePackageAvailabilityCheck } from '@/hooks/usePackageAvailabilityCheck';
import { supabase } from '@/integrations/supabase/client';
import { CANCELLATION_POLICIES, CancellationPolicyType } from '@/lib/cancellationPolicies';
import { CancellationPolicyBadge } from '@/components/shared/CancellationPolicyBadge';
import { AddressInput } from '@/components/shared/AddressInput';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  packageName: string;
  price: number;
  type: string;
  pricingType: string | null;
  minUnits: number;
  bookingMode: 'INSTANT' | 'REQUEST';
  paymentOptions: 'ONLINE' | 'CASH' | 'BOTH';
  vendorUserId: string;
  vendorName: string;
  vendorStripeStatus: string | null;
  initialDate?: Date;
  initialPaymentMethod?: 'stripe' | 'cash';
  // Travel settings from package
  maxTravelMiles?: number;
  includedTravelMiles?: number;
  travelFeePerMile?: number;
  // Vendor base location
  vendorBaseLat?: number;
  vendorBaseLng?: number;
  // Cancellation policy
  cancellationPolicy?: CancellationPolicyType;
  // Deposit settings
  depositEnabled?: boolean;
  depositPercentage?: number;
}

const STEPS = [
  { id: 'date', title: 'Date & Time' },
  { id: 'details', title: 'Event Details' },
  { id: 'address', title: 'Address' },
  { id: 'payment', title: 'Payment' },
  { id: 'review', title: 'Review & Confirm' },
];

const EVENT_TYPES = [
  'Wedding',
  'Birthday Party',
  'Corporate Event',
  'Baby Shower',
  'Anniversary',
  'Graduation',
  'Holiday Party',
  'Other'
];

const PLATFORM_FEE_RATE = 0.129;
const DEFAULT_DEPOSIT_PERCENTAGE = 50;

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function BookingModal({
  open,
  onOpenChange,
  packageId,
  packageName,
  price,
  type,
  pricingType,
  minUnits,
  bookingMode,
  paymentOptions,
  vendorUserId,
  vendorName,
  vendorStripeStatus,
  initialDate,
  initialPaymentMethod = 'stripe',
  maxTravelMiles = 100,
  includedTravelMiles = 0,
  travelFeePerMile = 0,
  vendorBaseLat,
  vendorBaseLng,
  cancellationPolicy = 'standard',
  depositEnabled = true,
  depositPercentage = DEFAULT_DEPOSIT_PERCENTAGE,
}: BookingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Availability checking
  const {
    loading: availabilityLoading,
    isDateAvailable,
    isTimeAvailable,
    getUnavailableDates,
    getDisabledDaysOfWeek,
    findAlternatives,
    getAvailableHours
  } = usePackageAvailabilityCheck(packageId);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [eventDate, setEventDate] = useState<Date | undefined>(initialDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>(
    paymentOptions === 'CASH' ? 'cash' : initialPaymentMethod
  );
  
  // Address state (structured)
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [eventLat, setEventLat] = useState<number | null>(null);
  const [eventLng, setEventLng] = useState<number | null>(null);
  
  // Terms acceptance
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptCancellation, setAcceptCancellation] = useState(false);

  // Computed values
  const fullAddress = useMemo(() => {
    const parts = [addressLine1, city, state, zipCode].filter(Boolean);
    return parts.join(', ');
  }, [addressLine1, city, state, zipCode]);

  // Distance calculation
  const distanceMiles = useMemo(() => {
    if (!vendorBaseLat || !vendorBaseLng || !eventLat || !eventLng) {
      return null;
    }
    return calculateDistance(vendorBaseLat, vendorBaseLng, eventLat, eventLng);
  }, [vendorBaseLat, vendorBaseLng, eventLat, eventLng]);

  // Travel fee calculation
  const travelFee = useMemo(() => {
    if (!distanceMiles || travelFeePerMile <= 0) return 0;
    const chargeableMiles = Math.max(0, distanceMiles - includedTravelMiles);
    return chargeableMiles * travelFeePerMile;
  }, [distanceMiles, includedTravelMiles, travelFeePerMile]);

  // Check if within service area
  const isWithinServiceArea = useMemo(() => {
    if (!distanceMiles) return true; // Unknown distance, allow
    return distanceMiles <= maxTravelMiles;
  }, [distanceMiles, maxTravelMiles]);

  // Availability status for selected date
  const dateAvailability = useMemo(() => {
    if (!eventDate) return null;
    return isDateAvailable(eventDate);
  }, [eventDate, isDateAvailable]);

  const timeAvailability = useMemo(() => {
    if (!eventDate) return null;
    return isTimeAvailable(eventDate, startTime, endTime);
  }, [eventDate, startTime, endTime, isTimeAvailable]);

  const alternatives = useMemo(() => {
    if (!eventDate || dateAvailability?.available) return [];
    return findAlternatives(eventDate, 3);
  }, [eventDate, dateAvailability, findAlternatives]);

  const availableHours = useMemo(() => {
    if (!eventDate) return null;
    return getAvailableHours(eventDate);
  }, [eventDate, getAvailableHours]);

  // Calendar disabled dates
  const disabledDaysOfWeek = useMemo(() => getDisabledDaysOfWeek(), [getDisabledDaysOfWeek]);
  const unavailableDates = useMemo(() => getUnavailableDates(), [getUnavailableDates]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSuccess(false);
      if (initialDate) setEventDate(initialDate);
      setPaymentMethod(paymentOptions === 'CASH' ? 'cash' : initialPaymentMethod);
      setAcceptTerms(false);
      setAcceptCancellation(false);
    }
  }, [open, initialDate, paymentOptions, initialPaymentMethod]);

  // Auto-adjust times when date changes
  useEffect(() => {
    if (availableHours) {
      const startNum = parseInt(startTime.replace(':', ''));
      const availStartNum = parseInt(availableHours.start.replace(':', ''));
      if (startNum < availStartNum) {
        setStartTime(availableHours.start.slice(0, 5));
      }
      const endNum = parseInt(endTime.replace(':', ''));
      const availEndNum = parseInt(availableHours.end.replace(':', ''));
      if (endNum > availEndNum) {
        setEndTime(availableHours.end.slice(0, 5));
      }
    }
  }, [availableHours, startTime, endTime]);

  const isInstant = bookingMode === 'INSTANT';
  const showPaymentStep = paymentOptions === 'BOTH';
  const stripeAvailable = vendorStripeStatus === 'active';
  
  // Calculate steps to show
  const activeSteps = STEPS.filter(step => {
    if (step.id === 'payment') return showPaymentStep;
    return true;
  });

  // Calculate duration in hours
  const calculateHours = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return Math.max(minUnits, (endMins - startMins) / 60);
  };

  const hours = calculateHours();
  const baseTotal = type === 'HOURLY' ? price * hours : price;
  const subtotalWithTravel = baseTotal + travelFee;
  const platformFee = paymentMethod === 'stripe' ? subtotalWithTravel * PLATFORM_FEE_RATE : 0;
  const grandTotal = subtotalWithTravel + platformFee;
  
  // Deposit calculations
  const depositAmount = depositEnabled ? (subtotalWithTravel * (depositPercentage / 100)) + platformFee : 0;
  const remainingAmount = grandTotal - depositAmount;

  const canProceed = () => {
    const step = activeSteps[currentStep];
    switch (step.id) {
      case 'date':
        if (!eventDate) return false;
        if (!dateAvailability?.available) return false;
        if (type === 'HOURLY' && !timeAvailability?.available) return false;
        return true;
      case 'details':
        const emailRequired = !user;
        const hasEmail = emailRequired ? !!guestEmail.trim() : true;
        return !!eventType && hasEmail;
      case 'address':
        return !!addressLine1.trim() && !!city.trim() && !!state.trim() && isWithinServiceArea;
      case 'payment':
        return true;
      case 'review':
        return acceptTerms && acceptCancellation;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user && !guestEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please provide your email address for booking confirmation",
        variant: "destructive"
      });
      return;
    }

    if (!eventDate || !addressLine1) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    const customerEmail = user?.email || guestEmail.trim();
    const customerName = user?.email?.split('@')[0] || guestName.trim() || 'Guest';

    // Create the booking first
    const result = await createBooking({
      vendor_id: vendorUserId,
      vendor_user_id: vendorUserId,
      package_id: packageId,
      event_date: format(eventDate, 'yyyy-MM-dd'),
      event_location: fullAddress,
      address_line1: addressLine1,
      address_line2: addressLine2 || undefined,
      event_city: city,
      event_state: state,
      event_zip: zipCode,
      units: type === 'HOURLY' ? hours : 1,
      add_ons: [],
      total_price: subtotalWithTravel, // Base + travel, platform fee added at checkout
      notes: notes || null,
      payment_method: paymentMethod,
      booking_mode: bookingMode,
      vendor_name: vendorName,
      customer_name: customerName,
      customer_email: customerEmail,
      package_name: packageName,
      unit_type: type === 'HOURLY' ? 'hour' : 'day',
      start_time: type === 'HOURLY' ? startTime : null,
      end_time: type === 'HOURLY' ? endTime : null,
      duration_minutes: type === 'HOURLY' ? hours * 60 : 480,
      cancellation_policy: cancellationPolicy,
      is_guest: !user,
    });

    if (!result) {
      setSubmitting(false);
      return;
    }

    // If paying online, redirect to Stripe checkout
    if (paymentMethod === 'stripe' && stripeAvailable) {
      try {
        const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
          body: {
            booking_id: result.id,
            deposit_percentage: depositEnabled ? depositPercentage : 100,
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.error('Checkout error:', err);
        toast({
          title: "Payment setup failed",
          description: "Your booking was created but payment could not be processed. Please try again from your dashboard.",
          variant: "destructive"
        });
      }
    }

    setSubmitting(false);
    setSuccess(true);
  };

  const handleViewAllPackages = () => {
    onOpenChange(false);
    navigate(`/pro/${vendorUserId}`);
  };

  const handleViewBookings = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };

  // Get cancellation policy details
  const policyDetails = CANCELLATION_POLICIES[cancellationPolicy] || CANCELLATION_POLICIES.standard;

  const renderStepContent = () => {
    if (success) {
      return (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            {isInstant ? 'Booking Confirmed!' : 'Request Sent!'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isInstant 
              ? paymentMethod === 'cash'
                ? 'Your booking is confirmed. Remember to pay the Event Pro at the event.'
                : 'Your booking is confirmed. Check your email for details.'
              : "You'll be notified when the Event Pro responds to your request."
            }
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="gradient" onClick={handleViewBookings}>
              View My Bookings
            </Button>
            <Button variant="outline" onClick={handleViewAllPackages}>
              View All Packages from {vendorName}
            </Button>
          </div>
        </div>
      );
    }

    const step = activeSteps[currentStep];

    switch (step.id) {
      case 'date':
        return (
          <div className="space-y-6">
            {availabilityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[280px] w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Date
                  </label>
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    disabled={(date) => {
                      if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                      if (disabledDaysOfWeek.includes(getDay(date))) return true;
                      if (unavailableDates.some(d => isSameDay(d, date))) return true;
                      return false;
                    }}
                    modifiers={{
                      unavailable: unavailableDates
                    }}
                    modifiersClassNames={{
                      unavailable: "line-through text-muted-foreground/50"
                    }}
                    className="rounded-xl border mx-auto pointer-events-auto"
                  />
                </div>

                {/* Unavailable date warning with alternatives */}
                {eventDate && !dateAvailability?.available && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive mb-1">
                          Not available on this date
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {dateAvailability?.reason || 'This date is unavailable'}
                        </p>
                        
                        {alternatives.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">
                              Try these nearby dates:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {alternatives.map(alt => (
                                <Button
                                  key={alt.toISOString()}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setEventDate(alt)}
                                >
                                  <CalendarAlt className="w-3 h-3 mr-1" />
                                  {format(alt, 'MMM d')}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {type === 'HOURLY' && eventDate && dateAvailability?.available && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>

                    {availableHours && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Available: {availableHours.start.slice(0, 5)} – {availableHours.end.slice(0, 5)}
                      </p>
                    )}

                    {!timeAvailability?.available && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {timeAvailability?.reason || 'Selected time is outside available hours'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {type !== 'HOURLY' && eventDate && dateAvailability?.available && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Available on {format(eventDate, 'PPP')}</span>
                    </div>
                  </div>
                )}

                {eventDate && dateAvailability?.available && (!type || type !== 'HOURLY' || timeAvailability?.available) && (
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-2">
                      {isInstant ? (
                        <Badge variant="trust" className="gap-1">
                          <Zap className="w-3 h-3" />
                          Instant confirmation
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Requires approval
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isInstant 
                        ? 'Your booking will be confirmed immediately'
                        : 'The Event Pro will review and respond to your request'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {/* Guest checkout fields */}
            {!user && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Your Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email for confirmation"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send your booking confirmation here
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Your Name (optional)
                  </label>
                  <Input
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Type
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Guest Count (optional)
              </label>
              <Input
                type="number"
                placeholder="Estimated number of guests"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes for the Event Pro (optional)
              </label>
              <Textarea
                placeholder="Any special requests or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enter your event location so we can calculate travel requirements.
            </p>

            <AddressInput
              value={{
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                state: state,
                zip: zipCode,
              }}
              onChange={(val) => {
                setAddressLine1(val.addressLine1);
                setAddressLine2(val.addressLine2 || '');
                setCity(val.city);
                setState(val.state);
                setZipCode(val.zip);
              }}
              required
            />

            {/* Distance & travel info */}
            {distanceMiles !== null && (
              <div className={cn(
                "p-4 rounded-xl border",
                isWithinServiceArea 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-destructive/10 border-destructive/20"
              )}>
                <div className="flex items-start gap-3">
                  <Car className={cn(
                    "w-5 h-5 shrink-0 mt-0.5",
                    isWithinServiceArea ? "text-primary" : "text-destructive"
                  )} />
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isWithinServiceArea ? "text-foreground" : "text-destructive"
                    )}>
                      {Math.round(distanceMiles)} miles from Event Pro
                    </p>
                    
                    {isWithinServiceArea ? (
                      <>
                        {travelFee > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Travel fee: ${travelFee.toFixed(2)} 
                            ({Math.round(distanceMiles - includedTravelMiles)} mi beyond {includedTravelMiles} included)
                          </p>
                        ) : includedTravelMiles > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Within {includedTravelMiles} included miles — no travel fee
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No travel fee applies
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-destructive">
                        This location is outside the Event Pro's service area ({maxTravelMiles} mi max)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Choose how you'd like to pay for this booking.
            </p>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as 'stripe' | 'cash')}
              className="space-y-3"
            >
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                paymentMethod === 'stripe' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50",
                !stripeAvailable && "opacity-50 cursor-not-allowed"
              )}>
                <RadioGroupItem value="stripe" id="modal-stripe" disabled={!stripeAvailable} />
                <Label htmlFor="modal-stripe" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium">Pay online (card)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Secure payment via Stripe. A 12.9% service fee applies.
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                paymentMethod === 'cash' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}>
                <RadioGroupItem value="cash" id="modal-cash" />
                <Label htmlFor="modal-cash" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Pay in cash at the event</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay the Event Pro directly. No service fee.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium text-foreground">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {eventDate ? format(eventDate, 'PPP') : '-'}
                </span>
              </div>
              {type === 'HOURLY' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{startTime} - {endTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground text-right max-w-[200px] truncate">
                  {city}, {state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  {paymentMethod === 'stripe' ? (
                    <><CreditCard className="w-4 h-4" /> Card</>
                  ) : (
                    <><Banknote className="w-4 h-4" /> Cash</>
                  )}
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ${price} × {type === 'HOURLY' ? `${hours} hrs` : '1 day'}
                </span>
                <span>${baseTotal.toFixed(2)}</span>
              </div>
              {travelFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    Travel fee ({Math.round(distanceMiles! - includedTravelMiles)} mi)
                  </span>
                  <span>${travelFee.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'stripe' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee (12.9%)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="gradient-text">${grandTotal.toFixed(2)}</span>
              </div>
              
              {/* Deposit info for online payments */}
              {paymentMethod === 'stripe' && depositEnabled && (
                <div className="text-sm pt-2 space-y-1">
                  <div className="flex justify-between text-primary">
                    <span>Due today (deposit)</span>
                    <span>${depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Due at event</span>
                    <span>${remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation policy */}
            <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Cancellation Policy</span>
                <CancellationPolicyBadge policyType={cancellationPolicy} />
              </div>
              <div className="space-y-1">
                {policyDetails.tiers.map((tier, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {tier.label}: {tier.refundPercentage}% refund
                  </p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Deposits are non-refundable except within 1 hour of booking (if event is 7+ days away) or if the Event Pro cancels.
              </p>
            </div>

            {/* Terms checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I agree to the <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>
                </label>
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-cancellation"
                  checked={acceptCancellation}
                  onCheckedChange={(checked) => setAcceptCancellation(checked === true)}
                />
                <label htmlFor="accept-cancellation" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I understand and accept the <a href="/cancellation" target="_blank" className="text-primary underline">cancellation policy</a> for this booking
                </label>
              </div>
            </div>

            {/* Request mode notice */}
            {!isInstant && paymentMethod === 'stripe' && (
              <p className="text-sm text-amber-600 dark:text-amber-400 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                You'll only be charged if the Event Pro approves your request.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderActions = () => {
    if (success) return null;

    const isLastStep = currentStep === activeSteps.length - 1;

    return (
      <div className="flex gap-3 pt-4 border-t">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <Button 
          variant="gradient" 
          className="flex-1 gap-1"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={!canProceed() || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : isLastStep ? (
            isInstant 
              ? (paymentMethod === 'stripe' ? 'Confirm & pay' : 'Confirm booking')
              : 'Send request'
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    );
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {activeSteps.map((step, i) => (
        <div 
          key={step.id}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all",
            i === currentStep 
              ? "w-8 bg-primary" 
              : i < currentStep 
                ? "bg-primary/50"
                : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  const stepTitle = success 
    ? '' 
    : activeSteps[currentStep]?.title || 'Book';

  const content = (
    <div className="relative">
      {!success && stepIndicator}
      {renderStepContent()}
      {renderActions()}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-auto">
          <SheetTitle className="sr-only">{stepTitle}</SheetTitle>
          <div className="pt-4 pb-8">
            {!success && (
              <h2 className="font-display text-xl font-bold text-center mb-2">
                {stepTitle}
              </h2>
            )}
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
        <DialogTitle className="font-display text-xl font-bold text-center">
          {stepTitle}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
