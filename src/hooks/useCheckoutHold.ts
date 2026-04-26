import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emitAvailabilityRefresh } from './useAvailableSlots';

export interface HoldState {
  holdId: string | null;
  expiresAt: Date | null;
  secondsRemaining: number;
  status: 'idle' | 'holding' | 'expired' | 'released' | 'error';
  error?: string;
}

const DEFAULT_HOLD_MIN = 15;

/**
 * Manages a 15-minute checkout hold against a Vendor's calendar.
 * Call createHold() once the customer commits to a date+time; the hold
 * auto-expires (server-side) and the local countdown reflects it.
 */
export function useCheckoutHold() {
  const [state, setState] = useState<HoldState>({
    holdId: null,
    expiresAt: null,
    secondsRemaining: 0,
    status: 'idle',
  });
  const intervalRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (expiresAt: Date, vendorUserId?: string) => {
    stopTimer();
    const tick = () => {
      const secs = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setState(s => ({ ...s, secondsRemaining: secs, status: secs <= 0 ? 'expired' : 'holding' }));
      if (secs <= 0) {
        stopTimer();
        emitAvailabilityRefresh(vendorUserId);
      }
    };
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
  };

  const createHold = useCallback(async (params: {
    vendorUserId: string;
    startAt: Date;
    endAt: Date;
    packageId?: string;
    holdMinutes?: number;
  }) => {
    setState(s => ({ ...s, status: 'idle', error: undefined }));
    const { data, error } = await supabase.functions.invoke('create-booking-hold', {
      body: {
        vendor_user_id: params.vendorUserId,
        start_at: params.startAt.toISOString(),
        end_at: params.endAt.toISOString(),
        package_id: params.packageId,
        hold_minutes: params.holdMinutes ?? DEFAULT_HOLD_MIN,
      },
    });
    if (error || !data?.hold_id) {
      const msg = (data as any)?.error || error?.message || 'Could not hold this time';
      setState({
        holdId: null,
        expiresAt: null,
        secondsRemaining: 0,
        status: 'error',
        error: msg,
      });
      return { ok: false as const, error: msg, conflicts: (data as any)?.conflicts };
    }
    const expiresAt = new Date(data.expires_at);
    setState({
      holdId: data.hold_id,
      expiresAt,
      secondsRemaining: data.seconds_remaining,
      status: 'holding',
    });
    startTimer(expiresAt, params.vendorUserId);
    emitAvailabilityRefresh(params.vendorUserId);
    return { ok: true as const, holdId: data.hold_id, expiresAt };
  }, []);

  const releaseHold = useCallback(async (vendorUserId?: string) => {
    stopTimer();
    if (state.holdId) {
      await supabase
        .from('calendar_holds')
        .update({ status: 'released' })
        .eq('id', state.holdId);
    }
    setState({ holdId: null, expiresAt: null, secondsRemaining: 0, status: 'released' });
    emitAvailabilityRefresh(vendorUserId);
  }, [state.holdId]);

  // Cleanup timer on unmount; do NOT auto-release (let it expire naturally so user can resume)
  useEffect(() => () => stopTimer(), []);

  return { ...state, createHold, releaseHold };
}

export function formatHoldCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
