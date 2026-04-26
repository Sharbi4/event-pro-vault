# Optional Identity Verification — Trust Upgrade Model

Today, the public RLS policy for vendor profiles requires both `stripe_account_status = 'active'` AND `approval_status = 'approved'`. That makes Stripe Connect a hard gate for visibility, and identity verification is conflated into the same trust wall. We'll separate the two and reframe identity verification as an optional badge.

## Core rule changes

- **Stripe Identity** → optional. Never blocks publish, packages, bookings, messaging, payouts, or search visibility. Only controls the "Verified Event Pro" badge + filter + ranking boost.
- **Stripe Connect / payout setup** → required only when a package uses online payment. Vendors offering only cash / in-person packages can publish and accept bookings without Connect.
- **Admin approval** (`approval_status`) → still required to appear in public search (anti-spam).

## Onboarding stepper (vendor)

Reorder `src/pages/VendorOnboarding.tsx` and the `eventpro-onboarding` step components to:

1. Business Basics
2. Contact & Location
3. Service Details
4. Photos
5. Packages
6. Calendar
7. **Payments** (Stripe Connect — skippable if vendor offers cash-only)
8. **Optional Verification** (Stripe Identity — fully skippable, secondary CTA "Skip for now")
9. Review & Publish

Step 7 copy: "Set up payouts — Connect your payout account so you can receive online payments."
Step 8 copy: "Get verified — Verification is optional, but it helps customers book with confidence."

Publish CTA on Step 9 is enabled when required fields are complete (business name, category, phone, address, service area, profile photo, cover image, ≥1 published package, calendar availability). Identity verification is **not** in that checklist.

## Database changes (migration)

Add to `profiles`:
- `is_identity_verified boolean default false` (derived convenience flag, kept in sync)
- `identity_verified_at timestamptz`
- `trust_score integer default 0` (computed: base + verified bonus + rating bonus)
- `online_payments_enabled boolean default true` (vendor toggle for whether their packages use Connect)

Update RLS policy `Public can view approved vendor profiles` on `profiles`:
```
((is_vendor = true) AND (approval_status = 'approved'))
OR (auth.uid() = user_id)
```
(Drops the `stripe_account_status = 'active'` requirement — Connect is enforced at checkout time, not at visibility time.)

Add similar relaxation to public `vendor_packages` visibility if it has the same gate (verify in migration).

## UI: Verified badge

New shared component `src/components/badges/VerifiedEventProBadge.tsx` (small + large variants):
- Small: pill "Verified" with shield icon — used on `BrowseVendorCard`, `BrowsePackageCard`, `VendorListItem`, search results
- Large: "Verified Event Pro" with tooltip "This Event Pro completed optional identity verification through EventPro." — used on public profile header

Wire into existing `TrustBadges.tsx` `isVerified` prop (already plumbed) — verify all consumers pass `identity_verification_status === 'verified'`.

## Vendor dashboard verification card

New component `src/components/vendor-dashboard/VerificationCard.tsx`, shown in the Settings tab below `StripeSetupCard`:

- **Not verified**: Title "Get the Verified Event Pro badge", body copy, primary "Get verified" → triggers Stripe Identity session, secondary "Maybe later" (dismiss for session).
- **Processing**: "Verification in progress" with status pill.
- **Verified**: Title "Verified Event Pro", body "Your profile has the Verified badge…", green check.
- **Failed / requires_action**: Show retry CTA.

## Search filter + ranking

- Add "Verified only" toggle to `SearchModal.tsx` filters; pipe through `useBrowsePackages` query as `.eq('profiles.identity_verification_status', 'verified')` when active.
- In `useBrowsePackages` ranking sort, add a small boost (e.g. +10 points) for verified vendors so they trend higher when scores tie.

## Payments gating (online vs cash)

In `SpatialDrawer.tsx` checkout flow, when the selected package's `payment_mode` requires online payment AND the vendor's `stripe_account_status !== 'active'`:
- Block checkout with message "This Event Pro hasn't finished setting up online payments yet — reach out to message them directly."
- Cash-only packages skip this check entirely.

## Acceptance criteria

- A vendor with `identity_verification_status = 'not_started'` can complete onboarding, publish, get bookings, and receive payouts (if Connect is set up).
- A cash-only vendor with no Stripe Connect can publish and appear in search.
- The "Verified Event Pro" badge only appears when `identity_verification_status === 'verified'`.
- "Verified only" filter in search returns only verified vendors.
- Onboarding step order matches the 9-step list above; Step 8 has a working "Skip for now".
- Existing verified vendors retain their badge (no data backfill needed beyond the new derived flag).

## Files touched

**Migration**: new file under `supabase/migrations/` for the column adds + RLS policy update.

**New**: `src/components/badges/VerifiedEventProBadge.tsx`, `src/components/vendor-dashboard/VerificationCard.tsx`.

**Edited**: `src/pages/VendorOnboarding.tsx`, `src/components/eventpro-onboarding/StepPayout.tsx` (+ new `StepVerification.tsx`), `src/pages/VendorDashboard.tsx`, `src/hooks/useVendorProfile.ts`, `src/hooks/useBrowsePackages.ts`, `src/components/browse/SearchModal.tsx`, `src/components/booking/SpatialDrawer.tsx`, `src/components/badges/TrustBadges.tsx`, public profile page (vendor header).

Approve and I'll implement in this order: migration → onboarding reorder → badge component → dashboard card → search filter/ranking → checkout gating.