import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  MarketOnboardingState, 
  WeeklyScheduleDay, 
  MediaItem, 
  SlotType, 
  SlotInventoryItem 
} from '@/hooks/useMarketSpaceOnboarding';

export interface SlotBooking {
  id: string;
  slotInventoryId: string;
  slotTypeId: string;
  marketId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'stripe' | 'cash';
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  notes?: string;
  createdAt: string;
  // Joined data
  slotTypeName?: string;
  inventoryDate?: string;
}

const defaultWeeklySchedule: WeeklyScheduleDay[] = [
  { dayOfWeek: 0, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 1, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 2, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 3, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 4, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 5, isEnabled: false, startTime: '08:00', endTime: '14:00' },
  { dayOfWeek: 6, isEnabled: true, startTime: '08:00', endTime: '14:00' },
];

const initialState: MarketOnboardingState = {
  name: '',
  marketType: '',
  description: '',
  crowdDescription: '',
  categoriesAllowed: [],
  operatingSeason: 'year-round',
  seasonalMonths: [],
  formattedAddress: '',
  city: '',
  state: '',
  lat: null,
  lng: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weeklySchedule: defaultWeeklySchedule,
  setupWindowMinutes: 60,
  breakdownWindowMinutes: 30,
  mediaItems: [],
  coverImageUrl: '',
  isPublished: false,
  bookingsEnabled: false,
  stripeAccountId: undefined,
  stripeAccountStatus: undefined,
};

