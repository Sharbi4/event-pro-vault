import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Calendar, Clock, MapPin, Loader2, 
  CheckCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SlotType, InventoryItem, BookingRequest } from '@/hooks/useMarketDetail';
import { cn } from '@/lib/utils';

interface BookingPanelProps {
  marketName: string;
  slotType: SlotType | null;
  inventoryItem: InventoryItem | null;
  bookingsEnabled: boolean;
  bookingInProgress: boolean;
  onBook: (request: BookingRequest) => Promise<boolean>;
  isMobile?: boolean;
}

export function BookingPanel({
  marketName,
  slotType,
  inventoryItem,
  bookingsEnabled,
  bookingInProgress,
  onBook,
  isMobile = false,
}: BookingPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const price = inventoryItem?.priceOverride || slotType?.price || 0;
  const canBook = slotType && inventoryItem && inventoryItem.slotsRemaining > 0 && bookingsEnabled;

  const handleBook = async () => {
    if (!user) {
      // Save selection to session storage and redirect to auth
      sessionStorage.setItem('marketBookingReturn', window.location.pathname);
      navigate('/auth');
      return;
    }

    if (!slotType || !inventoryItem) return;

    const success = await onBook({
      slotInventoryId: inventoryItem.id,
      slotTypeId: slotType.id,
      vendorName: vendorName.trim() || undefined,
      vendorEmail: vendorEmail.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (success) {
      setShowConfirmation(true);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const panelContent = (
    <>
      {showConfirmation ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-trust/20 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-trust" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            You're Reserved!
          </h3>
          <p className="text-muted-foreground">
            Your spot at <span className="font-medium text-foreground">{marketName}</span> is confirmed.
          </p>
          {inventoryItem && (
            <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(parseISO(inventoryItem.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatTime(inventoryItem.startTime)} – {formatTime(inventoryItem.endTime)}</span>
              </div>
              {slotType && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{slotType.name}</span>
                </div>
              )}
            </div>
          )}
          <Button 
            variant="gradient" 
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            View in Dashboard
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* Selection Summary */}
          <div className="space-y-3 mb-4">
            {slotType ? (
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Slot Type</p>
                <p className="font-medium text-foreground">{slotType.name}</p>
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-lg p-3 border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Select a slot type</p>
              </div>
            )}

            {inventoryItem ? (
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium text-foreground">
                  {format(parseISO(inventoryItem.date), 'EEE, MMM d')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(inventoryItem.startTime)} – {formatTime(inventoryItem.endTime)}
                </p>
              </div>
            ) : slotType ? (
              <div className="bg-secondary/50 rounded-lg p-3 border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Select a date & time</p>
              </div>
            ) : null}
          </div>

          {/* Event Pro Info Form */}
          {canBook && (
            <div className="space-y-3 mb-4">
              <div>
                <Label htmlFor="vendorName" className="text-xs">Your Business Name</Label>
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
                  placeholder="Special requests, what you'll be selling..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Price Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price per spot</span>
              <span className="font-medium text-foreground">${price}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold gradient-text">${price}</span>
            </div>
          </div>

          {/* Book Button */}
          {!bookingsEnabled ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-muted-foreground text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Bookings are not enabled for this market</span>
            </div>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={!canBook || bookingInProgress}
              onClick={handleBook}
            >
              {bookingInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reserving...
                </>
              ) : !user ? (
                'Sign in to Reserve'
              ) : !slotType ? (
                'Select a Slot Type'
              ) : !inventoryItem ? (
                'Select Date & Time'
              ) : inventoryItem.slotsRemaining <= 0 ? (
                'Sold Out'
              ) : (
                'Reserve Spot'
              )}
            </Button>
          )}

          {!user && canBook && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              You'll be redirected to sign in before completing your reservation
            </p>
          )}
        </>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="gradient" 
            size="lg" 
            className="fixed bottom-4 left-4 right-4 z-50 shadow-xl"
          >
            Reserve a Spot — From ${price}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Reserve a Spot</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
            {panelContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card variant="gradient" className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Reserve a Spot</CardTitle>
      </CardHeader>
      <CardContent>
        {panelContent}
      </CardContent>
    </Card>
  );
}
