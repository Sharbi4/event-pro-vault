import { addDays, addHours, isAfter, isBefore, parseISO } from 'date-fns';
import type { BookingData } from '@/hooks/useBookings';

export type BookingUiState =
  | 'pending_vendor'
  | 'awaiting_payment'
  | 'confirmed_cancellable'
  | 'confirmed_locked'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type CancellationPolicy = 'flexible' | 'standard' | 'strict';

export interface CancellationRule {
  policy: CancellationPolicy;
  /** hours before event_start where a full refund is still possible */
  fullRefundHours: number;
  /** hours before event_start where a partial 50% refund applies */
  partialRefundHours: number;
  partialRefundPct: number;
  description: string;
}

export const CANCELLATION_RULES: Record<CancellationPolicy, CancellationRule> = {
  flexible: {
    policy: 'flexible',
    fullRefundHours: 48,
    partialRefundHours: 24,
    partialRefundPct: 50,
    description: 'Full refund up to 48h before · 50% within 24–48h · No refund inside 24h',
  },
  standard: {
    policy: 'standard',
    fullRefundHours: 24 * 7,
    partialRefundHours: 72,
    partialRefundPct: 50,
    description: 'Full refund up to 7 days before · 50% within 3–7 days · No refund inside 72h',
  },
  strict: {
    policy: 'strict',
    fullRefundHours: 24 * 14,
    partialRefundHours: 24 * 7,
    partialRefundPct: 50,
    description: 'Full refund up to 14 days before · 50% within 7–14 days · No refund inside 7 days',
  },
};

interface ExtendedBooking extends BookingData {
  payment_status?: string;
  deposit_amount?: number;
  final_amount?: number;
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
}

/** Build a JS Date for the event start, using event_date + start_time when available. */
export function getEventStart(b: BookingData): Date {
  const dateStr = b.event_date; // yyyy-mm-dd
  const t = b.start_time || '12:00';
  return new Date(`${dateStr}T${t}:00`);
}

export function getEventEnd(b: BookingData): Date {
  const start = getEventStart(b);
  if (b.end_time) {
    return new Date(`${b.event_date}T${b.end_time}:00`);
  }
  const dur = b.duration_minutes ?? 180;
  return new Date(start.getTime() + dur * 60_000);
}

/** Has the customer paid enough to consider this confirmed? */
function isPaidEnough(b: ExtendedBooking): boolean {
  if (b.payment_method === 'cash') return true;
  if (b.deposit_paid_at || b.final_paid_at) return true;
  if (b.payment_status === 'paid' || b.payment_status === 'deposit_paid') return true;
  return false;
}

/** Compute the cancellation deadline (full-refund cutoff) for this booking. */
export function getCancellationDeadline(b: BookingData, now = new Date()): Date {
  const start = getEventStart(b);
  const policy = (b.cancellation_policy ?? 'standard') as CancellationPolicy;
  const rule = CANCELLATION_RULES[policy];
  return new Date(start.getTime() - rule.fullRefundHours * 60 * 60_000);
}

export interface CancellationStatus {
  canCancel: boolean;
  refundPct: number; // 0, partial%, or 100
  reason: string;
}

/** Decide whether the customer can still cancel and what refund tier applies. */
export function getCancellationStatus(b: BookingData, now = new Date()): CancellationStatus {
  const start = getEventStart(b);
  if (now >= start) {
    return { canCancel: false, refundPct: 0, reason: 'Event has already started.' };
  }
  const policy = (b.cancellation_policy ?? 'standard') as CancellationPolicy;
  const rule = CANCELLATION_RULES[policy];
  const hoursUntil = (start.getTime() - now.getTime()) / 3_600_000;

  if (hoursUntil >= rule.fullRefundHours) {
    return { canCancel: true, refundPct: 100, reason: 'Within full refund window.' };
  }
  if (hoursUntil >= rule.partialRefundHours) {
    return { canCancel: true, refundPct: rule.partialRefundPct, reason: 'Within partial refund window.' };
  }
  return {
    canCancel: false,
    refundPct: 0,
    reason: 'Cancellation window has closed for this booking.',
  };
}

export function deriveBookingState(b: ExtendedBooking, now = new Date()): BookingUiState {
  const status = (b.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'canceled' || status === 'declined') return 'cancelled';

  const start = getEventStart(b);
  const end = getEventEnd(b);

  // Hard time-based states win
  if (status === 'completed' || isAfter(now, end)) return 'completed';
  if (isAfter(now, start) && isBefore(now, end)) return 'in_progress';

  if (status === 'pending') return 'pending_vendor';
  if (status === 'awaiting_payment') return 'awaiting_payment';

  // confirmed/approved branch
  if (status === 'approved' && !isPaidEnough(b)) return 'awaiting_payment';

  if (status === 'confirmed' || status === 'approved' || status === 'paid') {
    const cancel = getCancellationStatus(b, now);
    return cancel.canCancel ? 'confirmed_cancellable' : 'confirmed_locked';
  }

  // Fallback — treat unknown future-dated bookings as pending
  return 'pending_vendor';
}

/** Which dashboard sub-tab does this state live under? */
export function getBookingTab(state: BookingUiState): 'pending' | 'upcoming' | 'past' | 'cancelled' {
  switch (state) {
    case 'pending_vendor':
    case 'awaiting_payment':
      return 'pending';
    case 'confirmed_cancellable':
    case 'confirmed_locked':
    case 'in_progress':
      return 'upcoming';
    case 'completed':
      return 'past';
    case 'cancelled':
      return 'cancelled';
  }
}

export const STATE_LABELS: Record<BookingUiState, { label: string; tone: 'warning' | 'info' | 'success' | 'neutral' | 'danger' | 'live' }> = {
  pending_vendor: { label: 'Pending approval', tone: 'warning' },
  awaiting_payment: { label: 'Approved · Payment needed', tone: 'info' },
  confirmed_cancellable: { label: 'Confirmed', tone: 'success' },
  confirmed_locked: { label: 'Confirmed · Cancellation closed', tone: 'success' },
  in_progress: { label: 'Happening now', tone: 'live' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

// Re-exports for convenience
export { addDays, addHours, parseISO };
