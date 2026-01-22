import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, addWeeks } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, Clock, MapPin, Loader2, 
  CheckCircle, ChevronRight, ChevronLeft, AlertCircle,
  Repeat, CreditCard, AlertTriangle, TrendingUp, Users,
  Check, Truck, Tent, Table, Store, Zap, Droplets, Wifi,
  Building, User, Phone, Mail, FileText, DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SlotType, InventoryItem } from '@/hooks/useMarketDetail';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryPicker } from './InventoryPicker';

const PLATFORM_FEE_RATE = 0.129;

type BookingStep = 'slot-datetime' | 'frequency' | 'vendor-info' | 'setup-needs' | 'review';
type RecurringDuration = 'one-time' | '4-weeks' | '8-weeks' | '12-weeks';
type VendorType = 'booth' | 'food-truck' | 'trailer' | 'table' | 'indoor-stall';

const VENDOR_CATEGORIES = [
  'Food Truck',
  'Pop-up Food',
  'Artisan',
  'Bakery/Cottage Bakery',
  'Coffee Cart',
  'Apparel',
  'Jewelry',
  'Home Goods',
  'Plants',
  'Art',
  'Crafts',
  'Other'
];

const BOOTH_SIZES = ['5x5', '10x10', '10x15', '10x20', 'Custom'];

interface MarketBookingStepperProps {
  marketId: string;
  marketName: string;
  marketAddress: string;
  slotTypes: SlotType[];
  inventory: InventoryItem[];
  bookingsEnabled: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlotType?: SlotType | null;
  initialInventory?: InventoryItem | null;
}

