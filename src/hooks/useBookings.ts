import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BookingData {
  id: string;
  vendor_id: string;
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

  const createBooking = async (bookingData: Omit<BookingData, 'id' | 'created_at' | 'status'>) => {
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
        ...bookingData
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
      title: "Booking confirmed!",
      description: "Your booking has been submitted successfully"
    });

    setBookings(prev => [data as BookingData, ...prev]);
    return data;
  };

  return { bookings, loading, createBooking, refetch: fetchBookings };
}