export function useMarketSpaceDashboard() {
  const [market, setMarket] = useState<MarketOnboardingState>(initialState);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [slotTypes, setSlotTypes] = useState<SlotType[]>([]);
  const [inventory, setInventory] = useState<SlotInventoryItem[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load market
      const { data: marketData, error: marketError } = await supabase
        .from('markets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (marketError) throw marketError;

      if (marketData) {
        setMarketId(marketData.id);
        setMarket({
          name: marketData.name || '',
          marketType: marketData.market_type || '',
          description: marketData.description || '',
          crowdDescription: marketData.crowd_description || '',
          categoriesAllowed: marketData.categories_allowed || [],
          operatingSeason: marketData.operating_season === 'seasonal' ? 'seasonal' : 'year-round',
          seasonalMonths: marketData.seasonal_months || [],
          formattedAddress: marketData.formatted_address || '',
          city: marketData.city || '',
          state: marketData.state || '',
          lat: marketData.lat,
          lng: marketData.lng,
          timezone: marketData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          weeklySchedule: (marketData.weekly_schedule as unknown as WeeklyScheduleDay[]) || defaultWeeklySchedule,
          setupWindowMinutes: marketData.setup_window_minutes || 60,
          breakdownWindowMinutes: marketData.breakdown_window_minutes || 30,
          mediaItems: (marketData.media_items as unknown as MediaItem[]) || [],
          coverImageUrl: marketData.cover_image_url || '',
          isPublished: marketData.is_published || false,
          bookingsEnabled: marketData.bookings_enabled || false,
          stripeAccountId: marketData.stripe_account_id || undefined,
          stripeAccountStatus: marketData.stripe_account_status || undefined,
        });

        // Load slot types
        const { data: slotTypesData } = await supabase
          .from('slot_types')
          .select('*')
          .eq('market_id', marketData.id)
          .order('sort_order', { ascending: true });

        if (slotTypesData) {
          setSlotTypes(slotTypesData.map(st => ({
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
            sortOrder: st.sort_order || 0,
            isActive: st.is_active,
          })));
        }

        // Load inventory
        const { data: inventoryData } = await supabase
          .from('slot_inventory')
          .select('*')
          .eq('market_id', marketData.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (inventoryData) {
          setInventory(inventoryData.map(inv => ({
            id: inv.id,
            slotTypeId: inv.slot_type_id,
            date: inv.date,
            startTime: inv.start_time,
            endTime: inv.end_time,
            totalSlots: inv.total_slots,
            slotsRemaining: inv.slots_remaining,
            priceOverride: inv.price_override ? Number(inv.price_override) : undefined,
            notes: inv.notes || undefined,
          })));
        }

        // Load bookings
        const { data: bookingsData } = await supabase
          .from('slot_bookings')
          .select(`
            *,
            slot_types(name),
            slot_inventory(date)
          `)
          .eq('market_id', marketData.id)
          .order('created_at', { ascending: false });

        if (bookingsData) {
          setBookings(bookingsData.map(b => ({
            id: b.id,
            slotInventoryId: b.slot_inventory_id,
            slotTypeId: b.slot_type_id,
            marketId: b.market_id,
            userId: b.user_id,
            quantity: b.quantity,
            totalPrice: Number(b.total_price),
            status: b.status as SlotBooking['status'],
            paymentStatus: b.payment_status as SlotBooking['paymentStatus'],
            paymentMethod: b.payment_method as SlotBooking['paymentMethod'],
            vendorName: b.vendor_name || undefined,
            vendorEmail: b.vendor_email || undefined,
            vendorPhone: b.vendor_phone || undefined,
            notes: b.notes || undefined,
            createdAt: b.created_at,
            slotTypeName: (b.slot_types as any)?.name,
            inventoryDate: (b.slot_inventory as any)?.date,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your market data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update market
  const updateMarket = useCallback(async (data: Partial<MarketOnboardingState>) => {
    if (!marketId) return;

    setSaving(true);
    try {
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.marketType !== undefined) updateData.market_type = data.marketType;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.crowdDescription !== undefined) updateData.crowd_description = data.crowdDescription;
      if (data.categoriesAllowed !== undefined) updateData.categories_allowed = data.categoriesAllowed;
      if (data.operatingSeason !== undefined) updateData.operating_season = data.operatingSeason;
      if (data.seasonalMonths !== undefined) updateData.seasonal_months = data.seasonalMonths;
      if (data.formattedAddress !== undefined) updateData.formatted_address = data.formattedAddress;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.lat !== undefined) updateData.lat = data.lat;
      if (data.lng !== undefined) updateData.lng = data.lng;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.weeklySchedule !== undefined) updateData.weekly_schedule = JSON.parse(JSON.stringify(data.weeklySchedule));
      if (data.setupWindowMinutes !== undefined) updateData.setup_window_minutes = data.setupWindowMinutes;
      if (data.breakdownWindowMinutes !== undefined) updateData.breakdown_window_minutes = data.breakdownWindowMinutes;
      if (data.mediaItems !== undefined) updateData.media_items = JSON.parse(JSON.stringify(data.mediaItems));
      if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
      if (data.bookingsEnabled !== undefined) updateData.bookings_enabled = data.bookingsEnabled;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('markets')
        .update(updateData)
        .eq('id', marketId);

      if (error) throw error;

      setMarket(prev => ({ ...prev, ...data }));
      toast({ title: 'Changes saved' });
    } catch (error) {
      console.error('Error updating market:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [marketId, toast]);

  // Slot type operations
  const saveSlotType = useCallback(async (slotType: SlotType): Promise<string | null> => {
    if (!user || !marketId) return null;

    try {
      const slotTypeData = {
        market_id: marketId,
        user_id: user.id,
        name: slotType.name,
        category: slotType.category,
        width_feet: slotType.widthFeet || null,
        length_feet: slotType.lengthFeet || null,
        size_preset: slotType.sizePreset || null,
        price: slotType.price,
        pricing_unit: slotType.pricingUnit,
        amenities: slotType.amenities,
        requirements: slotType.requirements,
        notes: slotType.notes || null,
        sort_order: slotType.sortOrder,
        is_active: slotType.isActive,
      };

      if (slotType.id) {
        const { error } = await supabase
          .from('slot_types')
          .update(slotTypeData)
          .eq('id', slotType.id);
        if (error) throw error;
        setSlotTypes(prev => prev.map(s => s.id === slotType.id ? { ...slotType } : s));
        return slotType.id;
      } else {
        const { data, error } = await supabase
          .from('slot_types')
          .insert(slotTypeData)
          .select()
          .single();
        if (error) throw error;
        const newSlot = { ...slotType, id: data.id };
        setSlotTypes(prev => [...prev, newSlot]);
        return data.id;
      }
    } catch (error) {
      console.error('Error saving slot type:', error);
      toast({ title: 'Error', description: 'Failed to save slot type.', variant: 'destructive' });
      return null;
    }
  }, [user, marketId, toast]);

  const deleteSlotType = useCallback(async (slotTypeId: string) => {
    try {
      const { error } = await supabase
        .from('slot_types')
        .delete()
        .eq('id', slotTypeId);
      if (error) throw error;
      setSlotTypes(prev => prev.filter(st => st.id !== slotTypeId));
      toast({ title: 'Slot type deleted' });
    } catch (error) {
      console.error('Error deleting slot type:', error);
      toast({ title: 'Error', description: 'Failed to delete slot type.', variant: 'destructive' });
    }
  }, [toast]);

  // Inventory operations
  const saveInventoryItem = useCallback(async (item: SlotInventoryItem): Promise<string | null> => {
    if (!user || !marketId) return null;

    try {
      const inventoryData = {
        market_id: marketId,
        slot_type_id: item.slotTypeId,
        user_id: user.id,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        total_slots: item.totalSlots,
        slots_remaining: item.slotsRemaining,
        price_override: item.priceOverride || null,
        notes: item.notes || null,
      };

      if (item.id) {
        const { error } = await supabase
          .from('slot_inventory')
          .update(inventoryData)
          .eq('id', item.id);
        if (error) throw error;
        setInventory(prev => prev.map(i => i.id === item.id ? { ...item } : i));
        return item.id;
      } else {
        const { data, error } = await supabase
          .from('slot_inventory')
          .insert(inventoryData)
          .select()
          .single();
        if (error) throw error;
        const newItem = { ...item, id: data.id };
        setInventory(prev => [...prev, newItem]);
        return data.id;
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast({ title: 'Error', description: 'Failed to save inventory.', variant: 'destructive' });
      return null;
    }
  }, [user, marketId, toast]);

  const deleteInventoryItem = useCallback(async (inventoryId: string) => {
    try {
      const { error } = await supabase
        .from('slot_inventory')
        .delete()
        .eq('id', inventoryId);
      if (error) throw error;
      setInventory(prev => prev.filter(inv => inv.id !== inventoryId));
      toast({ title: 'Inventory deleted' });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({ title: 'Error', description: 'Failed to delete inventory.', variant: 'destructive' });
    }
  }, [toast]);

  const bulkCreateInventory = useCallback(async (items: Omit<SlotInventoryItem, 'id'>[]) => {
    if (!user || !marketId) return;

    try {
      const inventoryData = items.map(item => ({
        market_id: marketId,
        slot_type_id: item.slotTypeId,
        user_id: user.id,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        total_slots: item.totalSlots,
        slots_remaining: item.slotsRemaining,
        price_override: item.priceOverride || null,
        notes: item.notes || null,
      }));

      const { data, error } = await supabase
        .from('slot_inventory')
        .insert(inventoryData)
        .select();

      if (error) throw error;

      if (data) {
        const newItems: SlotInventoryItem[] = data.map(inv => ({
          id: inv.id,
          slotTypeId: inv.slot_type_id,
          date: inv.date,
          startTime: inv.start_time,
          endTime: inv.end_time,
          totalSlots: inv.total_slots,
          slotsRemaining: inv.slots_remaining,
          priceOverride: inv.price_override ? Number(inv.price_override) : undefined,
          notes: inv.notes || undefined,
        }));
        setInventory(prev => [...prev, ...newItems]);
        toast({ title: 'Inventory created', description: `Added ${items.length} dates.` });
      }
    } catch (error) {
      console.error('Error bulk creating inventory:', error);
      toast({ title: 'Error', description: 'Failed to create inventory.', variant: 'destructive' });
    }
  }, [user, marketId, toast]);

  // Booking operations
  const updateBookingStatus = useCallback(async (bookingId: string, status: SlotBooking['status']) => {
    try {
      const { error } = await supabase
        .from('slot_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast({ title: `Booking ${status}` });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({ title: 'Error', description: 'Failed to update booking.', variant: 'destructive' });
    }
  }, [toast]);

  return {
    market,
    marketId,
    slotTypes,
    inventory,
    bookings,
    loading,
    saving,
    updateMarket,
    saveSlotType,
    deleteSlotType,
    saveInventoryItem,
    deleteInventoryItem,
    bulkCreateInventory,
    updateBookingStatus,
    setSlotTypes,
    setInventory,
    refresh: loadData,
  };
}
