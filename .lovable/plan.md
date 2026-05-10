# Booking Options & Listing Detail — Implementation Plan

Goal: customers can fully configure a package (variation, fulfillment style, add-ons, menu items) before paying, and the listing page shows the full package detail upfront.

---

## 1. Schema changes (Lovable Cloud)

### New table: `package_variations`
Parent-child to `vendor_packages` so one package can offer Bronze/Silver/Gold etc.

Columns:
- `id` uuid pk
- `package_id` uuid (FK to vendor_packages.id)
- `user_id` uuid (vendor; for RLS)
- `name` text (e.g. "Silver Tier")
- `description` text
- `price` numeric — replaces base price when selected
- `min_guests` / `max_guests` int (optional, per-tier capacity)
- `duration_minutes` int (optional override)
- `includes` text[] (tier-specific inclusions)
- `is_default` bool
- `sort_order` int
- timestamps

RLS:
- Public SELECT (listings need them)
- Vendors INSERT/UPDATE/DELETE where `auth.uid() = user_id`

### New column on `vendor_packages`
- `fulfillment_options` text[] default `'{}'` — e.g. `{on_site, delivery, pickup}`. Empty array = single implicit style.
- `fulfillment_pricing` jsonb default `'{}'` — optional surcharge map: `{ delivery: 25, pickup: -10 }`.

### New columns on `bookings`
Persist customer selections:
- `selected_variation_id` uuid (nullable)
- `fulfillment_type` text (nullable)
- `selected_add_ons` jsonb default `'[]'` — array of `{name, price, qty}`
- `selected_menu_items` jsonb default `'[]'` — array of `{name, qty, price}`

(Existing `add_ons text[]` stays for backward compat but UI writes to `selected_add_ons`.)

---

## 2. Vendor side (out of scope this round)
The wizard already collects `add_ons`, `menu_items`, `customer_questions`. Variations and fulfillment_options will just be readable fields for now — adding wizard UI for them is a follow-up. (Confirm if you want me to extend the wizard in this round.)

---

## 3. Listing page — full detail

Edit `src/components/package-detail/PackageDetails.tsx` (and/or new sub-sections) so the package detail page shows:

1. **Variations** — card row, each showing name, price, includes, capacity.
2. **Fulfillment options** — chips with icon + label + surcharge.
3. **Add-ons** — list with price, "+ Add to booking" hint.
4. **Menu items** — grid grouped by section if present.
5. **Inclusions, requirements, customer questions, setup/breakdown, cancellation policy, deposit terms** — already partially shown; ensure all visible.

All sections collapse gracefully if empty.

---

## 4. Booking flow — interactive selection

Edit `src/components/package-detail/BookingModal.tsx` (the spatial drawer steps).

Add new step(s) before the existing review/payment step:

**Step: Configure**
- If variations exist → required radio picker (default = `is_default` or first).
- If `fulfillment_options.length > 1` → required radio picker.
- If `add_ons` non-empty → toggle list with qty stepper for each.
- If `menu_items` non-empty (catering/food) → quantity picker per item, respecting `min_quantity` if set.
- If `customer_questions` non-empty → text inputs per question (stored in `notes` jsonb-encoded).

**Live price summary** updates as user toggles:
- base = variation price (or package base)
- + sum(add_on.price * qty)
- + sum(menu_item.price * qty)
- + fulfillment surcharge
- + travel fee (existing)

**Review step** lists every selected line item before payment.

On submit, write selections to the new `bookings` columns.

---

## 5. Files to touch

- `supabase/migrations/...` (new) — schema above
- `src/hooks/usePackageDetail.ts` (or equivalent fetch hook) — join `package_variations`
- `src/components/package-detail/PackageDetails.tsx` — render new sections
- `src/components/package-detail/BookingModal.tsx` — new Configure step + price math
- `src/components/package-detail/StickyBookingCard.tsx` / `MobileBookingBar.tsx` — show "from $X" if variations exist
- Types regenerate automatically after migration

---

## 6. Out of scope (flag for follow-up)
- Vendor wizard UI for creating variations and fulfillment options (data is readable; creation today would need direct DB or a small admin add)
- Per-fulfillment travel logic
- Menu sections/categories beyond a flat list

Confirm and I'll run the migration, then wire up the listing + booking changes.
