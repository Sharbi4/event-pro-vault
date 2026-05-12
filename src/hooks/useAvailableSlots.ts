import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BookableSlot } from '@/lib/availabilityEngine';

interface Args {
  vendorUserId?: string;
  packageId?: string;
  date?: string; // YYYY-MM-DD
  mode?: 'HOURLY' | 'DAILY';
  durationMinutes?: number;
  setupMinutes?: number;
  breakdownMinutes?: number;
  intervalMinutes?: number;
  enabled?: boolean;
}

interface Result {
  loading: boolean;
  slots: BookableSlot[];
  timezone: string | null;
  error: string | null;
  refetch: () => void;
}

export const AVAILABILITY_REFRESH_EVENT = 'eventpro:availability-refresh';

/**
 * Notify all mounted useAvailableSlots hooks (optionally scoped to a Event Pro)
 * to refetch immediately. Call this after creating/releasing a hold or booking.
 */
export function emitAvailabilityRefresh(vendorUserId?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AVAILABILITY_REFRESH_EVENT, { detail: { vendorUserId } })
  );
}

/**
 * Fetches bookable slots from the canonical `get-available-slots` edge function.
 * Auto-refreshes when calendar_holds or bookings change for this Event Pro (realtime),
 * and when a manual `emitAvailabilityRefresh` event fires.
 */
export function useAvailableSlots(args: Args): Result {
  const { vendorUserId, packageId, date, enabled = true } = args;
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  // Fetch slots
  useEffect(() => {
    if (!enabled || !vendorUserId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase.functions.invoke('get-available-slots', {
      body: {
        vendor_user_id: vendorUserId,
        package_id: packageId,
        date,
        mode: args.mode,
        duration_minutes: args.durationMinutes,
        setup_minutes: args.setupMinutes,
        breakdown_minutes: args.breakdownMinutes,
        interval_minutes: args.intervalMinutes,
      },
    }).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setSlots([]);
        setTimezone(null);
      } else {
        setSlots((data?.slots as BookableSlot[]) ?? []);
        setTimezone((data?.timezone as string) ?? null);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, vendorUserId, packageId, date, args.mode, args.durationMinutes, args.setupMinutes, args.breakdownMinutes, args.intervalMinutes, tick]);

  // Realtime: refetch when holds/bookings change for this Event Pro
  useEffect(() => {
    if (!enabled || !vendorUserId) return;

    const channel = supabase
      .channel(`availability:${vendorUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_holds', filter: `vendor_user_id=eq.${vendorUserId}` },
        () => setTick(t => t + 1)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `vendor_user_id=eq.${vendorUserId}` },
        () => setTick(t => t + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, vendorUserId]);

  // Manual event-based refresh (fired right after creating/releasing a hold)
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { vendorUserId?: string } | undefined;
      if (!detail?.vendorUserId || detail.vendorUserId === vendorUserId) {
        setTick(t => t + 1);
      }
    };
    window.addEventListener(AVAILABILITY_REFRESH_EVENT, handler);
    return () => window.removeEventListener(AVAILABILITY_REFRESH_EVENT, handler);
  }, [enabled, vendorUserId]);

  // Auto-expire holds: poll a lightweight tick every 30s so expired-but-not-yet-cleaned
  // holds drop off the picker even if the realtime UPDATE hasn't fired yet.
  useEffect(() => {
    if (!enabled || !vendorUserId) return;
    const interval = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [enabled, vendorUserId]);

  return { loading, slots, error, refetch };
}
