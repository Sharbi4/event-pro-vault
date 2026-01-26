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
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number;
  // Extended fields for display
  package_name?: string;
  package_cover_image?: string;
  vendor_display_name?: string;
  vendor_avatar?: string;
  deposit_amount?: number;
  final_amount?: number;
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
  deposit_percentage?: number;
  payment_method?: 'stripe' | 'cash';
  payment_status?: string;
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
  // Time slot fields for availability tracking
  start_time?: string | null; // HH:mm format
  end_time?: string | null; // HH:mm format
  duration_minutes?: number;
  setup_minutes?: number;
  breakdown_minutes?: number;
  // For email notification
  vendor_email?: string;
  vendor_name?: string;
  customer_name?: string;
  customer_email?: string;
  package_name?: string;
  unit_type?: string;
  cancellation_policy?: 'flexible' | 'standard' | 'strict';
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
    
    // Fetch bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      setLoading(false);
      return;
    }

    if (!bookingsData || bookingsData.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }

    // Get unique package IDs and vendor user IDs
    const packageIds = [...new Set(bookingsData.map(b => b.package_id).filter(Boolean))];
    const vendorUserIds = [...new Set(bookingsData.map(b => b.vendor_user_id).filter(Boolean))];

    // Fetch packages
    const { data: packagesData } = await supabase
      .from('vendor_packages')
      .select('id, name, cover_image_url')
      .in('id', packageIds);

    // Fetch vendor profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', vendorUserIds);

    // Create lookup maps
    const packagesMap = new Map(packagesData?.map(p => [p.id, p]) || []);
    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    // Merge data
    const enrichedBookings: BookingData[] = bookingsData.map(booking => {
      const pkg = packagesMap.get(booking.package_id);
      const vendorProfile = profilesMap.get(booking.vendor_user_id);

      return {
        ...booking,
        package_name: pkg?.name || 'Package',
        package_cover_image: pkg?.cover_image_url || null,
        vendor_display_name: vendorProfile?.display_name || 'Event Pro',
        vendor_avatar: vendorProfile?.avatar_url || null,
      } as BookingData;
    });

    setBookings(enrichedBookings);
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
        // Time slot fields for cross-package availability
        start_time: bookingData.start_time || null,
        end_time: bookingData.end_time || null,
        duration_minutes: bookingData.duration_minutes || 60,
        setup_minutes: bookingData.setup_minutes || 0,
        breakdown_minutes: bookingData.breakdown_minutes || 0,
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

    // Refetch to get enriched data
    if (!isGuest) {
      fetchBookings();
    }

    // Send email notification to vendor (fire and forget)
    if (bookingData.vendor_email) {
      supabase.functions.invoke('send-booking-notification', {
        body: {
          booking_id: data.id,
          vendor_email: bookingData.vendor_email,
          vendor_name: bookingData.vendor_name || 'Vendor',
          customer_name: bookingData.customer_name || user?.email?.split('@')[0] || 'Customer',
          customer_email: bookingData.customer_email || user?.email,
          package_name: bookingData.package_name || 'Package',
          event_date: bookingData.event_date,
          event_location: bookingData.event_location,
          units: bookingData.units,
          unit_type: bookingData.unit_type || 'unit',
          total_price: bookingData.total_price,
          add_ons: bookingData.add_ons,
          notes: bookingData.notes,
          cancellation_policy: bookingData.cancellation_policy || 'standard'
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
