import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import { bookingBlocksCalendar } from '@/lib/bookingLifecycle';

export type ScheduleBlockKind =
  | 'confirmed_booking'
  | 'pending_request'
  | 'awaiting_payment'
  | 'balance_due'
  | 'manual_block'
  | 'pending_hold'
  | 'setup_buffer'
  | 'breakdown_buffer'
  | 'unavailable';

export interface ScheduleBlock {
  id: string;
  kind: ScheduleBlockKind;
  start: Date;
  end: Date;
  title: string;
  subtitle?: string;
  bookingId?: string;
  meta?: Record<string, any>;
}

export interface ScheduleData {
  blocks: ScheduleBlock[];
  bookings: any[];
  loading: boolean;
  refetch: () => void;
}

/**
 * Loads everything needed to render the master Booking Command Center:
 * confirmed bookings, holds, manual blocks, and synthesizes setup/breakdown
 * buffer blocks based on each booking's window.
 */
export function useScheduleData(vendorUserId: string | undefined, rangeStart: Date, rangeEnd: Date): ScheduleData {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!vendorUserId) return;
    let cancelled = false;
    setLoading(true);

    const startISO = startOfDay(rangeStart).toISOString();
    const endISO = endOfDay(rangeEnd).toISOString();
    const startDate = format(startOfDay(rangeStart), 'yyyy-MM-dd');
    const endDate = format(endOfDay(rangeEnd), 'yyyy-MM-dd');

    Promise.all([
      supabase
        .from('bookings')
        .select('*')
        .eq('vendor_user_id', vendorUserId)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_start_at', { ascending: true }),
      supabase
        .from('calendar_holds')
        .select('*')
        .eq('vendor_user_id', vendorUserId)
        .eq('status', 'active')
        .gte('hold_end', startISO)
        .lte('hold_start', endISO),
      (supabase.from as any)('vendor_blocked_times')
        .select('*')
        .eq('user_id', vendorUserId)
        .gte('block_end', startISO)
        .lte('block_start', endISO),
    ]).then(([bRes, hRes, btRes]) => {
      if (cancelled) return;
      const bookingRows = (bRes.data ?? []) as any[];
      const holdRows = (hRes.data ?? []) as any[];
      const blockedTimes = (btRes.data ?? []) as any[];

      const computed: ScheduleBlock[] = [];

      for (const b of bookingRows) {
        if (!bookingBlocksCalendar(b)) continue;
        const start = b.event_start_at ? new Date(b.event_start_at) : null;
        const end = b.event_end_at ? new Date(b.event_end_at) : null;
        const blockStart = b.calendar_block_start ? new Date(b.calendar_block_start) : start;
        const blockEnd = b.calendar_block_end ? new Date(b.calendar_block_end) : end;
        if (!start || !end || !blockStart || !blockEnd) continue;

        const lifecycle: string = b.lifecycle_status ?? '';
        const status: string = b.status ?? '';
        const isPending = lifecycle === 'pending_vendor_approval' || status === 'pending';
        const isAwaitingPayment =
          lifecycle === 'approved_payment_required' || lifecycle === 'payment_pending' || status === 'awaiting_payment';
        const balanceDue = !!b.deposit_paid_at && !b.final_paid_at && (b.final_amount ?? 0) > 0;

        let kind: ScheduleBlockKind = 'confirmed_booking';
        if (isPending) kind = 'pending_request';
        else if (isAwaitingPayment) kind = 'awaiting_payment';
        else if (balanceDue) kind = 'balance_due';

        // Setup buffer
        if (blockStart < start) {
          computed.push({
            id: `${b.id}-setup`,
            kind: 'setup_buffer',
            start: blockStart,
            end: start,
            title: 'Setup',
            bookingId: b.id,
          });
        }
        // Service window
        computed.push({
          id: b.id,
          kind,
          start,
          end,
          title: b.customer_email?.split('@')[0] || 'Booking',
          subtitle: b.event_location ?? undefined,
          bookingId: b.id,
          meta: { booking: b },
        });
        // Breakdown buffer
        if (blockEnd > end) {
          computed.push({
            id: `${b.id}-breakdown`,
            kind: 'breakdown_buffer',
            start: end,
            end: blockEnd,
            title: 'Breakdown',
            bookingId: b.id,
          });
        }
      }

      for (const h of holdRows) {
        computed.push({
          id: `hold-${h.id}`,
          kind: 'pending_hold',
          start: new Date(h.hold_start),
          end: new Date(h.hold_end),
          title: 'On hold',
          subtitle: 'Customer reserving',
        });
      }

      for (const t of blockedTimes) {
        computed.push({
          id: `bt-${t.id}`,
          kind: t.is_full_day ? 'unavailable' : 'manual_block',
          start: new Date(t.block_start),
          end: new Date(t.block_end),
          title: t.is_full_day ? 'Unavailable' : 'Blocked',
          subtitle: t.reason ?? undefined,
        });
      }

      computed.sort((a, b) => a.start.getTime() - b.start.getTime());
      setBlocks(computed);
      setBookings(bookingRows);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [vendorUserId, rangeStart.getTime(), rangeEnd.getTime(), tick]);

  // Realtime: refresh when bookings or holds change for this vendor
  useEffect(() => {
    if (!vendorUserId) return;
    const channel = supabase
      .channel(`schedule:${vendorUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `vendor_user_id=eq.${vendorUserId}` },
        () => setTick(t => t + 1)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_holds', filter: `vendor_user_id=eq.${vendorUserId}` },
        () => setTick(t => t + 1)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorUserId]);

  return { blocks, bookings, loading, refetch };
}

export const BLOCK_STYLES: Record<ScheduleBlockKind, { bg: string; border: string; text: string; label: string }> = {
  confirmed_booking: { bg: 'bg-emerald-500/15', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', label: 'Confirmed' },
  pending_request:   { bg: 'bg-amber-500/15',   border: 'border-amber-500',   text: 'text-amber-700 dark:text-amber-300',   label: 'Pending' },
  awaiting_payment:  { bg: 'bg-orange-500/15',  border: 'border-orange-500',  text: 'text-orange-700 dark:text-orange-300', label: 'Awaiting payment' },
  balance_due:       { bg: 'bg-blue-500/15',    border: 'border-blue-500',    text: 'text-blue-700 dark:text-blue-300',     label: 'Balance due' },
  manual_block:      { bg: 'bg-slate-500/15',   border: 'border-slate-500',   text: 'text-slate-700 dark:text-slate-300',   label: 'Blocked' },
  pending_hold:      { bg: 'bg-violet-500/15',  border: 'border-violet-500',  text: 'text-violet-700 dark:text-violet-300', label: 'On hold' },
  setup_buffer:      { bg: 'bg-emerald-500/5',  border: 'border-emerald-500/40 border-dashed', text: 'text-emerald-700/70 dark:text-emerald-300/70', label: 'Setup' },
  breakdown_buffer:  { bg: 'bg-emerald-500/5',  border: 'border-emerald-500/40 border-dashed', text: 'text-emerald-700/70 dark:text-emerald-300/70', label: 'Breakdown' },
  unavailable:       { bg: 'bg-muted',          border: 'border-border',      text: 'text-muted-foreground',                label: 'Unavailable' },
};
