// Unified booking lifecycle vocabulary used across the platform.
// Calendar blocking is delegated to the shared availabilityEngine helpers.

import { BLOCKING_LIFECYCLE_STATUSES, BLOCKING_LEGACY_STATUSES, bookingBlocksCalendar } from './availabilityEngine';

export type BookingLifecycleStatus =
  | 'pending_vendor_approval'
  | 'approved_payment_required'
  | 'payment_pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_vendor'
  | 'declined_by_vendor'
  | 'expired'
  | 'no_show'
  | 'refunded';

/** Customer-friendly label for the unified status taxonomy. */
export const LIFECYCLE_LABEL: Record<BookingLifecycleStatus, string> = {
  pending_vendor_approval: 'Pending',
  approved_payment_required: 'Awaiting payment',
  payment_pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled_by_customer: 'Cancelled',
  cancelled_by_vendor: 'Cancelled',
  declined_by_vendor: 'Declined',
  expired: 'Expired',
  no_show: 'No-show',
  refunded: 'Refunded',
};

/** Tone token for badge styling. */
export type StatusTone = 'warning' | 'info' | 'success' | 'neutral' | 'danger';

export const LIFECYCLE_TONE: Record<BookingLifecycleStatus, StatusTone> = {
  pending_vendor_approval: 'warning',
  approved_payment_required: 'warning',
  payment_pending: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'neutral',
  cancelled_by_customer: 'neutral',
  cancelled_by_vendor: 'neutral',
  declined_by_vendor: 'danger',
  expired: 'neutral',
  no_show: 'danger',
  refunded: 'neutral',
};

/** Coarse buckets used by dashboard filters. */
export type StatusBucket = 'pending' | 'awaiting_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export function bucketForLifecycle(s: BookingLifecycleStatus | string | null | undefined): StatusBucket {
  switch (s) {
    case 'pending_vendor_approval': return 'pending';
    case 'approved_payment_required':
    case 'payment_pending': return 'awaiting_payment';
    case 'confirmed': return 'confirmed';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    default: return 'cancelled';
  }
}

export {
  BLOCKING_LIFECYCLE_STATUSES,
  BLOCKING_LEGACY_STATUSES,
  bookingBlocksCalendar,
};
