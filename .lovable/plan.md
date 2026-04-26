# Create Package Flow — Pull-Up vs Catering

Restructure the existing 7-step package wizard so vendors first choose a package type (Pull-Up Booking or Catering Package), then see fields and pricing models tailored to that type. Add Private Package education, smarter time/calendar logic, customer questions, and a duplicate action.

## New step order

```
1. Package Type     ← NEW first step
2. Basics
3. Pricing          (cards change per type)
4. Time & Calendar  (adds setup/cleanup/buffers visualization)
5. Photos & Details
6. Booking Rules    (adds customer questions)
7. Review & Publish
```

## Step-by-step changes

**Step 1 — Package Type (new)**
Two big cards: Pull-Up Booking, Catering Package. Education note below cards: "Need to build something custom for a customer? You'll be able to create Private Packages from your message threads." Selection drives the rest of the wizard.

**Step 2 — Basics**
Add: cuisine/style multi-select, Best For multi-select (apartment event, office lunch, wedding, etc.), guest-count range. Keep name/description/category. Show smart name suggestions chips based on the vendor's category.

**Step 3 — Pricing (type-driven)**
- Pull-Up: 4 cards — Show-up fee, Minimum guarantee, Show-up + minimum, No upfront fee.
- Catering: 3 cards — Flat package price, Per-person, Base + per-person.
- Both: deposit block (None / % / Flat / Full upfront) and balance-due timing (Before / Day-of / After / Direct to vendor).

**Step 4 — Time & Calendar**
Fields: service duration, setup, cleanup, buffer before, buffer after, minimum notice (with "Use calendar default"), and a per-package availability override toggle. Add a visual showing "Customer sees X–Y / Your calendar blocks A–B" computed live.

**Step 5 — Photos & Details**
Require ≥1 photo (already supported). Keep What's Included, Add-Ons. Add menu items list and dietary options.

**Step 6 — Booking Rules**
Default to "Review requests first" (was Instant). Cancellation policy (Flexible/Moderate/Strict). Travel radius/fee/max. Customer questions multi-select drawn from a category-aware library (general, bartender, baker).

**Step 7 — Review & Publish**
Tweak the existing PackagePreview to reflect the new fields. Buttons: Save as Draft, Publish Package. If profile is unpublished, show "Save package and continue profile setup."

## Vendor package dashboard

Each package card gains a Duplicate action (clones the row with name " (Copy)" and status `draft`). Status chips: draft / published / paused / archived already supported via `is_active` plus a new `status` field.

## Database changes

Add columns to `vendor_packages`:
- `package_kind text` — `pull_up` or `catering`
- `pull_up_pricing_model text` — `show_up_fee | min_guarantee | show_up_plus_min | no_upfront`
- `catering_pricing_model text` — `flat | per_person | base_plus_per_person`
- `min_guarantee_amount integer`
- `included_guests integer`
- `additional_per_person integer`
- `cuisine_styles text[]`
- `best_for text[]`
- `setup_minutes integer default 0`
- `cleanup_minutes integer default 0`
- `buffer_before_minutes integer default 0`
- `buffer_after_minutes integer default 0`
- `minimum_notice_hours integer` (null = use calendar default)
- `balance_due_timing text`
- `menu_items jsonb default '[]'`
- `dietary_options text[]`
- `customer_questions text[]`
- `status text default 'draft'` (draft/published/paused/archived)

Existing booking flow continues to read `price`, `pricing_type`, `deposit_percentage`, etc.; new fields are additive and backward-compatible.

## Files to add/edit

New:
- `src/components/vendor-dashboard/package-form/StepPackageType.tsx`
- `src/components/vendor-dashboard/package-form/PullUpPricingCards.tsx`
- `src/components/vendor-dashboard/package-form/CateringPricingCards.tsx`
- `src/components/vendor-dashboard/package-form/CalendarBlockPreview.tsx`
- `src/components/vendor-dashboard/package-form/CustomerQuestionsPicker.tsx`

Edit:
- `PackageFormWizard.tsx` — insert type step at index 0, gate visible steps by type, update STEPS array, default `booking_mode` to `REQUEST`.
- `StepBasicInfo.tsx` — add cuisine/best-for/guest-range, smart name chips.
- `StepPricingTravel.tsx` — split into pricing-only; render the type-specific cards. Keep travel fields on Booking Rules step.
- `StepInclusions.tsx` — add menu items + dietary options.
- `StepAvailability.tsx` → `StepTimeCalendar.tsx` — add setup/cleanup/buffers + live calendar-block preview.
- `StepBookingPayment.tsx` — rename to Booking Rules; add customer questions; default to Request.
- `PackagePreview.tsx` — render new fields.
- `useVendorDashboard.ts` — extend `VendorPackage` type, add `duplicatePackage()`.
- Vendor packages list view — add Duplicate button.

Single migration adds the columns above with safe defaults so existing packages keep working.

## Acceptance criteria

- First step forces a Pull-Up vs Catering choice; no Quote Request option.
- Pricing UI swaps based on chosen type.
- Time step shows a live "customer sees vs calendar blocks" visualization.
- Default booking mode is Request, with Instant as opt-in.
- Customer questions persist on the package and surface to customers at booking.
- Vendors can save a draft, publish, pause, archive, or duplicate any package.
- Existing packages continue to load and remain bookable without re-editing.
