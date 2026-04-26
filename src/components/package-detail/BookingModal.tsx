import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Mail, User, Car, Info, ExternalLink, Package as PackageIcon
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
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { trackBookingStarted, trackBookingCompleted, trackBookingFailed } from '@/lib/trackingAnalytics';
import { geocodeLocation } from '@/lib/geocoding';

type PricingType = 'hourly' | 'daily' | 'flat' | 'per_guest' | 'per_item' | 'custom_quote';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  packageName: string;
  packageDescription?: string;
  price: number;
  type: string;
  pricingType: string | null;
  minUnits: number;
  minHours?: number;
  minGuests?: number;
  maxGuests?: number;
  minDays?: number;
  minItems?: number;
  maxItems?: number;
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
  // Event Pro base location
  vendorBaseLat?: number;
  vendorBaseLng?: number;
  // Cancellation policy
  cancellationPolicy?: CancellationPolicyType;
  // Deposit settings
  depositEnabled?: boolean;
  depositPercentage?: number;
  // Package details for review
  includes?: string[];
  requirements?: string[];
  customerRequirements?: string;
  durationMinutes?: number;
  setupTimeMinutes?: number;
  // Daily booking defaults
  defaultStartTime?: string;
  // Pickup only (no travel)
  pickupOnly?: boolean;
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
  packageDescription,
  price,
  type,
  pricingType,
  minUnits,
  minHours,
  minGuests,
  maxGuests,
  minDays,
  minItems,
  maxItems,
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
  includes = [],
  requirements = [],
  customerRequirements,
  durationMinutes,
  setupTimeMinutes,
  defaultStartTime,
  pickupOnly = false,
}: BookingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Normalize pricing type
  const effectivePricingType = (pricingType || (type === 'HOURLY' ? 'hourly' : 'daily')) as PricingType;
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
  const [startTime, setStartTime] = useState(defaultStartTime || '10:00');
  const [endTime, setEndTime] = useState('14:00');
  // Customer-selected hours for hourly packages (overrides minimum if higher)
  const [hourlyHours, setHourlyHours] = useState<number>(Math.max(minHours || 1, 1));
  const [dailyDuration, setDailyDuration] = useState(durationMinutes || 240); // Default 4 hours for daily
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState(minGuests?.toString() || '');
  const [itemQuantity, setItemQuantity] = useState(minUnits?.toString() || '1');
  const [notes, setNotes] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  // Customer contact (required for ALL bookings — name reaches the Event Pro,
  // phone is for admin / customer service follow-up)
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
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
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Terms acceptance
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptCancellation, setAcceptCancellation] = useState(false);

  // Geocode address when it changes (debounced)
  useEffect(() => {
    // Clear previous timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Only geocode if we have enough address info
    if (!addressLine1.trim() || !city.trim() || !state) {
      setEventLat(null);
      setEventLng(null);
      return;
    }

    // Debounce geocoding by 800ms
    geocodeTimeoutRef.current = setTimeout(async () => {
      const fullAddr = `${addressLine1}, ${city}, ${state} ${zipCode}`.trim();
      setGeocodingAddress(true);
      
      try {
        const result = await geocodeLocation(fullAddr);
        if (result) {
          setEventLat(result.lat);
          setEventLng(result.lng);
        } else {
          setEventLat(null);
          setEventLng(null);
        }
      } catch (err) {
        console.error('Geocoding failed:', err);
        setEventLat(null);
        setEventLng(null);
      } finally {
        setGeocodingAddress(false);
      }
    }, 800);

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [addressLine1, city, state, zipCode]);

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

  // Reset on open and track booking started
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSuccess(false);
      if (initialDate) setEventDate(initialDate);
      setPaymentMethod(paymentOptions === 'CASH' ? 'cash' : initialPaymentMethod);
      setAcceptTerms(false);
      setAcceptCancellation(false);
      
      // Track booking started
      trackBookingStarted({ packageId, proId: vendorUserId });
    }
  }, [open, initialDate, paymentOptions, initialPaymentMethod, packageId, vendorUserId]);

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

  // Keep endTime in sync with the customer-selected start time + duration
  // (for hourly packages we use hourlyHours; for daily/flat we use dailyDuration).
  useEffect(() => {
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const durMin = effectivePricingType === 'hourly'
      ? hourlyHours * 60
      : dailyDuration;
    const total = h * 60 + m + durMin;
    const eh = Math.floor((total % (24 * 60)) / 60);
    const em = total % 60;
    const next = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    if (next !== endTime) setEndTime(next);
  }, [startTime, hourlyHours, dailyDuration, effectivePricingType, endTime]);

  const isInstant = bookingMode === 'INSTANT';
  const showPaymentStep = paymentOptions === 'BOTH';
  const stripeAvailable = vendorStripeStatus === 'active';
  
  // Calculate steps to show - skip address step for pickup_only
  const activeSteps = STEPS.filter(step => {
    if (step.id === 'payment') return showPaymentStep;
    if (step.id === 'address') return !pickupOnly;
    return true;
  });

  // Calculate units based on pricing type
  const calculateUnits = () => {
    switch (effectivePricingType) {
      case 'hourly':
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        return Math.max(minHours || minUnits || 1, (endMins - startMins) / 60);
      case 'daily':
        return Math.max(minDays || 1, 1);
      case 'per_guest':
        return Math.max(minGuests || 1, parseInt(guestCount) || 1);
      case 'per_item':
        return Math.max(minUnits || 1, parseInt(itemQuantity) || 1);
      case 'flat':
      case 'custom_quote':
      default:
        return 1;
    }
  };

  const units = calculateUnits();
  
  // Calculate base total based on pricing type
  const baseTotal = useMemo(() => {
    switch (effectivePricingType) {
      case 'hourly':
        return price * units;
      case 'daily':
        return price * units;
      case 'per_guest':
        return price * units;
      case 'per_item':
        return price * units;
      case 'flat':
      case 'custom_quote':
      default:
        return price;
    }
  }, [effectivePricingType, price, units]);
  
  // Only apply travel fee if not pickup_only
  const effectiveTravelFee = pickupOnly ? 0 : travelFee;
  const subtotalWithTravel = baseTotal + effectiveTravelFee;
  const platformFee = paymentMethod === 'stripe' ? subtotalWithTravel * PLATFORM_FEE_RATE : 0;
  const grandTotal = subtotalWithTravel + platformFee;
  
  // Deposit calculations
  const depositAmount = depositEnabled ? (subtotalWithTravel * (depositPercentage / 100)) + platformFee : 0;
  const remainingAmount = grandTotal - depositAmount;

  // Validation for different pricing types
  const validateDetailsStep = () => {
    const emailRequired = !user;
    const hasEmail = emailRequired ? !!guestEmail.trim() : true;

    // Name and phone are now required for every booking
    if (!contactName.trim() || !contactPhone.trim()) return false;

    if (!eventType || !hasEmail) return false;
    
    // Require guest count for per_guest pricing
    if (effectivePricingType === 'per_guest') {
      const guests = parseInt(guestCount);
      if (!guests || guests < (minGuests || 1)) return false;
      if (maxGuests && guests > maxGuests) return false;
    }
    
    // Require item quantity for per_item pricing
    if (effectivePricingType === 'per_item') {
      const qty = parseInt(itemQuantity);
      if (!qty || qty < (minItems || minUnits || 1)) return false;
      if (maxItems && qty > maxItems) return false;
    }
    
    return true;
  };

  const canProceed = () => {
    const step = activeSteps[currentStep];
    switch (step.id) {
      case 'date':
        if (!eventDate) return false;
        if (!dateAvailability?.available) return false;
        if (effectivePricingType === 'hourly' && !timeAvailability?.available) return false;
        return true;
      case 'details':
        return validateDetailsStep();
      case 'address':
        // Must have basic address fields
        if (!addressLine1.trim() || !city.trim() || !state.trim()) return false;
        // Block while geocoding
        if (geocodingAddress) return false;
        // If we have Event Pro coordinates and event coordinates, check service area
        if (vendorBaseLat && vendorBaseLng && eventLat && eventLng) {
          return isWithinServiceArea;
        }
        // If Event Pro has no base coordinates, allow proceeding
        return true;
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

    if (!contactName.trim() || !contactPhone.trim()) {
      toast({
        title: "Contact info required",
        description: "Please provide your name and phone number so the Event Pro can reach you",
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
    const customerName = contactName.trim();
    const customerPhone = contactPhone.trim();

    // Build unit type label based on pricing
    const getUnitTypeLabel = () => {
      switch (effectivePricingType) {
        case 'hourly': return 'hour';
        case 'daily': return 'day';
        case 'per_guest': return 'guest';
        case 'per_item': return 'item';
        default: return 'event';
      }
    };

    // Calculate duration for booking
    const getDurationMinutes = () => {
      if (effectivePricingType === 'hourly') {
        return units * 60;
      }
      if (effectivePricingType === 'daily' || effectivePricingType === 'flat') {
        return dailyDuration;
      }
      return durationMinutes || 240;
    };

    // Create the booking first
    const result = await createBooking({
      vendor_id: vendorUserId,
      vendor_user_id: vendorUserId,
      package_id: packageId,
      event_date: format(eventDate, 'yyyy-MM-dd'),
      event_location: pickupOnly ? 'Pickup' : fullAddress,
      address_line1: pickupOnly ? '' : addressLine1,
      address_line2: pickupOnly ? '' : addressLine2 || undefined,
      event_city: pickupOnly ? '' : city,
      event_state: pickupOnly ? '' : state,
      event_zip: pickupOnly ? '' : zipCode,
      units: units,
      add_ons: [],
      total_price: subtotalWithTravel, // Base + travel, platform fee added at checkout
      notes: notes || null,
      payment_method: paymentMethod,
      booking_mode: bookingMode,
      vendor_name: vendorName,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      package_name: packageName,
      unit_type: getUnitTypeLabel(),
      start_time: effectivePricingType === 'hourly' ? startTime : (startTime || null),
      end_time: effectivePricingType === 'hourly' ? endTime : null,
      duration_minutes: getDurationMinutes(),
      cancellation_policy: cancellationPolicy,
      is_guest: !user,
    });

    if (!result) {
      trackBookingFailed({ packageId, errorCode: 'create_failed', reason: 'Failed to create booking' });
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

        // Structured error from edge function (200 with error code)
        if (data?.error) {
          trackBookingFailed({ packageId, errorCode: data.error, reason: data.message });
          const allowsCash = paymentOptions === 'CASH' || paymentOptions === 'BOTH';
          toast({
            title: data.error === 'vendor_payments_not_setup'
              ? "Online payments unavailable"
              : "Payment setup issue",
            description: allowsCash
              ? `${data.message} We've kept your booking — you can pay in person at the event.`
              : data.message,
            variant: "destructive",
          });
          // Booking already created; show success screen so customer has confirmation
          setSubmitting(false);
          setSuccess(true);
          return;
        }

        if (data?.url) {
          // Track booking completion before redirect (Stripe will confirm)
          trackBookingCompleted({
            bookingId: result.id,
            packageId,
            isRequest: bookingMode !== 'INSTANT',
          });
          // Redirect to Stripe checkout
          window.location.href = data.url;
          return;
        }
      } catch (err: any) {
        console.error('Checkout error:', err);
        trackBookingFailed({ packageId, errorCode: 'checkout_error', reason: err?.message || 'Payment setup failed' });
        toast({
          title: "Payment setup failed",
          description: "Your booking was created but payment could not be processed. Please try again from your dashboard, or contact the Event Pro to arrange payment.",
          variant: "destructive"
        });
        setSubmitting(false);
        setSuccess(true);
        return;
      }
    } else {
      // Cash payment or request - track completion
      trackBookingCompleted({
        bookingId: result.id,
        packageId,
        isRequest: bookingMode !== 'INSTANT',
      });
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

                {effectivePricingType === 'hourly' && eventDate && dateAvailability?.available && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Start Time <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          End Time <span className="text-destructive">*</span>
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

                    {/* Minimum hours validation */}
                    {units < (minHours || 1) && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Minimum {minHours || 1} hour{(minHours || 1) > 1 ? 's' : ''} required
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

                    {/* Real-time price preview */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        ${price}/hr × {units} hrs = <span className="text-primary">${(price * units).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {effectivePricingType !== 'hourly' && eventDate && dateAvailability?.available && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Available on {format(eventDate, 'PPP')}</span>
                      </div>
                    </div>

                    {/* Start time and duration for daily/flat bookings */}
                    {(effectivePricingType === 'daily' || effectivePricingType === 'flat') && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Start Time
                            </label>
                            <Select 
                              value={startTime} 
                              onValueChange={setStartTime}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
                                  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
                                  '20:00', '21:00', '22:00'].map(time => {
                                  const [h] = time.split(':');
                                  const hour = parseInt(h);
                                  const label = hour >= 12 
                                    ? `${hour === 12 ? 12 : hour - 12}:00 PM` 
                                    : `${hour}:00 AM`;
                                  return (
                                    <SelectItem key={time} value={time}>
                                      {label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Duration
                            </label>
                            <Select 
                              value={dailyDuration.toString()} 
                              onValueChange={(v) => setDailyDuration(parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="180">3 hours</SelectItem>
                                <SelectItem value="240">4 hours</SelectItem>
                                <SelectItem value="300">5 hours</SelectItem>
                                <SelectItem value="360">6 hours</SelectItem>
                                <SelectItem value="420">7 hours</SelectItem>
                                <SelectItem value="480">8 hours</SelectItem>
                                <SelectItem value="600">10 hours</SelectItem>
                                <SelectItem value="720">12 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Event: {(() => {
                            const [h] = startTime.split(':');
                            const startHour = parseInt(h);
                            const startLabel = startHour >= 12 
                              ? `${startHour === 12 ? 12 : startHour - 12}:00 PM` 
                              : `${startHour}:00 AM`;
                            const endHour = startHour + Math.floor(dailyDuration / 60);
                            const endLabel = endHour >= 12 
                              ? `${endHour === 12 ? 12 : endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 && endHour < 24 ? 'PM' : 'AM'}` 
                              : `${endHour}:00 AM`;
                            return `${startLabel} – ${endLabel}`;
                          })()}
                        </p>
                      </>
                    )}

                    {/* Per guest and per item don't need time selection typically */}
                    {(effectivePricingType === 'per_guest' || effectivePricingType === 'per_item') && (
                      <p className="text-sm text-muted-foreground">
                        You'll specify guest count / quantity in the next step.
                      </p>
                    )}

                    {/* Custom quote notice */}
                    {effectivePricingType === 'custom_quote' && (
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground">
                          This package requires a custom quote. The Event Pro will provide pricing after reviewing your request.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {eventDate && dateAvailability?.available && (effectivePricingType !== 'hourly' || timeAvailability?.available) && (
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
            {/* Guest-only email field */}
            {!user && (
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
            )}

            {/* Contact info — required for everyone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Jane Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shared with the Event Pro
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For event-day coordination & support
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Type <span className="text-destructive">*</span>
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

            {/* Per-guest pricing - required guest count */}
            {effectivePricingType === 'per_guest' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Guests <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min={minGuests || 1}
                  max={maxGuests || undefined}
                  placeholder={maxGuests ? `${minGuests || 1} - ${maxGuests} guests` : `Minimum ${minGuests || 1} guests`}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
                {parseInt(guestCount) < (minGuests || 1) && guestCount && (
                  <p className="text-xs text-destructive mt-1">
                    Minimum {minGuests || 1} guests required
                  </p>
                )}
                {maxGuests && parseInt(guestCount) > maxGuests && (
                  <p className="text-xs text-destructive mt-1">
                    Maximum {maxGuests} guests allowed
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Price: ${price}/guest × {guestCount || minGuests || 1} = ${(price * (parseInt(guestCount) || minGuests || 1)).toFixed(2)}
                  {maxGuests && <span className="ml-2">(max {maxGuests})</span>}
                </p>
              </div>
            )}

            {/* Per-item pricing - required quantity */}
            {effectivePricingType === 'per_item' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <PackageIcon className="w-4 h-4 inline mr-1" />
                  Quantity <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min={minItems || minUnits || 1}
                  max={maxItems || undefined}
                  placeholder={maxItems ? `${minItems || minUnits || 1} - ${maxItems} items` : `Minimum ${minItems || minUnits || 1} items`}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
                {parseInt(itemQuantity) < (minItems || minUnits || 1) && itemQuantity && (
                  <p className="text-xs text-destructive mt-1">
                    Minimum {minItems || minUnits || 1} items required
                  </p>
                )}
                {maxItems && parseInt(itemQuantity) > maxItems && (
                  <p className="text-xs text-destructive mt-1">
                    Maximum {maxItems} items allowed
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Price: ${price}/item × {itemQuantity || minItems || minUnits || 1} = ${(price * (parseInt(itemQuantity) || minItems || minUnits || 1)).toFixed(2)}
                  {maxItems && <span className="ml-2">(max {maxItems})</span>}
                </p>
              </div>
            )}

            {/* Optional guest count for other pricing types */}
            {effectivePricingType !== 'per_guest' && effectivePricingType !== 'per_item' && (
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
                <p className="text-xs text-muted-foreground mt-1">
                  Helps the Event Pro prepare for your event
                </p>
              </div>
            )}

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

            {/* Geocoding status */}
            {geocodingAddress && addressLine1.trim() && city.trim() && state && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Calculating distance to event location...</span>
              </div>
            )}

            {/* Distance & travel info */}
            {!geocodingAddress && distanceMiles !== null && (
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
                      <div className="space-y-2">
                        <p className="text-sm text-destructive">
                          This location is outside the Event Pro's service area ({maxTravelMiles} mi max)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please choose a different location or contact the Event Pro directly to discuss travel options.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Pro has no base location warning */}
            {!geocodingAddress && addressLine1.trim() && city.trim() && state && !vendorBaseLat && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Travel distance cannot be calculated. Contact the Event Pro for travel fees if applicable.
                </p>
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
            {/* Booking Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CalendarAlt className="w-4 h-4 text-primary" />
                Booking Details
              </h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium text-foreground">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium text-foreground">{vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {eventDate ? format(eventDate, 'EEEE, MMMM d, yyyy') : '-'}
                </span>
              </div>
              {effectivePricingType === 'hourly' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{startTime} - {endTime} ({units} hrs)</span>
                </div>
              )}
              {effectivePricingType === 'per_guest' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest Count</span>
                  <span className="font-medium text-foreground">{guestCount} guests</span>
                </div>
              )}
              {effectivePricingType === 'per_item' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium text-foreground">{itemQuantity} items</span>
                </div>
              )}
              {(effectivePricingType === 'daily' || effectivePricingType === 'flat') && dailyDuration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{Math.floor(dailyDuration / 60)}h {dailyDuration % 60 > 0 ? `${dailyDuration % 60}m` : ''}</span>
                </div>
              )}
              {!pickupOnly && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground text-right max-w-[200px]">
                    {addressLine1}, {city}, {state} {zipCode}
                  </span>
                </div>
              )}
              {pickupOnly && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">Pickup from Event Pro</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  {paymentMethod === 'stripe' ? (
                    <><CreditCard className="w-4 h-4" /> Card</>
                  ) : (
                    <><Banknote className="w-4 h-4" /> Cash at event</>
                  )}
                </span>
              </div>
            </div>

            {/* What's Included */}
            {includes && includes.length > 0 && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  What's Included
                </h4>
                <ul className="space-y-1">
                  {includes.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Check className="w-3 h-3 text-primary mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements from Event Pro */}
            {((requirements && requirements.length > 0) || customerRequirements) && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Requirements & Notes
                </h4>
                {requirements && requirements.length > 0 && (
                  <ul className="space-y-1">
                    {requirements.map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-600 shrink-0">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                )}
                {customerRequirements && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {customerRequirements}
                  </p>
                )}
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Price Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ${price} × {(() => {
                    switch (effectivePricingType) {
                      case 'hourly': return `${units} hrs`;
                      case 'daily': return `${units} day${units > 1 ? 's' : ''}`;
                      case 'per_guest': return `${units} guest${units > 1 ? 's' : ''}`;
                      case 'per_item': return `${units} item${units > 1 ? 's' : ''}`;
                      case 'flat':
                      case 'custom_quote':
                      default: return '1 event';
                    }
                  })()}
                </span>
                <span>${baseTotal.toFixed(2)}</span>
              </div>
              {effectiveTravelFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    Travel fee ({Math.round(distanceMiles! - includedTravelMiles)} mi)
                  </span>
                  <span>${effectiveTravelFee.toFixed(2)}</span>
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

            {/* Cancellation & Refund Policy */}
            <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Cancellation & Refund Policy</span>
                <CancellationPolicyBadge policyType={cancellationPolicy} />
              </div>
              <div className="space-y-1">
                {policyDetails.tiers.map((tier, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tier.label}</span>
                    <span className={tier.refundPercentage === 100 ? 'text-trust font-medium' : tier.refundPercentage === 0 ? 'text-destructive' : 'text-foreground'}>
                      {tier.refundPercentage}% refund
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                <p>• Deposits are non-refundable except within 1 hour of booking (if event is 7+ days away)</p>
                <p>• Full refund including deposit if the Event Pro cancels</p>
                <p>• Platform fee (12.9%) is non-refundable unless the Event Pro cancels</p>
              </div>
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
