import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type MarketOnboardingStep = 
  | 'basics' 
  | 'location' 
  | 'media' 
  | 'slot-types' 
  | 'inventory' 
  | 'review';

export interface WeeklyScheduleDay {
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface SlotType {
  id?: string;
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
  sortOrder: number;
  isActive: boolean;
}

export interface SlotInventoryItem {
  id?: string;
  slotTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  slotsRemaining: number;
  priceOverride?: number;
  notes?: string;
}

export interface MarketOnboardingState {
  // Basics
  name: string;
  marketType: string;
  description: string;
  crowdDescription: string;
  categoriesAllowed: string[];
  operatingSeason: 'year-round' | 'seasonal';
  seasonalMonths: string[];
  
  // Location
  formattedAddress: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
  
  // Schedule
  weeklySchedule: WeeklyScheduleDay[];
  setupWindowMinutes: number;
  breakdownWindowMinutes: number;
  
  // Media
  mediaItems: MediaItem[];
  coverImageUrl: string;
  
  // Status
  isPublished: boolean;
  bookingsEnabled: boolean;
  stripeAccountId?: string;
  stripeAccountStatus?: string;
  approvalStatus?: string;
  approvalNotes?: string;
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

const STEPS: MarketOnboardingStep[] = ['basics', 'location', 'media', 'slot-types', 'inventory', 'review'];

export function useMarketSpaceOnboarding() {
  const [currentStep, setCurrentStep] = useState<MarketOnboardingStep>('basics');
  const [state, setState] = useState<MarketOnboardingState>(initialState);
  const [slotTypes, setSlotTypes] = useState<SlotType[]>([]);
  const [inventory, setInventory] = useState<SlotInventoryItem[]>([]);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load existing data
  const loadExistingData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First check if user has a market
      const { data: market, error: marketError } = await supabase
        .from('markets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (marketError) throw marketError;

      if (market) {
        setMarketId(market.id);
        setState({
          name: market.name || '',
          marketType: market.market_type || '',
          description: market.description || '',
          crowdDescription: market.crowd_description || '',
          categoriesAllowed: market.categories_allowed || [],
          operatingSeason: market.operating_season === 'seasonal' ? 'seasonal' : 'year-round',
          seasonalMonths: market.seasonal_months || [],
          formattedAddress: market.formatted_address || '',
          city: market.city || '',
          state: market.state || '',
          lat: market.lat,
          lng: market.lng,
          timezone: market.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          weeklySchedule: (market.weekly_schedule as unknown as WeeklyScheduleDay[]) || defaultWeeklySchedule,
          setupWindowMinutes: market.setup_window_minutes || 60,
          breakdownWindowMinutes: market.breakdown_window_minutes || 30,
          mediaItems: (market.media_items as unknown as MediaItem[]) || [],
          coverImageUrl: market.cover_image_url || '',
          isPublished: market.is_published || false,
          bookingsEnabled: market.bookings_enabled || false,
        });

        // Load slot types
        const { data: slotTypesData } = await supabase
          .from('slot_types')
          .select('*')
          .eq('market_id', market.id)
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
          .eq('market_id', market.id)
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
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your saved data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Save progress (autosave)
  const saveProgress = useCallback(async (data: Partial<MarketOnboardingState> = {}) => {
    if (!user) return;

    setSaving(true);
    try {
      const mergedState = { ...state, ...data };
      
      const marketData = {
        user_id: user.id,
        name: mergedState.name || 'Untitled Market',
        market_type: mergedState.marketType || 'other',
        description: mergedState.description,
        crowd_description: mergedState.crowdDescription,
        categories_allowed: mergedState.categoriesAllowed,
        operating_season: mergedState.operatingSeason,
        seasonal_months: mergedState.seasonalMonths,
        formatted_address: mergedState.formattedAddress,
        city: mergedState.city,
        state: mergedState.state,
        lat: mergedState.lat,
        lng: mergedState.lng,
        timezone: mergedState.timezone,
        weekly_schedule: JSON.parse(JSON.stringify(mergedState.weeklySchedule)),
        setup_window_minutes: mergedState.setupWindowMinutes,
        breakdown_window_minutes: mergedState.breakdownWindowMinutes,
        media_items: JSON.parse(JSON.stringify(mergedState.mediaItems)),
        cover_image_url: mergedState.coverImageUrl || (mergedState.mediaItems[0]?.url || null),
        updated_at: new Date().toISOString(),
      };

      if (marketId) {
        const { error } = await supabase
          .from('markets')
          .update(marketData as any)
          .eq('id', marketId);
        if (error) throw error;
      } else {
        const { data: newMarket, error } = await supabase
          .from('markets')
          .insert(marketData as any)
          .select()
          .single();
        if (error) throw error;
        if (newMarket) {
          setMarketId(newMarket.id);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Save failed',
        description: 'Your changes could not be saved. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [user, state, marketId, toast]);

  // Save slot type
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
        return slotType.id;
      } else {
        const { data, error } = await supabase
          .from('slot_types')
          .insert(slotTypeData)
          .select()
          .single();
        if (error) throw error;
        return data?.id || null;
      }
    } catch (error) {
      console.error('Error saving slot type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save slot type.',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, marketId, toast]);

  // Delete slot type
  const deleteSlotType = useCallback(async (slotTypeId: string) => {
    try {
      const { error } = await supabase
        .from('slot_types')
        .delete()
        .eq('id', slotTypeId);
      if (error) throw error;
      setSlotTypes(prev => prev.filter(st => st.id !== slotTypeId));
    } catch (error) {
      console.error('Error deleting slot type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete slot type.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Save inventory item
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
        return item.id;
      } else {
        const { data, error } = await supabase
          .from('slot_inventory')
          .insert(inventoryData)
          .select()
          .single();
        if (error) throw error;
        return data?.id || null;
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to save inventory.',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, marketId, toast]);

  // Delete inventory item
  const deleteInventoryItem = useCallback(async (inventoryId: string) => {
    try {
      const { error } = await supabase
        .from('slot_inventory')
        .delete()
        .eq('id', inventoryId);
      if (error) throw error;
      setInventory(prev => prev.filter(inv => inv.id !== inventoryId));
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Bulk create inventory
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
      }

      toast({
        title: 'Inventory created',
        description: `Added ${items.length} inventory slots.`,
      });
    } catch (error) {
      console.error('Error bulk creating inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to create inventory.',
        variant: 'destructive'
      });
    }
  }, [user, marketId, toast]);

  // Publish
  const publishMarket = useCallback(async (): Promise<boolean> => {
    if (!marketId) return false;

    try {
      const { error } = await supabase
        .from('markets')
        .update({
          is_published: true,
          bookings_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', marketId);

      if (error) throw error;

      setState(prev => ({ ...prev, isPublished: true, bookingsEnabled: true }));
      
      toast({
        title: 'Market published!',
        description: 'Your market is now live and accepting reservations.',
      });
      
      // Redirect to market dashboard
      navigate('/marketspace-dashboard');
      
      return true;
    } catch (error) {
      console.error('Error publishing market:', error);
      toast({
        title: 'Publish failed',
        description: 'Could not publish your market. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }, [marketId, toast, navigate]);

  // Check publish requirements
  const canPublish = useCallback(() => {
    const missing: string[] = [];
    
    if (!state.name) missing.push('Market name');
    if (!state.marketType) missing.push('Market type');
    if (!state.description) missing.push('Description');
    if (!state.crowdDescription) missing.push('Crowd description');
    if (!state.formattedAddress) missing.push('Location');
    if (state.mediaItems.length === 0) missing.push('At least 1 photo');
    if (slotTypes.length === 0) missing.push('At least 1 slot type');
    if (inventory.length === 0) missing.push('At least 1 inventory date');
    
    return {
      canPublish: missing.length === 0,
      missing
    };
  }, [state, slotTypes, inventory]);

  // Navigation
  const updateState = useCallback(<K extends keyof MarketOnboardingState>(
    key: K,
    value: MarketOnboardingState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      saveProgress();
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }, [currentStep, saveProgress]);

  const prevStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: MarketOnboardingStep) => {
    saveProgress();
    setCurrentStep(step);
  }, [saveProgress]);

  return {
    currentStep,
    state,
    slotTypes,
    inventory,
    marketId,
    loading,
    saving,
    lastSaved,
    updateState,
    setState,
    setSlotTypes,
    setInventory,
    saveProgress,
    saveSlotType,
    deleteSlotType,
    saveInventoryItem,
    deleteInventoryItem,
    bulkCreateInventory,
    publishMarket,
    canPublish,
    nextStep,
    prevStep,
    goToStep,
  };
}
