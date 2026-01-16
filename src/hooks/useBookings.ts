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
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vendor_id: bookingData.vendor_id,
        vendor_user_id: bookingData.vendor_user_id || null,
        package_id: bookingData.package_id,
        event_date: bookingData.event_date,
        event_location: bookingData.event_location,
        units: bookingData.units,
        add_ons: bookingData.add_ons,
        total_price: bookingData.total_price,
        notes: bookingData.notes || null,
        status: 'pending'
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
      description: "Your booking request has been sent to the vendor"
    });

    setBookings(prev => [data as BookingData, ...prev]);
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
