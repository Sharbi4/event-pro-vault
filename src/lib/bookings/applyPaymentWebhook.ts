// Pure helper that mirrors the booking-update branch of `stripe-webhook`
// (payment_intent.succeeded → bookings table). Extracted so it can be
// exercised in tests without Deno / Stripe.
//
// Mirrors supabase/functions/stripe-webhook/index.ts (regular bookings block).

export interface WebhookMetadata {
  booking_id: string;
  payment_type?: 'deposit' | 'final' | string;
}

export interface ExistingBookingPaidState {
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
  status?: string | null;
}

export interface BookingPaymentUpdate {
  payment_status: 'paid';
  updated_at: string;
  status: 'confirmed' | 'completed';
  deposit_paid_at?: string;
  final_paid_at?: string;
  stripe_deposit_payment_intent_id?: string;
  stripe_final_payment_intent_id?: string;
  stripe_payment_intent_id?: string;
}

export function computeBookingPaymentUpdate(
  metadata: WebhookMetadata,
  paymentIntentId: string,
  existing: ExistingBookingPaidState | null,
  now: Date = new Date(),
): BookingPaymentUpdate {
  const nowIso = now.toISOString();
  const update: BookingPaymentUpdate = {
    payment_status: 'paid',
    updated_at: nowIso,
    status: 'confirmed',
  };

  if (metadata.payment_type === 'deposit') {
    if (!existing?.deposit_paid_at) update.deposit_paid_at = nowIso;
    update.stripe_deposit_payment_intent_id = paymentIntentId;
    update.status = 'confirmed';
  } else if (metadata.payment_type === 'final') {
    if (!existing?.final_paid_at) update.final_paid_at = nowIso;
    update.stripe_final_payment_intent_id = paymentIntentId;
    update.status = 'completed';
  } else {
    update.stripe_payment_intent_id = paymentIntentId;
    update.status = 'confirmed';
  }

  return update;
}
