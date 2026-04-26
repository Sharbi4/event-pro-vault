import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, addWeeks, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Calendar, Clock, MapPin, Loader2, 
  CheckCircle, ChevronRight, ChevronLeft, AlertCircle,
  Repeat, CreditCard, AlertTriangle, TrendingUp, Users,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SlotType, InventoryItem, BookingRequest } from '@/hooks/useMarketDetail';
import { cn } from '@/lib/utils';
import { SlotTypeCard } from './SlotTypeCard';
import { InventoryPicker } from './InventoryPicker';

const BOOKING_FEE_PERCENT = 12.9;

interface BookingStepperProps {
  marketId: string;
  marketName: string;
  slotTypes: SlotType[];
  inventory: InventoryItem[];
  bookingsEnabled: boolean;
  bookingInProgress: boolean;
  onBook: (request: BookingRequest) => Promise<boolean>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlotType?: SlotType | null;
  initialInventory?: InventoryItem | null;
}

type BookingStep = 'slot' | 'datetime' | 'options' | 'review';
type RecurringDuration = 'one-time' | '4-weeks' | '8-weeks' | '12-weeks';

export function BookingStepper({
  marketId,
  marketName,
  slotTypes,
  inventory,
  bookingsEnabled,
  bookingInProgress,
  onBook,
  isOpen,
  onOpenChange,
  initialSlotType,
  initialInventory,
}: BookingStepperProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState<BookingStep>('slot');
  
  // Selection state
  const [selectedSlotType, setSelectedSlotType] = useState<SlotType | null>(initialSlotType || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(initialInventory?.id);
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDuration, setRecurringDuration] = useState<RecurringDuration>('4-weeks');
  
  // Event Pro info
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Sync initial values
  useEffect(() => {
    if (initialSlotType) setSelectedSlotType(initialSlotType);
    if (initialInventory) {
      setSelectedInventoryId(initialInventory.id);
      setSelectedDate(parseISO(initialInventory.date));
    }
  }, [initialSlotType, initialInventory]);

  // Check for reserve param from auth redirect
  useEffect(() => {
    if (searchParams.get('reserve') === '1') {
      onOpenChange(true);
    }
  }, [searchParams, onOpenChange]);

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
    if (!selectedDate || !selectedSlotType || !selectedInventory) return [];
    
    const weekCount = parseInt(recurringDuration.replace('-weeks', '')) || 1;
    const dayOfWeek = selectedDate.getDay();
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
  }, [selectedDate, selectedSlotType, selectedInventory, recurringDuration, filteredInventory]);

  const availableWeeks = recurringWeeksAvailable.filter(w => w.available);

  // Price calculations
  const basePrice = useMemo(() => {
    if (!selectedSlotType) return 0;
    return selectedInventory?.priceOverride || selectedSlotType.price;
  }, [selectedSlotType, selectedInventory]);

  const bookingFee = useMemo(() => {
    return Math.round(basePrice * (BOOKING_FEE_PERCENT / 100) * 100) / 100;
  }, [basePrice]);

  const totalPerSpot = basePrice + bookingFee;

  const weeksToBook = isRecurring ? availableWeeks.length : 1;
  const totalToday = isRecurring ? totalPerSpot : totalPerSpot;
  const weeklyCharge = totalPerSpot;

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
    { id: 'slot', label: 'Slot Type' },
    { id: 'datetime', label: 'Date & Time' },
    { id: 'options', label: 'Options' },
    { id: 'review', label: 'Review & Pay' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'slot':
        return !!selectedSlotType;
      case 'datetime':
        return !!selectedInventory;
      case 'options':
        return true;
      case 'review':
        return true;
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
    
    // Auto-select first available time window for the date
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

  // Handle booking submission
  const handleBook = async () => {
    if (!user) {
      sessionStorage.setItem('marketBookingReturn', window.location.pathname + '?reserve=1');
      navigate('/auth');
      return;
    }

    if (!selectedSlotType || !selectedInventory) return;

    // For MVP, just book the first occurrence
    const success = await onBook({
      slotInventoryId: selectedInventory.id,
      slotTypeId: selectedSlotType.id,
      vendorName: vendorName.trim() || undefined,
      vendorEmail: vendorEmail.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (success) {
      setShowConfirmation(true);
    }
  };

  // Get urgency indicators for inventory
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
              You're Reserved!
            </h3>
            <p className="text-muted-foreground">
              Your spot at <span className="font-medium text-foreground">{marketName}</span> is confirmed.
            </p>
          </div>
          
          {selectedInventory && (
            <Card variant="glass" className="text-left">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">{format(parseISO(selectedInventory.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(selectedInventory.startTime)} – {formatTime(selectedInventory.endTime)}</span>
                </div>
                {selectedSlotType && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSlotType.name}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-bold text-foreground">${totalToday.toFixed(2)}</span>
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
              View in Dashboard
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowConfirmation(false);
                setCurrentStep('slot');
                onOpenChange(false);
              }}
            >
              Book Another Spot
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'slot':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Choose Your Spot</h3>
              <p className="text-muted-foreground text-sm">Select the booth or space type that fits your needs</p>
            </div>
            
            <div className="grid gap-4">
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
                          <h4 className="font-semibold text-foreground">{st.name}</h4>
                          {selectedSlotType?.id === st.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{st.category}</Badge>
                          {st.sizePreset && <span className="text-xs text-muted-foreground">{st.sizePreset}</span>}
                          {st.widthFeet && st.lengthFeet && (
                            <span className="text-xs text-muted-foreground">{st.widthFeet}×{st.lengthFeet} ft</span>
                          )}
                        </div>
                        {st.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {st.amenities.slice(0, 4).map(amenity => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {st.amenities.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{st.amenities.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        {urgency && <div className="mt-2">{urgency}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-foreground">${st.price}</div>
                        <div className="text-xs text-muted-foreground">
                          {st.pricingUnit === 'per_day' ? '/day' : st.pricingUnit === 'per_event' ? '/event' : '/weekend'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Select Date & Time</h3>
              <p className="text-muted-foreground text-sm">Choose when you'd like to vend</p>
            </div>
            
            {selectedSlotType && (
              <div className="bg-secondary/50 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Selected slot</p>
                  <p className="font-medium text-foreground">{selectedSlotType.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep('slot')}>
                  Change
                </Button>
              </div>
            )}
            
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
                  {getUrgencyBadge(selectedInventory.slotsRemaining, selectedInventory.totalSlots)}
                </div>
              </div>
            )}
          </div>
        );

      case 'options':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Booking Options</h3>
              <p className="text-muted-foreground text-sm">Choose one-time or weekly recurring</p>
            </div>
            
            {/* Recurring Toggle */}
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Repeat className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Weekly Recurring</p>
                      <p className="text-sm text-muted-foreground">Reserve the same spot every week</p>
                    </div>
                  </div>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>
                
                {isRecurring && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <Label className="text-sm">Duration</Label>
                    <RadioGroup 
                      value={recurringDuration} 
                      onValueChange={(v) => setRecurringDuration(v as RecurringDuration)}
                      className="grid grid-cols-3 gap-2"
                    >
                      {[
                        { value: '4-weeks', label: '4 weeks' },
                        { value: '8-weeks', label: '8 weeks' },
                        { value: '12-weeks', label: '12 weeks' },
                      ].map(option => (
                        <div key={option.value}>
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={option.value}
                            className={cn(
                              "flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all",
                              recurringDuration === option.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    {/* Show weeks availability */}
                    {selectedInventory && recurringWeeksAvailable.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          {availableWeeks.length} of {recurringWeeksAvailable.length} weeks available
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {recurringWeeksAvailable.map((week, idx) => (
                            <Badge 
                              key={idx} 
                              variant={week.available ? "secondary" : "outline"}
                              className={cn(
                                "text-xs",
                                !week.available && "opacity-50 line-through"
                              )}
                            >
                              {format(week.date, 'MMM d')}
                            </Badge>
                          ))}
                        </div>
                        {availableWeeks.length < recurringWeeksAvailable.length && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Some weeks are unavailable and will be skipped
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Event Pro Info */}
            <Card variant="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="vendorName" className="text-xs">Business Name</Label>
                  <Input
                    id="vendorName"
                    placeholder="e.g., Joe's Produce"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorEmail" className="text-xs">Email</Label>
                  <Input
                    id="vendorEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorPhone" className="text-xs">Phone (optional)</Label>
                  <Input
                    id="vendorPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-xs">Notes to host (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What you'll be selling, special requests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Review & Pay</h3>
              <p className="text-muted-foreground text-sm">Confirm your reservation details</p>
            </div>
            
            {/* Booking Summary */}
            <Card variant="glass">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-foreground">Reservation Details</h4>
                
                {selectedSlotType && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedSlotType.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedSlotType.category}</p>
                    </div>
                  </div>
                )}
                
                {selectedInventory && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {format(parseISO(selectedInventory.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(selectedInventory.startTime)} – {formatTime(selectedInventory.endTime)}
                        </p>
                      </div>
                    </div>
                    
                    {isRecurring && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Repeat className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Weekly Recurring</p>
                          <p className="text-sm text-muted-foreground">
                            {availableWeeks.length} weeks starting {format(parseISO(selectedInventory.date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Price Breakdown */}
            <Card variant="gradient">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Summary
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Spot price</span>
                    <span className="text-foreground">${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Booking fee ({BOOKING_FEE_PERCENT}%)</span>
                    <span className="text-foreground">${bookingFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      {isRecurring ? 'Total today' : 'Total'}
                    </span>
                    <span className="text-xl font-bold gradient-text">${totalToday.toFixed(2)}</span>
                  </div>
                  
                  {isRecurring && (
                    <div className="pt-2 border-t border-border mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Recurring weekly charge</span>
                        <span className="font-medium text-foreground">${weeklyCharge.toFixed(2)}/week</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Charged weekly for {availableWeeks.length} weeks (includes {BOOKING_FEE_PERCENT}% fee)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {!bookingsEnabled && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-muted-foreground text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Bookings are not enabled for this market</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Progress Steps */}
      {!showConfirmation && (
        <div className="flex items-center justify-between px-2 py-4 border-b border-border">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  index < currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : index === currentStepIndex
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-8 md:w-12 h-0.5 mx-1",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto py-4 px-1">
        {renderStepContent()}
      </div>
      
      {/* Navigation Buttons */}
      {!showConfirmation && (
        <div className="border-t border-border pt-4 mt-auto">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            {currentStep === 'review' ? (
              <Button
                variant="gradient"
                size="lg"
                className="flex-1"
                disabled={!bookingsEnabled || bookingInProgress || !selectedInventory}
                onClick={handleBook}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : !user ? (
                  'Sign in to Reserve'
                ) : isRecurring ? (
                  'Start Weekly Reservation'
                ) : (
                  'Reserve Spot'
                )}
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {!user && currentStep === 'review' && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              You'll be redirected to sign in before completing your reservation
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-4 flex flex-col">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-left">Reserve a Spot</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
