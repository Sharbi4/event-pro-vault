/**
 * Hook for admin analytics dashboard
 * Provides KPIs and data tables for marketplace insights
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_name: string;
  city: string | null;
  state: string | null;
  category: string | null;
  package_id: string | null;
  pro_id: string | null;
  lead_id: string | null;
  metadata: Record<string, unknown>;
}

interface DemandSegment {
  category: string | null;
  city: string | null;
  state: string | null;
  count: number;
}

interface SupplyGap {
  category: string | null;
  city: string | null;
  state: string | null;
  noMatchCount: number;
  searchCount: number;
  gapRatio: number;
}

interface DailyMetric {
  date: string;
  searches: number;
  leads: number;
  bookings: number;
}

export function useAnalyticsAdmin(daysBack: number = 7) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startDate = useMemo(() => {
    return startOfDay(subDays(new Date(), daysBack));
  }, [daysBack]);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(10000);

        if (fetchError) {
          throw fetchError;
        }

        setEvents((data as AnalyticsEvent[]) || []);
      } catch (err: unknown) {
        console.error('[Analytics] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [startDate]);

  // KPI calculations
  const kpis = useMemo(() => {
    const totalSearches = events.filter(e => e.event_name === 'search_performed').length;
    const resultsViewed = events.filter(e => e.event_name === 'results_viewed').length;
    const noMatches = events.filter(e => e.event_name === 'no_match_shown').length;
    const leadsSubmitted = events.filter(e => e.event_name === 'lead_submitted').length;
    const packageViews = events.filter(e => e.event_name === 'package_viewed').length;
    const bookingStarts = events.filter(e => e.event_name === 'booking_started').length;
    const bookingsCompleted = events.filter(e => 
      e.event_name === 'booking_completed' || e.event_name === 'booking_requested'
    ).length;
    const signups = events.filter(e => e.event_name === 'signup_completed').length;

    const noMatchRate = totalSearches > 0 ? (noMatches / totalSearches) * 100 : 0;
    const leadConversionRate = noMatches > 0 ? (leadsSubmitted / noMatches) * 100 : 0;
    const bookingConversionRate = bookingStarts > 0 ? (bookingsCompleted / bookingStarts) * 100 : 0;

    return {
      totalSearches,
      resultsViewed,
      noMatches,
      noMatchRate,
      leadsSubmitted,
      leadConversionRate,
      packageViews,
      bookingStarts,
      bookingsCompleted,
      bookingConversionRate,
      signups,
    };
  }, [events]);

  // Top demand segments (by search count)
  const topDemandSegments = useMemo(() => {
    const searchEvents = events.filter(e => e.event_name === 'search_performed');
    const segments = new Map<string, DemandSegment>();

    searchEvents.forEach(e => {
      const key = `${e.category || 'Unknown'}|${e.city || 'Unknown'}|${e.state || ''}`;
      const existing = segments.get(key);
      if (existing) {
        existing.count++;
      } else {
        segments.set(key, {
          category: e.category,
          city: e.city,
          state: e.state,
          count: 1,
        });
      }
    });

    return Array.from(segments.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [events]);

  // No-match segments (highest supply gaps)
  const supplyGaps = useMemo(() => {
    const noMatchEvents = events.filter(e => e.event_name === 'no_match_shown');
    const searchEvents = events.filter(e => e.event_name === 'search_performed');
    
    const noMatchCounts = new Map<string, number>();
    const searchCounts = new Map<string, number>();

    noMatchEvents.forEach(e => {
      const key = `${e.category || 'Unknown'}|${e.city || 'Unknown'}|${e.state || ''}`;
      noMatchCounts.set(key, (noMatchCounts.get(key) || 0) + 1);
    });

    searchEvents.forEach(e => {
      const key = `${e.category || 'Unknown'}|${e.city || 'Unknown'}|${e.state || ''}`;
      searchCounts.set(key, (searchCounts.get(key) || 0) + 1);
    });

    const gaps: SupplyGap[] = [];
    noMatchCounts.forEach((count, key) => {
      const [category, city, state] = key.split('|');
      const searchCount = searchCounts.get(key) || 0;
      gaps.push({
        category: category === 'Unknown' ? null : category,
        city: city === 'Unknown' ? null : city,
        state: state || null,
        noMatchCount: count,
        searchCount,
        gapRatio: searchCount > 0 ? count / searchCount : 1,
      });
    });

    return gaps
      .sort((a, b) => b.noMatchCount - a.noMatchCount)
      .slice(0, 20);
  }, [events]);

  // Daily metrics for chart
  const dailyMetrics = useMemo(() => {
    const dailyMap = new Map<string, DailyMetric>();

    // Initialize all days
    for (let i = 0; i < daysBack; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyMap.set(date, { date, searches: 0, leads: 0, bookings: 0 });
    }

    events.forEach(e => {
      const date = format(new Date(e.created_at), 'yyyy-MM-dd');
      const metric = dailyMap.get(date);
      if (!metric) return;

      if (e.event_name === 'search_performed') metric.searches++;
      if (e.event_name === 'lead_submitted') metric.leads++;
      if (e.event_name === 'booking_completed' || e.event_name === 'booking_requested') metric.bookings++;
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, daysBack]);

  return {
    events,
    loading,
    error,
    kpis,
    topDemandSegments,
    supplyGaps,
    dailyMetrics,
  };
}
