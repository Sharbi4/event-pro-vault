// End-to-end booking flow tests using in-memory fakes for the Supabase
// `bookings` table, the Stripe checkout session API, and the Stripe webhook.
//
// Verifies:
//   1. createBooking (insert payload) populates master-calendar timing
//      fields for BOTH hourly and non-hourly packages.
//   2. The Stripe checkout session carries the booking_id + payment_type
//      metadata that the webhook will later read.
//   3. The webhook (deposit + final delivery) updates the booking record
//      without overwriting paid timestamps on retried events, and the
//      finalized record still has every master-calendar timing field set.

import { describe, it, expect } from 'vitest';
import { buildBookingInsert, type BookingRow } from './buildBookingInsert';
import { computeBookingPaymentUpdate } from './applyPaymentWebhook';

// --- In-memory bookings store -------------------------------------------------

function makeStore() {
  const rows = new Map<string, BookingRow>();
  let nextId = 1;
  return {
    insert(payload: Omit<BookingRow, 'id'>): BookingRow {
      const id = `bkg_${nextId++}`;
      const row: BookingRow = { ...payload, id };
      rows.set(id, row);
      return row;
    },
    update(id: string, patch: Partial<BookingRow>) {
      const row = rows.get(id);
      if (!row) throw new Error(`booking ${id} not found`);
      Object.assign(row, patch);
      return row;
    },
    get: (id: string) => rows.get(id)!,
  };
}

// --- Stripe fakes -------------------------------------------------------------

interface CheckoutSession {
  id: string;
  url: string;
  metadata: { booking_id: string; payment_type: 'deposit' | 'final' };
  payment_intent: string;
}

function fakeCreateCheckoutSession(opts: {
  bookingId: string;
  paymentType: 'deposit' | 'final';
}): CheckoutSession {
  return {
    id: `cs_${opts.bookingId}_${opts.paymentType}`,
    url: `https://checkout.stripe.test/${opts.bookingId}/${opts.paymentType}`,
    metadata: { booking_id: opts.bookingId, payment_type: opts.paymentType },
    payment_intent: `pi_${opts.bookingId}_${opts.paymentType}`,
  };
}

// Webhook handler — applies the pure update helper to the in-memory store.
function deliverPaymentSucceededWebhook(
  store: ReturnType<typeof makeStore>,
  session: CheckoutSession,
  now: Date,
) {
  const existing = store.get(session.metadata.booking_id);
  const update = computeBookingPaymentUpdate(
    session.metadata,
    session.payment_intent,
    existing,
    now,
  );
  return store.update(session.metadata.booking_id, update as Partial<BookingRow>);
}

// --- Tests --------------------------------------------------------------------

const CALENDAR_FIELDS = [
  'event_start_at',
  'event_end_at',
  'calendar_block_start',
  'calendar_block_end',
  'end_time',
  'duration_minutes',
] as const;

function expectCalendarFieldsPopulated(row: BookingRow) {
  for (const f of CALENDAR_FIELDS) {
    expect(row[f], `expected ${f} to be set`).toBeTruthy();
  }
  // sanity: end > start, calendar block envelopes the event
  const start = new Date(row.event_start_at!).getTime();
  const end = new Date(row.event_end_at!).getTime();
  const blockStart = new Date(row.calendar_block_start!).getTime();
  const blockEnd = new Date(row.calendar_block_end!).getTime();
  expect(end).toBeGreaterThan(start);
  expect(blockStart).toBeLessThanOrEqual(start);
  expect(blockEnd).toBeGreaterThanOrEqual(end);
}

