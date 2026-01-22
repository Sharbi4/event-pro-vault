import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarIcon, Clock, MapPin, CreditCard, Banknote, 
  Zap, ShieldCheck, Check, ChevronLeft, ChevronRight,
  Loader2, Users, FileText, X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

const STEPS = [
  { id: 'date', title: 'Date & Time' },
  { id: 'details', title: 'Event Details' },
  { id: 'payment', title: 'Payment' },
  { id: 'review', title: 'Review' },
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
  initialPaymentMethod = 'stripe'
}: BookingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [eventDate, setEventDate] = useState<Date | undefined>(initialDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [eventType, setEventType] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>(
    paymentOptions === 'CASH' ? 'cash' : initialPaymentMethod
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSuccess(false);
      if (initialDate) setEventDate(initialDate);
      setPaymentMethod(paymentOptions === 'CASH' ? 'cash' : initialPaymentMethod);
    }
  }, [open, initialDate, paymentOptions, initialPaymentMethod]);

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
  const platformFee = paymentMethod === 'stripe' ? baseTotal * PLATFORM_FEE_RATE : 0;
  const grandTotal = baseTotal + platformFee;

  const canProceed = () => {
    const step = activeSteps[currentStep];
    switch (step.id) {
      case 'date':
        return !!eventDate;
      case 'details':
        return !!eventType && !!venue;
      case 'payment':
        return true;
      case 'review':
        return true;
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
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking",
        variant: "destructive"
      });
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    if (!eventDate || !venue) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    const result = await createBooking({
      vendor_id: vendorUserId,
      vendor_user_id: vendorUserId,
      package_id: packageId,
      event_date: format(eventDate, 'yyyy-MM-dd'),
      event_location: venue,
      units: type === 'HOURLY' ? hours : 1,
      add_ons: [],
      total_price: baseTotal,
      notes: notes || null,
      payment_method: paymentMethod,
      booking_mode: bookingMode,
      vendor_name: vendorName,
      customer_name: user?.email?.split('@')[0] || 'Customer',
      customer_email: user?.email || '',
      package_name: packageName,
      unit_type: type === 'HOURLY' ? 'hour' : 'day'
    });

    setSubmitting(false);

    if (result) {
      setSuccess(true);
    }
  };

  const handleViewAllPackages = () => {
    onOpenChange(false);
    navigate(`/pro/${vendorUserId}`);
  };

  const handleViewBookings = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };

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
              ? 'Your booking has been confirmed. Check your email for details.'
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Date
              </label>
              <Calendar
                mode="single"
                selected={eventDate}
                onSelect={setEventDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-xl border mx-auto"
              />
            </div>

            {type === 'HOURLY' && (
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
            )}

            {eventDate && (
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
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Type
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Venue Address
              </label>
              <Input
                placeholder="Enter full address"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
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
                  {venue || '-'}
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
      <DialogContent className="max-w-md">
        <DialogTitle className="font-display text-xl font-bold text-center">
          {stepTitle}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