export function MarketBookingStepper({
  marketId,
  marketName,
  marketAddress,
  slotTypes,
  inventory,
  bookingsEnabled,
  isOpen,
  onOpenChange,
  initialSlotType,
  initialInventory,
}: MarketBookingStepperProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Step state
  const [currentStep, setCurrentStep] = useState<BookingStep>('slot-datetime');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Step 1: Slot Type & Date/Time
  const [selectedSlotType, setSelectedSlotType] = useState<SlotType | null>(initialSlotType || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(initialInventory?.id);
  
  // Step 2: Frequency
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDuration, setRecurringDuration] = useState<RecurringDuration>('4-weeks');
  
  // Step 3: Vendor Info
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState(user?.email || '');
  
  // Step 4: Setup Needs
  const [vendorType, setVendorType] = useState<VendorType>('booth');
  const [boothSize, setBoothSize] = useState('10x10');
  const [truckLengthFeet, setTruckLengthFeet] = useState<number | undefined>();
  const [hasGenerator, setHasGenerator] = useState(false);
  const [needsPower, setNeedsPower] = useState(false);
  const [powerAmps, setPowerAmps] = useState<number | undefined>();
  const [needsWater, setNeedsWater] = useState(false);
  const [needsWifi, setNeedsWifi] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');
  const [setupNotes, setSetupNotes] = useState('');
  
  // Step 5: Review
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketRules, setAgreeMarketRules] = useState(false);
  
  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Sync initial values and user data
  useEffect(() => {
    if (initialSlotType) setSelectedSlotType(initialSlotType);
    if (initialInventory) {
      setSelectedInventoryId(initialInventory.id);
      setSelectedDate(parseISO(initialInventory.date));
    }
    if (user?.email) setVendorEmail(user.email);
  }, [initialSlotType, initialInventory, user]);

  // Check for booking success from Stripe redirect
  useEffect(() => {
    const bookingStatus = searchParams.get('booking');
    const sessionId = searchParams.get('session_id');
    
    if (bookingStatus === 'success' && sessionId) {
      verifyBooking(sessionId);
    }
  }, [searchParams]);

  const verifyBooking = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-slot-booking', {
        body: { sessionId }
      });
      
      if (error) throw error;
      
      setShowConfirmation(true);
      onOpenChange(true);
    } catch (err: any) {
      console.error('Error verifying booking:', err);
      toast({
        title: 'Error',
        description: 'Failed to verify booking. Please check your dashboard.',
        variant: 'destructive'
      });
    }
  };

  // Filter inventory for selected slot type
  const filteredInventory = useMemo(() => {
    if (!selectedSlotType) return inventory;
    return inventory.filter(inv => inv.slotTypeId === selectedSlotType.id);
  }, [inventory, selectedSlotType]);

  // Get selected inventory item
  const selectedInventory = useMemo(() => {
    if (!selectedInventoryId) return null;
    return inventory.find(inv => inv.id === selectedInventoryId) || null;
  }, [inventory, selectedInventoryId]);

  // Get available count for each slot type
  const slotTypeAvailability = useMemo(() => {
    const counts: Record<string, { remaining: number; total: number }> = {};
    inventory.forEach(inv => {
      if (!counts[inv.slotTypeId]) {
        counts[inv.slotTypeId] = { remaining: 0, total: 0 };
      }
      counts[inv.slotTypeId].remaining += inv.slotsRemaining;
      counts[inv.slotTypeId].total += inv.totalSlots;
    });
    return counts;
  }, [inventory]);

  // Calculate recurring weeks availability
  const recurringWeeksAvailable = useMemo(() => {
    if (!selectedDate || !selectedSlotType || !selectedInventory || !isRecurring) return [];
    
    const weekCount = parseInt(recurringDuration.replace('-weeks', '')) || 1;
    const startTime = selectedInventory.startTime;
    const endTime = selectedInventory.endTime;
    
    const weeks: { date: Date; available: boolean; inventoryId?: string }[] = [];
    
    for (let i = 0; i < weekCount; i++) {
      const weekDate = addWeeks(selectedDate, i);
      const dateStr = format(weekDate, 'yyyy-MM-dd');
      
      const matchingInventory = filteredInventory.find(inv => 
        inv.date === dateStr && 
        inv.startTime === startTime && 
        inv.endTime === endTime &&
        inv.slotsRemaining > 0
      );
      
      weeks.push({
        date: weekDate,
        available: !!matchingInventory,
        inventoryId: matchingInventory?.id,
      });
    }
    
    return weeks;
  }, [selectedDate, selectedSlotType, selectedInventory, recurringDuration, filteredInventory, isRecurring]);

  const availableWeeks = recurringWeeksAvailable.filter(w => w.available);
  const allWeeksAvailable = recurringWeeksAvailable.length > 0 && availableWeeks.length === recurringWeeksAvailable.length;

  // Calculate inventory IDs to book
  const inventoryIdsToBook = useMemo(() => {
    if (!selectedInventory) return [];
    if (!isRecurring) return [selectedInventory.id];
    return availableWeeks.map(w => w.inventoryId!).filter(Boolean);
  }, [selectedInventory, isRecurring, availableWeeks]);

  // Price calculations
  const basePrice = useMemo(() => {
    if (!selectedSlotType) return 0;
    return selectedInventory?.priceOverride || selectedSlotType.price;
  }, [selectedSlotType, selectedInventory]);

  const numWeeks = isRecurring ? inventoryIdsToBook.length : 1;
  const subtotal = basePrice * numWeeks;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const grandTotal = subtotal + platformFee;

  // Format time helper
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Step navigation
  const steps: { id: BookingStep; label: string }[] = [
    { id: 'slot-datetime', label: 'Slot & Date' },
    { id: 'frequency', label: 'Frequency' },
    { id: 'vendor-info', label: 'Vendor Info' },
    { id: 'setup-needs', label: 'Setup Needs' },
    { id: 'review', label: 'Review & Pay' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'slot-datetime':
        return !!selectedSlotType && !!selectedInventory;
      case 'frequency':
        return !isRecurring || (isRecurring && inventoryIdsToBook.length > 0);
      case 'vendor-info':
        return vendorName.trim() && vendorCategory && vendorEmail.trim();
      case 'setup-needs':
        return !!vendorType;
      case 'review':
        return agreeTerms && agreeMarketRules;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  // Handle slot type selection
  const handleSelectSlotType = (st: SlotType) => {
    setSelectedSlotType(st);
    setSelectedDate(undefined);
    setSelectedInventoryId(undefined);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedInventoryId(undefined);
    
    if (date && selectedSlotType) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const available = filteredInventory.find(
        inv => inv.date === dateStr && inv.slotsRemaining > 0
      );
      if (available) {
        setSelectedInventoryId(available.id);
      }
    }
  };

  // Handle payment - supports both logged-in users and guest checkout
  const handlePay = async () => {
    // Validate required fields
    if (!selectedSlotType || !selectedInventory || inventoryIdsToBook.length === 0) {
      toast({
        title: 'Error',
        description: 'Please complete all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Validate email is provided (required for guest checkout)
    if (!vendorEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please provide an email address for booking confirmation',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-slot-booking-checkout', {
        body: {
          marketId,
          marketName,
          slotTypeId: selectedSlotType.id,
          slotTypeName: selectedSlotType.name,
          inventoryIds: inventoryIdsToBook,
          vendorName: vendorName.trim(),
          vendorEmail: vendorEmail.trim(),
          vendorPhone: vendorPhone.trim(),
          vendorCategory,
          vendorType,
          boothSize: vendorType === 'booth' || vendorType === 'table' ? boothSize : undefined,
          truckLengthFeet: vendorType === 'food-truck' || vendorType === 'trailer' ? truckLengthFeet : undefined,
          hasGenerator,
          needsPower,
          powerAmps: needsPower ? powerAmps : undefined,
          needsWater,
          needsWifi,
          arrivalTime: arrivalTime || undefined,
          setupNotes: setupNotes.trim() || undefined,
          notes: '',
          isRecurring,
          baseAmount: subtotal,
          platformFeeAmount: platformFee,
          totalAmount: grandTotal,
          // For guest checkout, email is already in vendorEmail
          guestEmail: !user ? vendorEmail.trim() : undefined,
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: err.message || 'Failed to start checkout',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  // Urgency badge helper
  const getUrgencyBadge = (remaining: number, total: number) => {
    if (remaining <= 0) return <Badge variant="destructive">Sold Out</Badge>;
    if (remaining <= 3) return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        Only {remaining} left
      </Badge>
    );
    if (remaining <= 10 || remaining / total <= 0.2) return (
      <Badge variant="trust" className="gap-1">
        <TrendingUp className="w-3 h-3" />
        Selling fast
      </Badge>
    );
    return null;
  };

  const renderStepContent = () => {
    if (showConfirmation) {
      return (
        <div className="text-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-trust/20 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-trust" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">
              You're Booked! ✅
            </h3>
            <p className="text-muted-foreground">
              Your spot at <span className="font-medium text-foreground">{marketName}</span> is confirmed.
            </p>
          </div>
          
          {selectedInventory && selectedSlotType && (
            <Card variant="glass" className="text-left">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{marketAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tent className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedSlotType.name}</span>
                </div>
                {isRecurring && inventoryIdsToBook.length > 1 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Repeat className="w-4 h-4 text-muted-foreground" />
                      <span>{inventoryIdsToBook.length} weekly dates booked</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(parseISO(selectedInventory.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(selectedInventory.startTime)} – {formatTime(selectedInventory.endTime)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-bold text-foreground">${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-3">
            <Button 
              variant="gradient" 
              size="lg"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              View My Bookings
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowConfirmation(false);
                setCurrentStep('slot-datetime');
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'slot-datetime':
        return (
          <div className="space-y-6">
            {/* Slot Type Selection */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Choose Your Spot</h4>
              <div className="space-y-3">
                {slotTypes.map(st => {
                  const availability = slotTypeAvailability[st.id];
                  const urgency = availability ? getUrgencyBadge(availability.remaining, availability.total) : null;
                  
                  return (
                    <div 
                      key={st.id}
                      onClick={() => handleSelectSlotType(st)}
                      className={cn(
                        "relative p-4 rounded-xl border cursor-pointer transition-all",
                        selectedSlotType?.id === st.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary" 
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-foreground">{st.name}</h5>
                            {selectedSlotType?.id === st.id && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{st.category}</Badge>
                            {st.sizePreset && <span className="text-xs text-muted-foreground">{st.sizePreset}</span>}
                          </div>
                          {st.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {st.amenities.slice(0, 3).map(amenity => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {st.amenities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{st.amenities.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          {urgency && <div className="mt-2">{urgency}</div>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-foreground">${st.price}</div>
                          <div className="text-xs text-muted-foreground">/spot</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date/Time Selection */}
            {selectedSlotType && (
              <div>
                <h4 className="font-medium text-foreground mb-3">Select Date & Time</h4>
                <InventoryPicker
                  inventory={filteredInventory}
                  slotType={selectedSlotType}
                  selectedDate={selectedDate}
                  selectedInventoryId={selectedInventoryId}
                  onDateSelect={handleDateSelect}
                  onInventorySelect={setSelectedInventoryId}
                />
                
                {selectedInventory && (
                  <div className="mt-4 p-3 rounded-lg bg-trust/10 border border-trust/30">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-trust" />
                      <span className="text-sm font-medium text-trust">
                        {selectedInventory.slotsRemaining} spot{selectedInventory.slotsRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h4 className="font-display text-lg font-bold text-foreground">Booking Frequency</h4>
              <p className="text-sm text-muted-foreground">Book once or reserve weekly</p>
            </div>

            <RadioGroup
              value={isRecurring ? recurringDuration : 'one-time'}
              onValueChange={(val) => {
                if (val === 'one-time') {
                  setIsRecurring(false);
                } else {
                  setIsRecurring(true);
                  setRecurringDuration(val as RecurringDuration);
                }
              }}
              className="space-y-3"
            >
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                !isRecurring ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border"
              )}>
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                  <div className="font-medium">One-time booking</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedInventory && format(parseISO(selectedInventory.date), 'EEEE, MMM d')}
                  </div>
                </Label>
                <div className="text-right">
                  <div className="font-bold">${basePrice.toFixed(2)}</div>
                </div>
              </div>

              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Weekly Recurring</p>

              {(['4-weeks', '8-weeks', '12-weeks'] as RecurringDuration[]).map(duration => {
                const weeks = parseInt(duration.replace('-weeks', ''));
                const total = basePrice * weeks;
                return (
                  <div 
                    key={duration}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      isRecurring && recurringDuration === duration 
                        ? "border-primary bg-primary/5 ring-2 ring-primary" 
                        : "border-border"
                    )}
                  >
                    <RadioGroupItem value={duration} id={duration} />
                    <Label htmlFor={duration} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-primary" />
                        <span className="font-medium">{weeks} weeks</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Every {selectedInventory && format(parseISO(selectedInventory.date), 'EEEE')}
                      </div>
                    </Label>
                    <div className="text-right">
                      <div className="font-bold">${total.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">${basePrice}/week</div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {isRecurring && !allWeeksAvailable && recurringWeeksAvailable.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">
                      {availableWeeks.length} of {recurringWeeksAvailable.length} weeks available
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Some weeks are sold out. You'll be booked for available dates only.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'vendor-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h4 className="font-display text-lg font-bold text-foreground">Vendor Details</h4>
              <p className="text-sm text-muted-foreground">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="vendorName">Business / Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Your business name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Vendor Category *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {VENDOR_CATEGORIES.map(cat => (
                    <Badge
                      key={cat}
                      variant={vendorCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => setVendorCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorEmail">Email *</Label>
                  <Input
                    id="vendorEmail"
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorPhone">Phone</Label>
                  <Input
                    id="vendorPhone"
                    type="tel"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'setup-needs':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h4 className="font-display text-lg font-bold text-foreground">Setup & Footprint</h4>
              <p className="text-sm text-muted-foreground">Help the market prepare for your arrival</p>
            </div>

            <div>
              <Label>Vendor Type *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { id: 'booth', icon: Tent, label: 'Booth/Tent' },
                  { id: 'food-truck', icon: Truck, label: 'Food Truck' },
                  { id: 'trailer', icon: Truck, label: 'Trailer' },
                  { id: 'table', icon: Table, label: 'Table' },
                  { id: 'indoor-stall', icon: Store, label: 'Indoor Stall' },
                ].map(type => (
                  <div
                    key={type.id}
                    onClick={() => setVendorType(type.id as VendorType)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      vendorType === type.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <type.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size/Footprint based on vendor type */}
            {(vendorType === 'booth' || vendorType === 'table') && (
              <div>
                <Label>Booth Size</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BOOTH_SIZES.map(size => (
                    <Badge
                      key={size}
                      variant={boothSize === size ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setBoothSize(size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(vendorType === 'food-truck' || vendorType === 'trailer') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="truckLength">Vehicle Length (feet)</Label>
                  <Input
                    id="truckLength"
                    type="number"
                    value={truckLengthFeet || ''}
                    onChange={(e) => setTruckLengthFeet(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 24"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={hasGenerator}
                    onCheckedChange={setHasGenerator}
                  />
                  <Label>I'll bring a generator</Label>
                </div>
              </div>
            )}

            {/* Amenities Needed */}
            <div className="space-y-3">
              <Label>Amenities Needed</Label>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Power access</span>
                </div>
                <Switch checked={needsPower} onCheckedChange={setNeedsPower} />
              </div>
              
              {needsPower && (
                <div className="ml-6">
                  <Label htmlFor="powerAmps">Amps needed</Label>
                  <Input
                    id="powerAmps"
                    type="number"
                    value={powerAmps || ''}
                    onChange={(e) => setPowerAmps(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 20"
                    className="mt-1 w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Water access</span>
                </div>
                <Switch checked={needsWater} onCheckedChange={setNeedsWater} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <span>Wi-Fi</span>
                </div>
                <Switch checked={needsWifi} onCheckedChange={setNeedsWifi} />
              </div>
            </div>

            <div>
              <Label htmlFor="arrivalTime">Planned Arrival Time (optional)</Label>
              <Input
                id="arrivalTime"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="setupNotes">Setup Notes (optional)</Label>
              <Textarea
                id="setupNotes"
                value={setupNotes}
                onChange={(e) => setSetupNotes(e.target.value)}
                placeholder="Any special requirements or notes for the market host..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h4 className="font-display text-lg font-bold text-foreground">Review & Pay</h4>
              <p className="text-sm text-muted-foreground">Confirm your booking details</p>
            </div>

            {/* Booking Summary */}
            <Card variant="glass">
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Market</p>
                  <p className="font-semibold text-foreground">{marketName}</p>
                  <p className="text-sm text-muted-foreground">{marketAddress}</p>
                </div>
                
                {selectedSlotType && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Spot Type</p>
                    <p className="font-medium text-foreground">{selectedSlotType.name}</p>
                    {selectedSlotType.sizePreset && (
                      <p className="text-sm text-muted-foreground">{selectedSlotType.sizePreset}</p>
                    )}
                  </div>
                )}

                {selectedInventory && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {isRecurring ? 'Dates' : 'Date'}
                    </p>
                    {isRecurring ? (
                      <div className="space-y-1">
                        {availableWeeks.slice(0, 4).map((week, i) => (
                          <p key={i} className="text-sm">
                            {format(week.date, 'EEE, MMM d')}
                          </p>
                        ))}
                        {availableWeeks.length > 4 && (
                          <p className="text-sm text-muted-foreground">
                            +{availableWeeks.length - 4} more dates
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium text-foreground">
                        {format(parseISO(selectedInventory.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatTime(selectedInventory.startTime)} – {formatTime(selectedInventory.endTime)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vendor</p>
                  <p className="font-medium text-foreground">{vendorName}</p>
                  <p className="text-sm text-muted-foreground">{vendorCategory} • {vendorType}</p>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card variant="glass">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${basePrice.toFixed(2)} × {numWeeks} {numWeeks === 1 ? 'spot' : 'spots'}
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee (12.9%)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="gradient-text">${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-normal cursor-pointer">
                  I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary underline">Privacy Policy</a>
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="rules" 
                  checked={agreeMarketRules}
                  onCheckedChange={(checked) => setAgreeMarketRules(!!checked)}
                />
                <Label htmlFor="rules" className="text-sm leading-normal cursor-pointer">
                  I agree to the market rules and understand the cancellation policy
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Step indicator
  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, i) => (
        <div 
          key={step.id}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all",
            i === currentStepIndex 
              ? "w-8 bg-primary" 
              : i < currentStepIndex 
                ? "bg-primary/50"
                : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  // Navigation buttons
  const renderNav = () => {
    if (showConfirmation) return null;

    const isLastStep = currentStep === 'review';

    return (
      <div className="flex gap-3 pt-4 border-t">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={handleBack} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <Button 
          variant="gradient" 
          className="flex-1 gap-1"
          onClick={isLastStep ? handlePay : handleNext}
          disabled={!canProceed() || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : isLastStep ? (
            <>
              <CreditCard className="w-4 h-4" />
              Pay ${grandTotal.toFixed(2)}
            </>
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

  const content = (
    <div className="relative">
      {!showConfirmation && stepIndicator}
      {renderStepContent()}
      {renderNav()}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-auto">
          <SheetTitle className="sr-only">Book a Spot</SheetTitle>
          <div className="pt-4 pb-8">
            {!showConfirmation && (
              <h2 className="font-display text-xl font-bold text-center mb-2">
                {steps[currentStepIndex]?.label || 'Book'}
              </h2>
            )}
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogTitle className="font-display text-xl font-bold text-center">
          {showConfirmation ? '' : steps[currentStepIndex]?.label || 'Book a Spot'}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
