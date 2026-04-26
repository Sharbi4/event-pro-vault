import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  calcVendorCommissionCents,
  getVendorCommissionPercent,
  isPremiumActive,
  VENDOR_COMMISSION_PERCENT_FREE,
  VENDOR_COMMISSION_PERCENT_PREMIUM,
} from "./commission.ts";

const NOW = new Date("2026-04-26T12:00:00Z");
const FUTURE = new Date("2026-12-31T00:00:00Z").toISOString();
const PAST = new Date("2026-01-01T00:00:00Z").toISOString();

Deno.test("free-tier vendor pays 12.9% commission", () => {
  const profile = { subscription_tier: "free", subscription_ends_at: null };
  assertEquals(isPremiumActive(profile, NOW), false);
  assertEquals(getVendorCommissionPercent(profile, NOW), VENDOR_COMMISSION_PERCENT_FREE);
});

Deno.test("active premium vendor pays 6% commission", () => {
  const profile = { subscription_tier: "premium", subscription_ends_at: FUTURE };
  assertEquals(isPremiumActive(profile, NOW), true);
  assertEquals(getVendorCommissionPercent(profile, NOW), VENDOR_COMMISSION_PERCENT_PREMIUM);
});

Deno.test("premium with no end date stays at 6% (lifetime/no expiry)", () => {
  const profile = { subscription_tier: "premium", subscription_ends_at: null };
  assertEquals(isPremiumActive(profile, NOW), true);
  assertEquals(getVendorCommissionPercent(profile, NOW), VENDOR_COMMISSION_PERCENT_PREMIUM);
});

Deno.test("EXPIRED premium subscription falls back to 12.9% commission", () => {
  const profile = { subscription_tier: "premium", subscription_ends_at: PAST };
  assertEquals(isPremiumActive(profile, NOW), false, "expired premium must not be considered active");
  assertEquals(
    getVendorCommissionPercent(profile, NOW),
    VENDOR_COMMISSION_PERCENT_FREE,
    "expired premium must fall back to free-tier 12.9%",
  );
});

Deno.test("expired premium: deposit charge uses 12.9% (not 6%)", () => {
  // $500 deposit
  const baseDepositCents = 50_000;
  const profile = { subscription_tier: "premium", subscription_ends_at: PAST };

  const commission = calcVendorCommissionCents(baseDepositCents, profile, NOW);
  // 12.9% of $500.00 = $64.50
  assertEquals(commission, 6_450);
  // Sanity: would have been $30.00 at 6%
  assertEquals(commission !== 3_000, true);
});

Deno.test("expired premium: final balance charge uses 12.9% (not 6%)", () => {
  // $1500 remaining balance
  const baseFinalCents = 150_000;
  const profile = { subscription_tier: "premium", subscription_ends_at: PAST };

  const commission = calcVendorCommissionCents(baseFinalCents, profile, NOW);
  // 12.9% of $1500.00 = $193.50
  assertEquals(commission, 19_350);
  assertEquals(commission !== 9_000, true); // would be $90 at 6%
});

Deno.test("premium subscription expiring exactly NOW is treated as expired", () => {
  const profile = {
    subscription_tier: "premium",
    subscription_ends_at: NOW.toISOString(),
  };
  // Logic uses `> now`, so equality is NOT active
  assertEquals(isPremiumActive(profile, NOW), false);
  assertEquals(getVendorCommissionPercent(profile, NOW), VENDOR_COMMISSION_PERCENT_FREE);
});

Deno.test("null/undefined profile defaults to free-tier 12.9%", () => {
  assertEquals(getVendorCommissionPercent(null, NOW), VENDOR_COMMISSION_PERCENT_FREE);
  assertEquals(getVendorCommissionPercent(undefined, NOW), VENDOR_COMMISSION_PERCENT_FREE);
});

Deno.test("deposit and final-balance commission rates stay consistent for same vendor", () => {
  // Critical invariant: whatever rate applies at deposit time should apply
  // to the final balance for the same expired-premium vendor.
  const profile = { subscription_tier: "premium", subscription_ends_at: PAST };
  const depositPct = getVendorCommissionPercent(profile, NOW);
  const finalPct = getVendorCommissionPercent(profile, NOW);
  assertEquals(depositPct, finalPct);
  assertEquals(depositPct, VENDOR_COMMISSION_PERCENT_FREE);
});
