/**
 * Booking visibility rules.
 *
 * An online (Stripe) Instant-Book booking should NOT appear in the customer's
 * "My Bookings" list or the Event Pro's inbox until the customer has actually
 * paid the required upfront amount. This prevents ghost bookings created by
 * customers who abandoned the Stripe Checkout session.
 *
 * Cash / pay-in-person bookings and Request-to-Book (REQUEST) bookings are
 * always visible — REQUEST bookings need to be visible so the vendor can
 * approve them before payment is collected, and cash bookings have no
 * upfront capture step.
 */

type BookingLike = {
  payment_method?: string | null;
  booking_mode?: string | null;
  payment_status?: string | null;
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const PAID_STATUSES = new Set([
  'paid',
  'deposit_paid',
  'partially_paid',
  'fully_paid',
  'cash_due', // vendor accepted, paying in cash
  'awaiting_approval', // REQUEST mode, waiting on vendor before payment
  'declined',
  'expired',
  'refunded',
]);

export function isBookingVisible(b: BookingLike): boolean {
  const method = (b.payment_method || 'stripe').toLowerCase();
  // Cash / in-person bookings always visible.
  if (method !== 'stripe') return true;

  const mode = (b.booking_mode || 'INSTANT').toUpperCase();
  // Request-to-Book bookings are visible while pending approval; payment
  // happens after the vendor approves.
  if (mode === 'REQUEST') return true;

  // Captured a payment? visible.
  if (b.deposit_paid_at || b.final_paid_at) return true;

  const status = (b.payment_status || '').toLowerCase();
  if (PAID_STATUSES.has(status)) return true;

  // Otherwise it's an unpaid Instant-Book online booking — hide it.
  return false;
}

export function filterVisibleBookings<T extends BookingLike>(rows: T[]): T[] {
  return rows.filter(isBookingVisible);
}
