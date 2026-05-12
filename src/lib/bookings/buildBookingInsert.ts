// Pure helper that builds the row inserted into `bookings`. Mirrors the
// `useBookings.createBooking` insert payload so the same business logic
// (timing, status, payment_status defaults) can be exercised in tests
// without spinning up Supabase.

import { computeBookingTiming } from './computeBookingTiming';

export interface BuildBookingInsertInput {
  user_id: string | null;
  vendor_id: string;
  vendor_user_id?: string | null;
  package_id: string;
  event_date: string;
  event_location: string;
  units: number;
  add_ons?: string[];
  total_price: number;
  notes?: string | null;
  payment_method?: 'stripe' | 'cash';
  booking_mode?: 'INSTANT' | 'REQUEST';
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  setup_minutes?: number | null;
  breakdown_minutes?: number | null;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  event_timezone?: string | null;
}

export function buildBookingInsert(input: BuildBookingInsertInput) {
  const timing = computeBookingTiming({
    event_date: input.event_date,
    start_time: input.start_time,
    end_time: input.end_time,
    duration_minutes: input.duration_minutes ?? undefined,
    setup_minutes: input.setup_minutes ?? undefined,
    breakdown_minutes: input.breakdown_minutes ?? undefined,
  });

  const paymentMethod = input.payment_method || 'stripe';
  const bookingMode = input.booking_mode || 'INSTANT';
  const status = bookingMode === 'REQUEST' ? 'pending' : 'confirmed';
  const payment_status =
    bookingMode === 'REQUEST'
      ? 'awaiting_approval'
      : paymentMethod === 'cash'
      ? 'cash_due'
      : 'pending';

  return {
    user_id: input.user_id,
    vendor_id: input.vendor_id,
    vendor_user_id: input.vendor_user_id ?? null,
    package_id: input.package_id,
    event_date: input.event_date,
    event_location: input.event_location,
    units: input.units,
    add_ons: input.add_ons ?? [],
    total_price: input.total_price,
    notes: input.notes ?? null,
    payment_method: paymentMethod,
    booking_mode: bookingMode,
    status,
    payment_status,
    customer_email: input.customer_email ?? null,
    customer_name: input.customer_name ?? null,
    customer_phone: input.customer_phone ?? null,
    start_time: input.start_time ?? null,
    end_time: timing.end_time,
    duration_minutes: timing.duration_minutes,
    setup_minutes: timing.setup_minutes,
    breakdown_minutes: timing.breakdown_minutes,
    event_start_at: timing.event_start_at,
    event_end_at: timing.event_end_at,
    calendar_block_start: timing.calendar_block_start,
    calendar_block_end: timing.calendar_block_end,
    deposit_paid_at: null as string | null,
    final_paid_at: null as string | null,
    stripe_deposit_payment_intent_id: null as string | null,
    stripe_final_payment_intent_id: null as string | null,
    stripe_payment_intent_id: null as string | null,
  };
}

export type BookingRow = ReturnType<typeof buildBookingInsert> & { id: string };
