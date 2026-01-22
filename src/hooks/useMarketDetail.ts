import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface MarketDetail {
  id: string;
  name: string;
  marketType: string;
  description: string;
  crowdDescription: string;
  categoriesAllowed: string[];
  operatingSeason: string;
  seasonalMonths: string[];
  formattedAddress: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
  weeklySchedule: WeeklyScheduleDay[];
  setupWindowMinutes: number;
  breakdownWindowMinutes: number;
  mediaItems: MediaItem[];
  coverImageUrl: string;
  isPublished: boolean;
  bookingsEnabled: boolean;
}

export interface WeeklyScheduleDay {
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface SlotType {
  id: string;
  name: string;
  category: string;
  widthFeet?: number;
  lengthFeet?: number;
  sizePreset?: string;
  price: number;
  pricingUnit: 'per_day' | 'per_event' | 'per_weekend';
  amenities: string[];
  requirements: string[];
  notes?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  slotTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  slotsRemaining: number;
  priceOverride?: number;
  notes?: string;
}

export interface BookingRequest {
  slotInventoryId: string;
  slotTypeId: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  notes?: string;
}

export function useMarketDetail(marketId: string | undefined) {
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [slotTypes, setSlotTypes] = useState<SlotType[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Load market data
  const loadMarket = useCallback(async () => {
    if (!marketId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch market, slot types, and inventory in parallel
      const [marketResult, slotTypesResult, inventoryResult] = await Promise.all([
        supabase
          .from('markets')
          .select('*')
          .eq('id', marketId)
          .eq('is_published', true)
          .maybeSingle(),
        supabase
          .from('slot_types')
          .select('*')
          .eq('market_id', marketId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('slot_inventory')
          .select('*')
          .eq('market_id', marketId)
          .gte('date', new Date().toISOString().split('T')[0])
          .gt('slots_remaining', 0)
          .order('date', { ascending: true })
      ]);

      if (marketResult.error) throw marketResult.error;
      if (slotTypesResult.error) throw slotTypesResult.error;
      if (inventoryResult.error) throw inventoryResult.error;

      if (!marketResult.data) {
        setError('Market not found');
        setLoading(false);
        return;
      }

      const m = marketResult.data;
      setMarket({
        id: m.id,
        name: m.name,
        marketType: m.market_type,
        description: m.description || '',
        crowdDescription: m.crowd_description || '',
        categoriesAllowed: m.categories_allowed || [],
        operatingSeason: m.operating_season || 'year-round',
        seasonalMonths: m.seasonal_months || [],
        formattedAddress: m.formatted_address || '',
        city: m.city || '',
        state: m.state || '',
        lat: m.lat,
        lng: m.lng,
        timezone: m.timezone || 'America/New_York',
        weeklySchedule: (m.weekly_schedule as unknown as WeeklyScheduleDay[]) || [],
        setupWindowMinutes: m.setup_window_minutes || 60,
        breakdownWindowMinutes: m.breakdown_window_minutes || 30,
        mediaItems: (m.media_items as unknown as MediaItem[]) || [],
        coverImageUrl: m.cover_image_url || '',
        isPublished: m.is_published,
        bookingsEnabled: m.bookings_enabled,
      });

      setSlotTypes(slotTypesResult.data?.map(st => ({
        id: st.id,
        name: st.name,
        category: st.category,
        widthFeet: st.width_feet || undefined,
        lengthFeet: st.length_feet || undefined,
        sizePreset: st.size_preset || undefined,
        price: Number(st.price),
        pricingUnit: st.pricing_unit as 'per_day' | 'per_event' | 'per_weekend',
        amenities: st.amenities || [],
        requirements: st.requirements || [],
        notes: st.notes || undefined,
        isActive: st.is_active,
      })) || []);

      setInventory(inventoryResult.data?.map(inv => ({
        id: inv.id,
        slotTypeId: inv.slot_type_id,
        date: inv.date,
        startTime: inv.start_time,
        endTime: inv.end_time,
        totalSlots: inv.total_slots,
        slotsRemaining: inv.slots_remaining,
        priceOverride: inv.price_override ? Number(inv.price_override) : undefined,
        notes: inv.notes || undefined,
      })) || []);

    } catch (err: any) {
      console.error('Error loading market:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  // Subscribe to realtime inventory updates
  useEffect(() => {
    if (!marketId) return;

    const channel = supabase
      .channel(`market-inventory-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slot_inventory',
          filter: `market_id=eq.${marketId}`,
        },
        (payload) => {
          console.log('Realtime inventory update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setInventory(prev => prev.map(inv => 
              inv.id === updated.id
                ? {
                    ...inv,
                    slotsRemaining: updated.slots_remaining,
                    totalSlots: updated.total_slots,
                    priceOverride: updated.price_override ? Number(updated.price_override) : undefined,
                  }
                : inv
            ));
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as any;
            // Only add if it's future and has slots
            if (inserted.date >= new Date().toISOString().split('T')[0] && inserted.slots_remaining > 0) {
              setInventory(prev => [...prev, {
                id: inserted.id,
                slotTypeId: inserted.slot_type_id,
                date: inserted.date,
                startTime: inserted.start_time,
                endTime: inserted.end_time,
                totalSlots: inserted.total_slots,
                slotsRemaining: inserted.slots_remaining,
                priceOverride: inserted.price_override ? Number(inserted.price_override) : undefined,
                notes: inserted.notes || undefined,
              }].sort((a, b) => a.date.localeCompare(b.date)));
            }
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as any;
            setInventory(prev => prev.filter(inv => inv.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  // Get inventory for a specific slot type
  const getInventoryForSlotType = useCallback((slotTypeId: string) => {
    return inventory.filter(inv => inv.slotTypeId === slotTypeId);
  }, [inventory]);

  // Get unique dates with available inventory
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    inventory.forEach(inv => {
      if (inv.slotsRemaining > 0) {
        dates.add(inv.date);
      }
    });
    return Array.from(dates).sort();
  }, [inventory]);

  // Get next available inventory item
  const nextAvailable = useMemo(() => {
    const sorted = [...inventory]
      .filter(inv => inv.slotsRemaining > 0)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    return sorted[0] || null;
  }, [inventory]);

  // Get min price across all slot types
  const minPrice = useMemo(() => {
    if (slotTypes.length === 0) return null;
    return Math.min(...slotTypes.map(st => st.price));
  }, [slotTypes]);

  // Total remaining slots across all inventory
  const totalSlotsRemaining = useMemo(() => {
    return inventory.reduce((sum, inv) => sum + inv.slotsRemaining, 0);
  }, [inventory]);

  // Book a slot
  const bookSlot = useCallback(async (request: BookingRequest): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book a slot',
        variant: 'destructive'
      });
      return false;
    }

    if (!market) {
      toast({
        title: 'Error',
        description: 'Market not found',
        variant: 'destructive'
      });
      return false;
    }

    setBookingInProgress(true);

    try {
      // Check if user already has a booking for this inventory
      const { data: existingBooking } = await supabase
        .from('slot_bookings')
        .select('id')
        .eq('slot_inventory_id', request.slotInventoryId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingBooking) {
        toast({
          title: 'Already booked',
          description: 'You already have a booking for this slot',
          variant: 'destructive'
        });
        return false;
      }

      // Get current inventory to verify slots remaining
      const { data: currentInventory } = await supabase
        .from('slot_inventory')
        .select('slots_remaining, market_id')
        .eq('id', request.slotInventoryId)
        .single();

      if (!currentInventory || currentInventory.slots_remaining <= 0) {
        toast({
          title: 'Sold out',
          description: 'This slot is no longer available',
          variant: 'destructive'
        });
        return false;
      }

      // Get market owner user_id
      const { data: marketData } = await supabase
        .from('markets')
        .select('user_id')
        .eq('id', market.id)
        .single();

      if (!marketData) {
        throw new Error('Market owner not found');
      }

      const slotType = slotTypes.find(st => st.id === request.slotTypeId);
      const inventoryItem = inventory.find(inv => inv.id === request.slotInventoryId);
      const price = inventoryItem?.priceOverride || slotType?.price || 0;

      // Create booking
      const { error: bookingError } = await supabase
        .from('slot_bookings')
        .insert({
          slot_inventory_id: request.slotInventoryId,
          slot_type_id: request.slotTypeId,
          market_id: market.id,
          user_id: user.id,
          vendor_user_id: marketData.user_id,
          quantity: 1,
          total_price: price,
          status: 'confirmed',
          payment_status: 'pending',
          payment_method: 'stripe',
          vendor_name: request.vendorName || null,
          vendor_email: request.vendorEmail || null,
          vendor_phone: request.vendorPhone || null,
          notes: request.notes || null,
        });

      if (bookingError) throw bookingError;

      // Decrement slots remaining
      const { error: updateError } = await supabase
        .from('slot_inventory')
        .update({ 
          slots_remaining: currentInventory.slots_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.slotInventoryId);

      if (updateError) {
        console.error('Failed to decrement inventory:', updateError);
        // Booking still created, just log the error
      }

      // Update local state
      setInventory(prev => prev.map(inv => 
        inv.id === request.slotInventoryId
          ? { ...inv, slotsRemaining: inv.slotsRemaining - 1 }
          : inv
      ));

      toast({
        title: 'Booking confirmed!',
        description: `You're reserved for ${market.name}`,
      });

      return true;
    } catch (err: any) {
      console.error('Booking error:', err);
      toast({
        title: 'Booking failed',
        description: err.message || 'An error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setBookingInProgress(false);
    }
  }, [user, market, slotTypes, inventory, toast]);

  return {
    market,
    slotTypes,
    inventory,
    loading,
    error,
    bookingInProgress,
    getInventoryForSlotType,
    availableDates,
    nextAvailable,
    minPrice,
    totalSlotsRemaining,
    bookSlot,
    refresh: loadMarket,
  };
}
