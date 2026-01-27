import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar, MapPin, CreditCard, ArrowRight, Loader2, MessageCircle, CheckCircle } from 'lucide-react';
import { format, parseISO, addHours } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AddToCalendarButton } from '@/components/booking/AddToCalendarButton';
import { EventCountdown } from '@/components/booking/EventCountdown';
import { BookingChecklist, generateBookingChecklist } from '@/components/booking/BookingChecklist';
import { useConfettiOnMount } from '@/hooks/useConfetti';
import logo from '@/assets/eventpro-logo.png';

interface BookingDetails {
  id: string;
  event_date: string;
  event_location: string;
  total_price: number;
  deposit_amount: number;
  final_amount: number;
  status: string;
  payment_status: string;
  package_name?: string;
  vendor_name?: string;
}

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const sessionId = searchParams.get('session_id');
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  
  // Fire confetti when booking is verified
  useConfettiOnMount(verified && !loading);

  useEffect(() => {
    async function verifyAndFetch() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        // Verify payment if session_id is present
        if (sessionId) {
          await supabase.functions.invoke('verify-booking-payment', {
            body: { booking_id: bookingId, session_id: sessionId }
          });
        }

        // Fetch booking details
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;

        // Fetch package name
        const { data: packageData } = await supabase
          .from('vendor_packages')
          .select('name')
          .eq('id', bookingData.package_id)
          .single();

        // Fetch vendor name
        const { data: vendorData } = await supabase
          .from('vendor_details')
          .select('business_name')
          .eq('user_id', bookingData.vendor_user_id)
          .single();

        setBooking({
          ...bookingData,
          package_name: packageData?.name || 'Event Package',
          vendor_name: vendorData?.business_name || 'Event Pro',
          deposit_amount: bookingData.deposit_amount ? bookingData.deposit_amount / 100 : 0,
          final_amount: bookingData.final_amount ? bookingData.final_amount / 100 : 0,
        });
        setVerified(true);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    }

    verifyAndFetch();
  }, [bookingId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Verifying your booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Booking not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find your booking details.
          </p>
          <Button onClick={() => navigate('/discover')}>
            Browse Vendors
          </Button>
        </div>
      </div>
    );
  }

  const eventDate = parseISO(booking.event_date);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo - Top Left */}
      <motion.div 
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img 
          src={logo} 
          alt="Event Pro by Vendibook" 
          className="h-12 md:h-[72px] w-auto"
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Success Icon */}
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-primary flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" strokeWidth={3} />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Your event is secured. We've sent the details to your email.
          </p>

          {/* Booking Details Card */}
          <motion.div 
            className="bg-secondary/50 rounded-2xl p-4 md:p-6 mb-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-semibold">{booking.package_name}</p>
              </div>
              {/* Countdown */}
              <EventCountdown eventDate={eventDate} compact />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Vendor</p>
              <p className="font-medium">{booking.vendor_name}</p>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="line-clamp-1">{booking.event_location}</span>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deposit Paid</span>
              </div>
              <span className="font-mono font-semibold">
                ${booking.deposit_amount.toLocaleString()}
              </span>
            </div>

            {booking.final_amount > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Balance Due on Event Day</span>
                <span className="font-mono">
                  ${booking.final_amount.toLocaleString()}
                </span>
              </div>
            )}
          </motion.div>

          {/* Add to Calendar */}
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <AddToCalendarButton
              event={{
                title: `${booking.package_name} - ${booking.vendor_name}`,
                description: `Your event booking with ${booking.vendor_name}. Total: $${booking.total_price}. Balance due: $${booking.final_amount}`,
                location: booking.event_location,
                startDate: eventDate,
                durationHours: 4,
              }}
              variant="outline"
              size="default"
            />
          </motion.div>

          {/* Pre-event Checklist */}
          <motion.div 
            className="bg-muted/50 rounded-xl p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <BookingChecklist 
              items={generateBookingChecklist({
                deposit_paid_at: booking.status === 'confirmed' ? new Date().toISOString() : null,
                final_paid_at: null,
                hasConversation: false,
                hasReview: false,
                payment_method: 'stripe',
              })}
            />
          </motion.div>

          {/* What Happens Next */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="font-semibold mb-4 text-center">What happens next?</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Confirmation email sent to you and the vendor</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>Vendor will reach out to finalize event details</span>
              </li>
              <li className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>Pay remaining balance before your event</span>
              </li>
            </ol>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 text-base"
            >
              View My Bookings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/discover')}
              className="w-full h-12 text-base"
            >
              Browse More Vendors
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div 
        className="py-4 md:py-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[16px] text-muted-foreground">
          by Vendibook
        </span>
      </motion.div>
    </div>
  );
}
