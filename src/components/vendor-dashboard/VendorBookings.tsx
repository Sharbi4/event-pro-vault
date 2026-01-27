import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, MapPin, Calendar, CreditCard, Loader2, DollarSign, Undo2, MessageCircle } from 'lucide-react';
import { VendorBooking } from '@/hooks/useVendorDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CancellationDialog } from '@/components/shared/CancellationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
interface VendorBookingsProps {
  bookings: VendorBooking[];
  onUpdateStatus: (id: string, status: string) => Promise<unknown>;
  onMessageClient?: (booking: { id: string; customer_email: string; event_location: string }) => void;
}

interface ExtendedBooking extends VendorBooking {
  payment_method?: string;
  booking_mode?: string;
  stripe_checkout_session_id?: string;
  deposit_amount?: number;
  final_amount?: number;
  deposit_paid_at?: string;
  final_paid_at?: string;
  deposit_percentage?: number;
}

export function VendorBookings({ bookings, onUpdateStatus, onMessageClient }: VendorBookingsProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [requestingPayment, setRequestingPayment] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<ExtendedBooking | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [bookingToDecline, setBookingToDecline] = useState<ExtendedBooking | null>(null);
  const { toast } = useToast();
  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    await onUpdateStatus(id, status);
    setUpdating(null);
  };

  const handleRequestPayment = async (booking: ExtendedBooking, depositPercent: number = 50) => {
    setRequestingPayment(booking.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: { 
          booking_id: booking.id,
          deposit_percentage: depositPercent
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Update status to awaiting_payment
        await onUpdateStatus(booking.id, 'awaiting_payment');
        
        toast({
          title: "Payment request sent!",
          description: `Customer will pay ${depositPercent}% deposit ($${data.deposit_amount?.toFixed(2)}). Remaining $${data.final_amount?.toFixed(2)} due on event day.`
        });
      }
    } catch (error) {
      console.error('Error requesting payment:', error);
      
      // Parse the error message for better UX
      let errorMessage = "Please try again";
      let errorTitle = "Failed to request payment";
      
      if (error instanceof Error) {
        if (error.message.includes("payment account is not fully activated")) {
          errorTitle = "Stripe Setup Incomplete";
          errorMessage = "Complete your Stripe onboarding in Settings → Payout Setup to accept payments.";
        } else if (error.message.includes("not set up payment")) {
          errorTitle = "Stripe Setup Required";
          errorMessage = "Set up Stripe in Settings → Payout Setup to request payments.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setRequestingPayment(null);
    }
  };

  const handleRequestFinalPayment = async (booking: ExtendedBooking) => {
    setRequestingPayment(booking.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('charge-final-payment', {
        body: { booking_id: booking.id }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        toast({
          title: "Final payment link created!",
          description: `Customer will be charged $${data.amount?.toFixed(2)} for the remaining balance.`
        });
      }
    } catch (error) {
      console.error('Error requesting final payment:', error);
      toast({
        title: "Failed to request final payment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setRequestingPayment(null);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const awaitingPaymentBookings = bookings.filter(b => b.status === 'awaiting_payment');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined'
  );

  const getPaymentBadge = (booking: ExtendedBooking) => {
    const paymentStatus = (booking as any).payment_status;
    const paymentMethod = (booking as any).payment_method;
    const depositPaid = (booking as any).deposit_paid_at;
    const finalPaid = (booking as any).final_paid_at;
    
    if (paymentMethod === 'cash') {
      if (paymentStatus === 'cash_due') {
        return (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <DollarSign className="w-3 h-3" />
            Cash Due
          </Badge>
        );
      }
      if (paymentStatus === 'awaiting_approval') {
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending Approval
          </Badge>
        );
      }
    }
    
    if (finalPaid) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CreditCard className="w-3 h-3" />
          Fully Paid
        </Badge>
      );
    }
    
    if (depositPaid) {
      return (
        <Badge variant="default" className="gap-1 bg-blue-500">
          <DollarSign className="w-3 h-3" />
          Deposit Paid
        </Badge>
      );
    }
    
    if (paymentStatus === 'awaiting_approval') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Pending Approval
        </Badge>
      );
    }
    
    if (paymentStatus === 'pending') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Awaiting Payment
        </Badge>
      );
    }
    
    return null;
  };

  // Handle accept for Request-to-Book bookings
  const handleAcceptBooking = async (booking: ExtendedBooking) => {
    setUpdating(booking.id);
    const paymentMethod = (booking as any).payment_method;
    
    if (paymentMethod === 'cash') {
      // For cash bookings, just confirm
      await onUpdateStatus(booking.id, 'confirmed');
      // Update payment status to cash_due
      await supabase
        .from('bookings')
        .update({ payment_status: 'cash_due' })
        .eq('id', booking.id);
      toast({
        title: "Booking confirmed!",
        description: "Customer will pay in cash at the event."
      });
    } else {
      // For online bookings, request payment
      await handleRequestPayment(booking, 50);
    }
    setUpdating(null);
  };

  const handleDeclineBooking = async (bookingId: string) => {
    setUpdating(bookingId);
    await onUpdateStatus(bookingId, 'declined');
    // Update payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'declined' })
      .eq('id', bookingId);
    setUpdating(null);
    setDeclineDialogOpen(false);
    setBookingToDecline(null);
  };

  const openDeclineDialog = (booking: ExtendedBooking) => {
    setBookingToDecline(booking);
    setDeclineDialogOpen(true);
  };

  const BookingCard = ({ booking }: { booking: ExtendedBooking }) => {
    const isPast = new Date(booking.event_date) < new Date();
    const isPending = booking.status === 'pending';
    const isAwaitingPayment = booking.status === 'awaiting_payment';
    const isConfirmed = booking.status === 'confirmed';
    const depositPaid = (booking as any).deposit_paid_at;
    const finalPaid = (booking as any).final_paid_at;
    const depositAmount = ((booking as any).deposit_amount || 0) / 100;
    const finalAmount = ((booking as any).final_amount || 0) / 100;
    const isEventDay = new Date(booking.event_date).toDateString() === new Date().toDateString();
    const bookingMode = (booking as any).booking_mode || 'INSTANT';
    const paymentMethod = (booking as any).payment_method || 'stripe';
    const isRequestToBook = bookingMode === 'REQUEST';
    const isCashPayment = paymentMethod === 'cash';

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {new Date(booking.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {isEventDay && !isPast && (
                  <Badge variant="destructive" className="text-xs">TODAY</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{booking.event_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {booking.units} {booking.units === 1 ? 'unit' : 'units'}
                </span>
                {booking.add_ons && booking.add_ons.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{booking.add_ons.length} add-ons
                  </Badge>
                )}
              </div>
              {booking.notes && (
                <p className="text-sm text-muted-foreground italic">
                  "{booking.notes}"
                </p>
              )}
              
              {/* Payment breakdown */}
              {(depositAmount > 0 || finalAmount > 0) && (
                <div className="text-xs text-muted-foreground border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Deposit ({(booking as any).deposit_percentage || 50}%):</span>
                    <span className={depositPaid ? 'text-green-500' : ''}>${depositAmount.toFixed(2)} {depositPaid ? '✓' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining balance:</span>
                    <span className={finalPaid ? 'text-green-500' : ''}>${finalAmount.toFixed(2)} {finalPaid ? '✓' : ''}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xl font-bold gradient-text">
                ${booking.total_price}
              </span>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Badge variant={
                  booking.status === 'confirmed' ? 'default' :
                  booking.status === 'pending' ? 'secondary' :
                  booking.status === 'awaiting_payment' ? 'outline' :
                  booking.status === 'completed' ? 'outline' : 'destructive'
                }>
                  {booking.status === 'awaiting_payment' ? 'Awaiting Payment' : booking.status}
                </Badge>
                {getPaymentBadge(booking)}
              </div>
              
              {/* Message Client Button */}
              {onMessageClient && booking.customer_email && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => onMessageClient({
                    id: booking.id,
                    customer_email: booking.customer_email!,
                    event_location: booking.event_location
                  })}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message Client
                </Button>
              )}
              
              {isPending && !isPast && (
                <div className="flex flex-col gap-2 mt-2">
                  {/* Show booking mode label */}
                  <Badge variant={isRequestToBook ? 'secondary' : 'outline'} className="self-end text-xs">
                    {isRequestToBook ? 'Request to Book' : 'Instant Book'}
                  </Badge>
                  
                  {isCashPayment ? (
                    // Cash payment actions
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => handleAcceptBooking(booking)}
                        disabled={updating === booking.id}
                      >
                        {updating === booking.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-1" />
                        )}
                        Accept (Cash)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeclineDialog(booking)}
                        disabled={updating === booking.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  ) : (
                    // Online payment actions
                    <>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleRequestPayment(booking, 50)}
                          disabled={requestingPayment === booking.id || updating === booking.id}
                        >
                          {requestingPayment === booking.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-1" />
                          )}
                          Accept (50% Deposit)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeclineDialog(booking)}
                          disabled={updating === booking.id || requestingPayment === booking.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRequestPayment(booking, 100)}
                        disabled={requestingPayment === booking.id || updating === booking.id}
                        className="w-full"
                      >
                        Accept (Full Payment)
                      </Button>
                    </>
                  )}
                </div>
              )}

              {isAwaitingPayment && !isPast && (
                <div className="flex flex-col items-end gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">
                    Waiting for customer deposit...
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBookingToCancel(booking);
                      setCancelDialogOpen(true);
                    }}
                    disabled={updating === booking.id}
                    className="text-destructive gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel Booking
                  </Button>
                </div>
              )}

              {isConfirmed && depositPaid && !finalPaid && !isPast && (
                <div className="flex flex-col items-end gap-2 mt-2">
                  {isEventDay ? (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => handleRequestFinalPayment(booking)}
                      disabled={requestingPayment === booking.id}
                    >
                      {requestingPayment === booking.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-1" />
                      )}
                      Request Final Payment
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Final payment due on event day
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBookingToCancel(booking);
                      setCancelDialogOpen(true);
                    }}
                    disabled={updating === booking.id}
                    className="text-destructive gap-1"
                  >
                    <Undo2 className="w-4 h-4" />
                    Cancel & Refund
                  </Button>
                </div>
              )}

              {isConfirmed && finalPaid && !isPast && (
                <div className="flex flex-col items-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    disabled={updating === booking.id}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setBookingToCancel(booking);
                      setCancelDialogOpen(true);
                    }}
                    disabled={updating === booking.id}
                    className="text-destructive gap-1 h-auto py-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    Cancel & Refund
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="awaiting" className="relative">
              Awaiting
              {awaitingPaymentBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center">
                  {awaitingPaymentBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending bookings
              </p>
            ) : (
              pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="awaiting" className="space-y-4">
            {awaitingPaymentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No bookings awaiting payment
              </p>
            ) : (
              awaitingPaymentBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No confirmed bookings
              </p>
            ) : (
              confirmedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No past bookings
              </p>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Cancellation Dialog */}
      {bookingToCancel && (
        <CancellationDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          bookingId={bookingToCancel.id}
          bookingType="booking"
          totalPaid={
            (((bookingToCancel as any).deposit_amount || 0) + 
            ((bookingToCancel as any).final_amount || 0)) / 100 || 
            bookingToCancel.total_price
          }
          eventDate={bookingToCancel.event_date}
          isPaid={
            !!(bookingToCancel as any).deposit_paid_at || 
            !!(bookingToCancel as any).final_paid_at
          }
          onSuccess={() => {
            setBookingToCancel(null);
            // Trigger a refetch by updating status in parent
            onUpdateStatus(bookingToCancel.id, 'cancelled');
          }}
        />
      )}

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              Decline Booking Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this booking request? 
              The customer will be notified that their request was not accepted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDecline(null)}>
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookingToDecline && handleDeclineBooking(bookingToDecline.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updating === bookingToDecline?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline Booking'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
