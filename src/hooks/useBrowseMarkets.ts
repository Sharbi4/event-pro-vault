import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrowseMarket {
  id: string;
  name: string;
  marketType: string;
  description: string;
  crowdDescription: string;
  categoriesAllowed: string[];
  formattedAddress: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  coverImageUrl: string;
  // Computed from inventory
  nextDate: string | null;
  nextTime: string | null;
  totalSlotsRemaining: number;
  minPrice: number | null;
  // Placeholder for now
  rating: number;
  reviewCount: number;
}

export interface BrowseMarketFilters {
  search: string;
  marketType: string | null;
  date: string | null;
  location: string;
  category: string | null;
}

export function useBrowseMarkets() {
  const [markets, setMarkets] = useState<BrowseMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BrowseMarketFilters>({
    search: '',
    marketType: null,
    date: null,
    location: '',
    category: null,
  });

  const fetchMarkets = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch published markets
      let marketsQuery = supabase
        .from('markets')
        .select('*')
        .eq('is_published', true);

      // Apply market type filter
      if (filters.marketType) {
        marketsQuery = marketsQuery.eq('market_type', filters.marketType);
      }

      const { data: marketsData, error: marketsError } = await marketsQuery;

      if (marketsError) throw marketsError;

      if (!marketsData || marketsData.length === 0) {
        setMarkets([]);
        setLoading(false);
        return;
      }

      const marketIds = marketsData.map(m => m.id);

      // Fetch slot types and inventory for these markets
      const [slotTypesResult, inventoryResult] = await Promise.all([
        supabase
          .from('slot_types')
          .select('id, market_id, price, is_active')
          .in('market_id', marketIds)
          .eq('is_active', true),
        supabase
          .from('slot_inventory')
          .select('id, market_id, slot_type_id, date, start_time, end_time, slots_remaining')
          .in('market_id', marketIds)
          .gte('date', new Date().toISOString().split('T')[0])
          .gt('slots_remaining', 0)
          .order('date', { ascending: true })
      ]);

      if (slotTypesResult.error) throw slotTypesResult.error;
      if (inventoryResult.error) throw inventoryResult.error;

      // Build lookup maps
      const slotTypesByMarket = new Map<string, typeof slotTypesResult.data>();
      (slotTypesResult.data || []).forEach(st => {
        if (!slotTypesByMarket.has(st.market_id)) {
          slotTypesByMarket.set(st.market_id, []);
        }
        slotTypesByMarket.get(st.market_id)!.push(st);
      });

      const inventoryByMarket = new Map<string, typeof inventoryResult.data>();
      (inventoryResult.data || []).forEach(inv => {
        if (!inventoryByMarket.has(inv.market_id)) {
          inventoryByMarket.set(inv.market_id, []);
        }
        inventoryByMarket.get(inv.market_id)!.push(inv);
      });

      // Build enriched markets
      const enrichedMarkets: BrowseMarket[] = marketsData.map(market => {
        const slotTypes = slotTypesByMarket.get(market.id) || [];
        const inventory = inventoryByMarket.get(market.id) || [];
        
        // Get min price across slot types
        const minPrice = slotTypes.length > 0 
          ? Math.min(...slotTypes.map(st => Number(st.price)))
          : null;

        // Get next available date/time
        const nextInventory = inventory[0];
        const nextDate = nextInventory?.date || null;
        const nextTime = nextInventory ? `${nextInventory.start_time}-${nextInventory.end_time}` : null;

        // Get total slots remaining
        const totalSlotsRemaining = inventory.reduce((sum, inv) => sum + inv.slots_remaining, 0);

        return {
          id: market.id,
          name: market.name,
          marketType: market.market_type,
          description: market.description || '',
          crowdDescription: market.crowd_description || '',
          categoriesAllowed: market.categories_allowed || [],
          formattedAddress: market.formatted_address || '',
          city: market.city || '',
          state: market.state || '',
          lat: market.lat,
          lng: market.lng,
          coverImageUrl: market.cover_image_url || '',
          nextDate,
          nextTime,
          totalSlotsRemaining,
          minPrice,
          // Placeholder ratings
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 100) + 10,
        };
      });

      // Apply filters
      let filteredMarkets = enrichedMarkets;

      // Date filter - only show markets with inventory on that date
      if (filters.date) {
        const dateInventory = (inventoryResult.data || []).filter(inv => inv.date === filters.date);
        const marketIdsWithInventory = new Set(dateInventory.map(inv => inv.market_id));
        filteredMarkets = filteredMarkets.filter(m => marketIdsWithInventory.has(m.id));
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMarkets = filteredMarkets.filter(m => 
          m.name.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower) ||
          m.marketType.toLowerCase().includes(searchLower) ||
          m.city.toLowerCase().includes(searchLower)
        );
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        filteredMarkets = filteredMarkets.filter(m => 
          m.city.toLowerCase().includes(locationLower) ||
          m.state.toLowerCase().includes(locationLower) ||
          m.formattedAddress.toLowerCase().includes(locationLower)
        );
      }

      // Category filter - check if market allows this vendor category
      if (filters.category) {
        filteredMarkets = filteredMarkets.filter(m => 
          m.categoriesAllowed.length === 0 || // If no restrictions, show all
          m.categoriesAllowed.some(cat => 
            cat.toLowerCase().includes(filters.category!.toLowerCase())
          )
        );
      }

      // Sort by next date, then by slots remaining
      filteredMarkets.sort((a, b) => {
        if (a.nextDate && b.nextDate) {
          const dateCompare = a.nextDate.localeCompare(b.nextDate);
          if (dateCompare !== 0) return dateCompare;
        }
        if (a.nextDate && !b.nextDate) return -1;
        if (!a.nextDate && b.nextDate) return 1;
        return b.totalSlotsRemaining - a.totalSlotsRemaining;
      });

      setMarkets(filteredMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Subscribe to realtime inventory updates for live slot availability
  useEffect(() => {
    const channel = supabase
      .channel('browse-markets-inventory')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'slot_inventory',
        },
        (payload) => {
          const updated = payload.new as any;
          
          // Update the affected market's slot count
          setMarkets(prev => prev.map(market => {
            if (market.id === updated.market_id) {
              // Recalculate total slots remaining for this market
              // We need to refetch to get accurate counts, but for immediate feedback
              // we can adjust based on the change
              const oldSlots = (payload.old as any)?.slots_remaining || 0;
              const newSlots = updated.slots_remaining || 0;
              const diff = newSlots - oldSlots;
              
              return {
                ...market,
                totalSlotsRemaining: Math.max(0, market.totalSlotsRemaining + diff),
              };
            }
            return market;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateFilter = (key: keyof BrowseMarketFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      marketType: null,
      date: null,
      location: '',
      category: null,
    });
  };

  // Market type options for filtering
  const marketTypes = [
    'Farmers Market',
    'Flea Market',
    'Vendor Market',
    'Night Market',
    'Pop-up Event',
    'Food Truck Roundup',
    'Festival Vendor Area',
  ];

  return {
    markets,
    loading,
    filters,
    updateFilter,
    clearFilters,
    marketTypes,
    refetch: fetchMarkets
  };
}
