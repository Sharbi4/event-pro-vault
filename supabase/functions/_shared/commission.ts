// Shared commission calculation logic used by create-booking-checkout
// and charge-final-payment. Keeping this in one place ensures deposit and
// final-balance charges always agree on the vendor commission rate.

export const VENDOR_COMMISSION_PERCENT_FREE = 12.9;
export const VENDOR_COMMISSION_PERCENT_PREMIUM = 6;

export interface VendorTierProfile {
  subscription_tier?: string | null;
  subscription_ends_at?: string | null;
}

/**
 * Returns true only when the vendor is on the premium tier AND the
 * subscription has not expired. An expired premium subscription falls
 * back to the free-tier rate.
 */
export function isPremiumActive(
  profile: VendorTierProfile | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!profile) return false;
  if (profile.subscription_tier !== 'premium') return false;
  if (!profile.subscription_ends_at) return true;
  return new Date(profile.subscription_ends_at) > now;
}

export function getVendorCommissionPercent(
  profile: VendorTierProfile | null | undefined,
  now: Date = new Date(),
): number {
  return isPremiumActive(profile, now)
    ? VENDOR_COMMISSION_PERCENT_PREMIUM
    : VENDOR_COMMISSION_PERCENT_FREE;
}

export function calcVendorCommissionCents(
  baseAmountCents: number,
  profile: VendorTierProfile | null | undefined,
  now: Date = new Date(),
): number {
  const pct = getVendorCommissionPercent(profile, now);
  return Math.round(baseAmountCents * (pct / 100));
}
