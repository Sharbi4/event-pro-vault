# StyleSeat-style booking flow for EventPro

Restructure search, vendor results, and the customer bookings dashboard around the question: **"What do you need, where, when, for how many?"** — and make the booking lifecycle explicit (pending → approved → confirmed → in progress → completed / cancelled), with cancellation rules driven by the package policy and event time.

The current app already has most of the data plumbing (date/time/category/location filtering in `useBrowsePackages`, booking statuses in the DB, package cancellation policies, deposits). What's missing is: a **time** field in the homepage search, **vendor-grouped** results with package previews, an explicit **status-tab bookings page** with state-aware cards, and a **booking detail page**. Reminders mostly exist server-side; we'll round out the schedule.

---

## 1. Homepage search — add Time, rename CTA

Update `src/components/home/HeroSection.tsx`:
- Add a **Time** field next to Date (start time only, default "Any time"; selecting a time auto-sets a 3-hour window for filtering).
- Reorder fields to: **Vendor Type · Location · Date · Time · Guests · Cuisine**.
- Rename the search button label to **"Find available vendors"** (keep icon on mobile).
- Pass `time` through to `/browse` as `start` / `end` URL params (already supported by the hook).

No new dependencies — `useBrowsePackages` already handles `startTime`/`endTime`.

## 2. Browse results — vendor-grouped cards

Today `/browse` lists packages individually. Switch the default grid to a **vendor-grouped card** that surfaces the top 2–3 packages matching the search.

- New component `src/components/browse/BrowseVendorCard.tsx` showing:
  - Vendor cover image, business name, category, cuisine, city
  - Rating + review count, Verified / Available badges
  - "Available {date} at {time}" pill when date/time filters are set
  - Up to 3 package previews (name · duration · "from $X")
  - CTA **View availability** → vendor profile (`/eventpro/{username}`)
- New helper `src/lib/groupPackagesByVendor.ts` to roll the existing `BrowsePackage[]` into vendors with their top-N matching packages (sorted by price asc, instant-book first).
- Add a view toggle in `Browse.tsx`: **Vendors (default) · Packages · Map**. Keep existing `BrowsePackageCard` for the Packages view.

When zero exact matches exist for the date/time, show a **Flexible alternatives** strip (already partially handled by `FlexibleDatesSection`) inline above results: "Available later that day · day before · day after · this weekend".

## 3. Vendor profile — availability-aware package picker

Light edits to `src/pages/ProProfile.tsx`:
- Add an **Available dates & times** strip near the top (reads from `package_weekly_availability` + `package_availability` blocked dates; reuse logic from `useBrowsePackages`).
- Each package card grows a **Book this package** CTA that routes into the existing checkout drawer (`SpatialDrawer`) pre-filled with the vendor + package + the date/time/guest count carried over from search params.

No checkout-flow changes; we just deep-link with state.

## 4. Customer Bookings dashboard — status tabs + state-aware cards

Refactor the Bookings tab inside `src/pages/Dashboard.tsx` into a dedicated section with sub-tabs: **Pending · Upcoming · Past · Cancelled**.

New helper `src/lib/bookingState.ts` derives a UI state from the booking record:

```ts
type BookingUiState =
  | 'pending_vendor'        // status='pending'
  | 'awaiting_payment'      // status='awaiting_payment' or approved & unpaid
  | 'confirmed_cancellable' // confirmed, cancel window open
  | 'confirmed_locked'      // confirmed, cancel window closed
  | 'in_progress'           // now between event start & end
  | 'completed'             // event end passed
  | 'cancelled'             // status='cancelled' / 'declined'
```

Cancellation window math reuses the package's `cancellation_policy` (Flexible / Standard / Strict — already defined in project knowledge): full-refund cutoff and event start are the gates. Once `now >= event_start`, the cancel button is hidden.

New component `src/components/dashboard/BookingCard.tsx` renders one of seven layouts based on `BookingUiState`, with the exact copy and actions from the spec:

| State | Primary actions | Secondary |
|---|---|---|
| Pending vendor | Cancel request | Message vendor |
| Awaiting payment | Pay now | Message vendor |
| Confirmed (cancellable) | View details, Cancel | Message vendor |
| Confirmed (locked) | View details | Message vendor (cancel disabled w/ reason tooltip) |
| In progress | View details | Message vendor |
| Completed | Leave review, Book again | View receipt |
| Cancelled | Book again | View details |

Tab routing rules:
- **Pending** = `pending_vendor` + `awaiting_payment`
- **Upcoming** = `confirmed_cancellable` + `confirmed_locked` + `in_progress`
- **Past** = `completed`
- **Cancelled** = `cancelled`

Each card opens the booking detail page on tap.

## 5. Booking detail page

New route `/bookings/:id` → `src/pages/BookingDetail.tsx` showing: status banner, vendor block, date/time/location, package + add-ons + what's included, guest count, totals (deposit paid, balance due, refund status if cancelled), cancellation policy summary, **reminder timeline** (visualized list of upcoming reminder events), embedded message thread link, and receipt download. Wire into `App.tsx`.

## 6. Reminders — fill in the schedule

The codebase already has `send-booking-reminders` and `send-booking-confirmation` edge functions and a `payment_reminders` table. Two small changes:
- Extend the reminder schedule to: confirmation, **7d**, **48h**, **24h**, **morning-of**, **post-event review request** for the customer; same plus **new request** + **mark complete / payout info** for the vendor.
- Add an `email_kind` enum value per reminder so we don't double-send (track in `payment_reminders` or a new lightweight `booking_reminders` table — decide during implementation; the existing table already has `reminder_type`).
- Cron stays the same; the function just iterates more windows.

No SMS work in this pass.

## 7. Cancellation enforcement

- Server: tighten `cancel-booking` edge function (already exists) to reject when `now >= event_start_at` or when the cancellation window per policy has passed; return refund amount based on the policy bucket.
- Client: `BookingCard` and detail page hide / disable the cancel button using the same rules (so UI matches the API).

---

## Out of scope for this pass

- Vendor-side dashboard refactor (kept as-is; only customer side is restructured).
- New custom cancellation policies — we stick with the three existing templates.
- SMS reminders.
- Vendor approve/decline UI changes (already exists in Vendor Dashboard).

---

## Files added

- `src/components/browse/BrowseVendorCard.tsx`
- `src/lib/groupPackagesByVendor.ts`
- `src/lib/bookingState.ts`
- `src/components/dashboard/BookingCard.tsx`
- `src/pages/BookingDetail.tsx`

## Files edited

- `src/components/home/HeroSection.tsx` — Time field, reorder, rename CTA
- `src/pages/Browse.tsx` — Vendors / Packages / Map toggle, vendor-grouped grid
- `src/pages/ProProfile.tsx` — Available dates strip, Book CTA deep-link
- `src/pages/Dashboard.tsx` — Status sub-tabs inside Bookings, render `BookingCard`
- `src/App.tsx` — `/bookings/:id` route
- `supabase/functions/send-booking-reminders/index.ts` — extended schedule
- `supabase/functions/cancel-booking/index.ts` — strict window + event-time guard
