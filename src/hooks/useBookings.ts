import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BookingData {
  id: string;
  vendor_id: string;
  vendor_user_id: string | null;
  package_id: string;
  event_date: string;
  event_location: string;
  units: number;
  add_ons: string[];
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface CreateBookingInput {
  vendor_id: string;
  vendor_user_id?: string | null;
  package_id: string;
  event_date: string;
  event_location: string;
  units: number;
  add_ons: string[];
  total_price: number;
  notes?: string | null;
  payment_method?: 'stripe' | 'cash';
  booking_mode?: 'INSTANT' | 'REQUEST';
  // For email notification
  vendor_email?: string;
  vendor_name?: string;
  customer_name?: string;
  customer_email?: string;
  package_name?: string;
  unit_type?: string;
  // Guest checkout flag
  is_guest?: boolean;
}

export function useBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data as BookingData[]);
    }
    setLoading(false);
  };

  const createBooking = async (bookingData: CreateBookingInput): Promise<BookingData | null> => {
    const isGuest = bookingData.is_guest || !user;
    
    // For guest checkout, require customer_email
    if (isGuest && !bookingData.customer_email) {
      toast({
        title: "Email required",
        description: "Please provide an email address for booking confirmation",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: isGuest ? null : user?.id, // null for guest checkouts
        vendor_id: bookingData.vendor_id,
        vendor_user_id: bookingData.vendor_user_id || null,
        package_id: bookingData.package_id,
        event_date: bookingData.event_date,
        event_location: bookingData.event_location,
        units: bookingData.units,
        add_ons: bookingData.add_ons,
        total_price: bookingData.total_price,
        notes: bookingData.notes || null,
        payment_method: bookingData.payment_method || 'stripe',
        booking_mode: bookingData.booking_mode || 'INSTANT',
        status: bookingData.booking_mode === 'REQUEST' ? 'pending' : 'confirmed',
        payment_status: bookingData.booking_mode === 'REQUEST' 
          ? 'awaiting_approval'
          : (bookingData.payment_method === 'cash' ? 'cash_due' : 'pending'),
        customer_email: bookingData.customer_email || user?.email || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Booking submitted!",
      description: isGuest 
        ? "Check your email for booking confirmation details"
        : "Your booking request has been sent to the vendor"
    });

    // Only update local bookings state if user is logged in
    if (!isGuest) {
      setBookings(prev => [data as BookingData, ...prev]);
    }

    // Send email notification to vendor (fire and forget)
    if (bookingData.vendor_email) {
      supabase.functions.invoke('send-booking-notification', {
        body: {
          booking_id: data.id,
          vendor_email: bookingData.vendor_email,
          vendor_name: bookingData.vendor_name || 'Vendor',
          customer_name: bookingData.customer_name || user.email?.split('@')[0] || 'Customer',
          customer_email: bookingData.customer_email || user.email,
          package_name: bookingData.package_name || 'Package',
          event_date: bookingData.event_date,
          event_location: bookingData.event_location,
          units: bookingData.units,
          unit_type: bookingData.unit_type || 'unit',
          total_price: bookingData.total_price,
          add_ons: bookingData.add_ons,
          notes: bookingData.notes
        }
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Failed to send vendor notification email:', emailError);
        } else {
          console.log('Vendor notification email sent successfully');
        }
      });
    }

    return data as BookingData;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Booking cancelled",
      description: "Your booking has been cancelled"
    });

    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ));
    return true;
  };

  return { bookings, loading, createBooking, cancelBooking, refetch: fetchBookings };
}