describe('Booking flow e2e (Stripe stubbed)', () => {
  it('hourly booking: deposit → webhook confirms, calendar fields populated', () => {
    const store = makeStore();

    // 1. customer submits an hourly booking
    const inserted = store.insert(
      buildBookingInsert({
        user_id: 'user_1',
        vendor_id: 'vendor_1',
        vendor_user_id: 'vendor_user_1',
        package_id: 'pkg_hourly',
        event_date: '2026-08-12',
        event_location: '123 Main St',
        units: 1,
        total_price: 500,
        payment_method: 'stripe',
        booking_mode: 'INSTANT',
        start_time: '14:00',
        end_time: '17:00',
        setup_minutes: 30,
        breakdown_minutes: 30,
        customer_email: 'c@example.com',
      }),
    );

    // pre-payment state
    expect(inserted.status).toBe('confirmed');
    expect(inserted.payment_status).toBe('pending');
    expect(inserted.deposit_paid_at).toBeNull();
    expectCalendarFieldsPopulated(inserted);
    expect(inserted.end_time).toBe('17:00');
    expect(inserted.duration_minutes).toBe(60); // default; hourly callers usually pass duration but field stays valid

    // 2. checkout session created
    const session = fakeCreateCheckoutSession({
      bookingId: inserted.id,
      paymentType: 'deposit',
    });
    expect(session.metadata.booking_id).toBe(inserted.id);
    expect(session.url).toContain(inserted.id);

    // 3. Stripe webhook fires
    const now = new Date('2026-07-01T10:00:00Z');
    const final = deliverPaymentSucceededWebhook(store, session, now);

    expect(final.status).toBe('confirmed');
    expect(final.payment_status).toBe('paid');
    expect(final.deposit_paid_at).toBe(now.toISOString());
    expect(final.stripe_deposit_payment_intent_id).toBe(session.payment_intent);
    // Master-calendar fields survived the update.
    expectCalendarFieldsPopulated(final);
  });

  it('non-hourly catering booking: derives end_time + calendar block from duration', () => {
    const store = makeStore();

    const inserted = store.insert(
      buildBookingInsert({
        user_id: 'user_2',
        vendor_id: 'vendor_1',
        package_id: 'pkg_catering',
        event_date: '2026-09-04',
        event_location: '500 Oak Ave',
        units: 50,
        total_price: 2500,
        payment_method: 'stripe',
        booking_mode: 'INSTANT',
        start_time: '18:00',
        // no end_time → derived from duration_minutes
        duration_minutes: 180,
        setup_minutes: 60,
        breakdown_minutes: 45,
        customer_email: 'c2@example.com',
      }),
    );

    expectCalendarFieldsPopulated(inserted);
    expect(inserted.end_time).toBe('21:00:00');
    expect(new Date(inserted.event_end_at!).getTime() - new Date(inserted.event_start_at!).getTime())
      .toBe(180 * 60_000);
    // setup/breakdown buffers applied
    expect(new Date(inserted.event_start_at!).getTime() - new Date(inserted.calendar_block_start!).getTime())
      .toBe(60 * 60_000);
    expect(new Date(inserted.calendar_block_end!).getTime() - new Date(inserted.event_end_at!).getTime())
      .toBe(45 * 60_000);

    // Full deposit → final flow
    const deposit = fakeCreateCheckoutSession({ bookingId: inserted.id, paymentType: 'deposit' });
    const afterDeposit = deliverPaymentSucceededWebhook(store, deposit, new Date('2026-08-01T12:00:00Z'));
    expect(afterDeposit.status).toBe('confirmed');
    expect(afterDeposit.deposit_paid_at).toBeTruthy();

    const finalPmt = fakeCreateCheckoutSession({ bookingId: inserted.id, paymentType: 'final' });
    const afterFinal = deliverPaymentSucceededWebhook(store, finalPmt, new Date('2026-09-05T12:00:00Z'));
    expect(afterFinal.status).toBe('completed');
    expect(afterFinal.final_paid_at).toBeTruthy();
    expect(afterFinal.deposit_paid_at).toBe(afterDeposit.deposit_paid_at); // not overwritten
    expectCalendarFieldsPopulated(afterFinal);
  });

  it('pull-up flat-rate booking: minimal inputs still produce calendar fields', () => {
    const store = makeStore();

    const inserted = store.insert(
      buildBookingInsert({
        user_id: 'user_3',
        vendor_id: 'vendor_2',
        package_id: 'pkg_pullup',
        event_date: '2026-10-15',
        event_location: '99 Park',
        units: 1,
        total_price: 800,
        payment_method: 'stripe',
        booking_mode: 'INSTANT',
        start_time: '11:00',
        // no end_time, no duration → defaults to 60 min
      }),
    );

    expectCalendarFieldsPopulated(inserted);
    expect(inserted.duration_minutes).toBe(60);
    expect(inserted.end_time).toBe('12:00:00');
  });

  it('webhook is idempotent: retried delivery does not overwrite deposit_paid_at', () => {
    const store = makeStore();
    const inserted = store.insert(
      buildBookingInsert({
        user_id: 'user_4',
        vendor_id: 'vendor_1',
        package_id: 'pkg_hourly',
        event_date: '2026-08-12',
        event_location: '1 Test',
        units: 1,
        total_price: 200,
        start_time: '09:00',
        end_time: '10:00',
      }),
    );
    const session = fakeCreateCheckoutSession({ bookingId: inserted.id, paymentType: 'deposit' });

    const first = deliverPaymentSucceededWebhook(store, session, new Date('2026-07-01T10:00:00Z'));
    const firstPaidAt = first.deposit_paid_at;
    expect(firstPaidAt).toBeTruthy();

    const second = deliverPaymentSucceededWebhook(store, session, new Date('2026-07-01T10:05:00Z'));
    expect(second.deposit_paid_at).toBe(firstPaidAt);
    expectCalendarFieldsPopulated(second);
  });

  it('cash booking skips Stripe entirely but still has calendar fields', () => {
    const store = makeStore();
    const inserted = store.insert(
      buildBookingInsert({
        user_id: 'user_5',
        vendor_id: 'vendor_3',
        package_id: 'pkg_cash',
        event_date: '2026-11-20',
        event_location: 'Cash venue',
        units: 1,
        total_price: 400,
        payment_method: 'cash',
        booking_mode: 'INSTANT',
        start_time: '15:00',
        duration_minutes: 120,
        setup_minutes: 15,
        breakdown_minutes: 15,
      }),
    );
    expect(inserted.payment_method).toBe('cash');
    expect(inserted.payment_status).toBe('cash_due');
    expectCalendarFieldsPopulated(inserted);
    expect(inserted.duration_minutes).toBe(120);
  });
});
