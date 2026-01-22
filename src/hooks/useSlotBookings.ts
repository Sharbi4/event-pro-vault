import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SlotBooking {
  id: string;
  marketId: string;
  marketName: string;
  slotTypeId: string;
  slotTypeName: string;
  inventoryId: string;
  inventoryDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
}

export function useSlotBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch slot bookings with joined data
      const { data, error } = await supabase
        .from('slot_bookings')
        .select(`
          id,
          market_id,
          slot_type_id,
          slot_inventory_id,
          quantity,
          total_price,
          status,
          payment_status,
          payment_method,
          notes,
          created_at,
          vendor_name,
          vendor_email
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Fetch related markets, slot types, and inventory
      const marketIds = [...new Set(data.map(b => b.market_id))];
      const slotTypeIds = [...new Set(data.map(b => b.slot_type_id))];
      const inventoryIds = [...new Set(data.map(b => b.slot_inventory_id))];

      const [marketsResult, slotTypesResult, inventoryResult] = await Promise.all([
        supabase.from('markets').select('id, name').in('id', marketIds),
        supabase.from('slot_types').select('id, name').in('id', slotTypeIds),
        supabase.from('slot_inventory').select('id, date, start_time, end_time').in('id', inventoryIds)
      ]);

      const marketsMap = new Map((marketsResult.data || []).map(m => [m.id, m.name]));
      const slotTypesMap = new Map((slotTypesResult.data || []).map(st => [st.id, st.name]));
      const inventoryMap = new Map((inventoryResult.data || []).map(inv => [inv.id, inv]));

      const enrichedBookings: SlotBooking[] = data.map(booking => {
        const inventory = inventoryMap.get(booking.slot_inventory_id);
        return {
          id: booking.id,
          marketId: booking.market_id,
          marketName: marketsMap.get(booking.market_id) || 'Unknown Market',
          slotTypeId: booking.slot_type_id,
          slotTypeName: slotTypesMap.get(booking.slot_type_id) || 'Unknown Slot',
          inventoryId: booking.slot_inventory_id,
          inventoryDate: inventory?.date || '',
          startTime: inventory?.start_time || '',
          endTime: inventory?.end_time || '',
          quantity: booking.quantity,
          totalPrice: Number(booking.total_price),
          status: booking.status as SlotBooking['status'],
          paymentStatus: booking.payment_status || 'pending',
          paymentMethod: booking.payment_method || 'stripe',
          notes: booking.notes,
          createdAt: booking.created_at,
        };
      });

      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching slot bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your market bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Subscribe to realtime updates for user's slot bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-slot-bookings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'slot_bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          const old = payload.old as any;
          
          // Update local state
          setBookings(prev => prev.map(booking => 
            booking.id === updated.id 
              ? { ...booking, status: updated.status, paymentStatus: updated.payment_status }
              : booking
          ));

          // Show toast for status changes
          if (old.status !== updated.status) {
            if (updated.status === 'confirmed') {
              toast({
                title: 'Booking Confirmed!',
                description: 'Your market spot has been confirmed.',
              });
            } else if (updated.status === 'cancelled') {
              toast({
                title: 'Booking Cancelled',
                description: 'Your market spot booking has been cancelled.',
                variant: 'destructive',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('slot_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ));

      toast({
        title: 'Booking cancelled',
        description: 'Your market spot booking has been cancelled.',
      });

      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    bookings,
    loading,
    refetch: fetchBookings,
    cancelBooking,
  };
}
