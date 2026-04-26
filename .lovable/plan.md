# Replace Quote Requests with Private Packages

Move all custom-order conversations into a structured, on-platform flow. Vendors create a **Private Package** inside a customer message thread; customer reviews and pays on EventPro. No more "Request a Quote" CTAs sending people offline.

## Three booking types (final)

| Type | Where it lives | Who creates it |
|---|---|---|
| **Pull-Up Booking** | Public package on vendor profile | Vendor (public listing) |
| **Catering Package** | Public package on vendor profile | Vendor (public listing) |
| **Private Package** | Inside a message thread, one-to-one | Vendor, after customer inquiry |

"Quote Request" is removed everywhere as a public CTA. Customers who need something custom get **"Ask about a private package"** which opens the messaging thread.

## Customer flow for custom orders

```text
Customer views vendor profile
        │
        ▼
"Ask about a private package"  ──►  Message thread opens
        │
        ▼
Customer sends event details
        │
        ▼
Vendor replies → clicks "Create Private Package" in thread
        │
        ▼
Vendor fills form, sends → appears as a booking card in the thread
        │
        ▼
Customer reviews → "Review & Book" → Stripe checkout
        │
        ▼
Booking lands in both dashboards (status: paid → booked)
```

## Database changes

**New table `private_packages`** with all fields from the spec:
package_name, description, event_date, start_time, end_time, location, guest_count, category, included_items (text[]), menu_details, service_duration, setup_time, base_price, per_person_price, add_ons (jsonb), travel_fee, deposit_amount, total_price, offer_expires_at, cancellation_policy, vendor_notes, customer_notes, status, plus vendor_user_id, customer_user_id, conversation_id, booking_id (nullable, set when paid).

**Status values:** `draft` · `sent` · `viewed` · `accepted` · `paid` · `booked` · `expired` · `cancelled`

**RLS:** Vendor and the specific customer in the thread can read/update; only the vendor can create; only the customer can accept; system updates status on payment via Stripe webhook.

**Booking type field:** Add `booking_type text` to `bookings` (`pull_up` · `catering` · `private_package`) with default `catering`. Backfill existing rows from `vendor_packages.category`/booking_mode. We keep the existing `booking_mode` column (INSTANT/REQUEST) — it's a separate concept (auto-confirm vs vendor-approval) and still useful for public packages.

**Messages:** Add `attached_private_package_id uuid` to `messages` so the package card renders inline.

## Code changes

### Remove "Quote Request" surfaces
- `RequestQuoteModal.tsx` — repurpose as **AskPrivatePackageModal** (opens/creates a conversation, sends an initial message with event brief)
- `NoMatchesEmptyState.tsx` — change CTA to "Message a vendor"
- `VendorProfile.tsx` (line 424–432) — replace "Request Custom Quote" with "Ask about a private package"
- `LearnEventPros.tsx`, `HowItWorks.tsx` (home + page), `useMessageTemplates.ts` — copy updates
- Package wizard `StepPricingTravel.tsx` / `PackageFormWizard.tsx` — remove the `custom_quote` pricing type. Public packages must have a price.
- `BookingModal.tsx` — drop `custom_quote` branches.
- `PackagePreview.tsx` — drop "Request a Quote" preview state.

### New: Private Package system
- **Vendor side (in messages)** — `CreatePrivatePackageDrawer.tsx` opened by a "Create Private Package" button in the thread header. Form covers all fields above. Save as draft or send.
- **Message thread renderer** — when `attached_private_package_id` is set, render `PrivatePackageCard` (name, date/time, location, guests, total, deposit, includes, "Review & Book").
- **Customer side (in messages)** — "Ask about a private package" button on thread header (also surfaced on vendor profile).
- **Review & Book page** — `/private-package/:id` shows full details, calls existing `create-booking-checkout` edge function with `booking_type='private_package'`.
- **Vendor dashboard** — new "Private Packages" tab listing Drafts / Sent / Accepted / Paid / Expired with quick actions (resend, cancel, duplicate).
- **Customer dashboard** — Private Package offers section under Bookings (Pending offers / Accepted / Expired).

### Edge function updates
- `create-booking-checkout` — accept `private_package_id`, derive amount/deposit from the private package row, set `booking_type='private_package'`.
- `stripe-webhook` — on successful payment for a private-package booking, set private_packages.status to `paid` then `booked`.
- Daily expiry job (cron) — flip `sent`/`viewed` → `expired` after `offer_expires_at`.

### Profile package section
Order: **Pull-Up Bookings** → **Catering Packages** → "Need something custom?" CTA → **Ask about a private package**.

## Acceptance criteria

- No "Request a Quote" / "Custom Quote" copy or CTA anywhere public.
- Vendor can create + send a Private Package from inside a message thread.
- Customer sees the private package as a card in messages and can pay through Stripe.
- Paid private packages appear in both dashboards with `booking_type=private_package`.
- Existing public packages still work; `booking_mode` (INSTANT/REQUEST) preserved.

## Out of scope (flag for later)

- Counter-offers (customer editing the package). For v1 the customer accepts as-sent or asks for a revised one.
- Vendor-initiated private packages without a prior customer inquiry.
- Migrating any existing `custom_quote` packages — there are none in production data; we'll just disallow the type going forward.
