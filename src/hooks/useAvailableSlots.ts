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
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches bookable slots from the canonical `get-available-slots` edge function.
 * Use this for the customer time-picker so client and server agree on availability.
 */
export function useAvailableSlots(args: Args): Result {
  const { vendorUserId, packageId, date, enabled = true } = args;
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

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
      } else {
        setSlots((data?.slots as BookableSlot[]) ?? []);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, vendorUserId, packageId, date, args.mode, args.durationMinutes, args.setupMinutes, args.breakdownMinutes, args.intervalMinutes, tick]);

  return { loading, slots, error, refetch };
}
