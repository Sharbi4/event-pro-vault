## Goal

Make the vendor calendar the **single source of truth** for availability. Every package, private package, and booking checks the same vendor master calendar. Bookings carry a `calendar_block_*` window (event time + setup + cleanup + buffer) so overlap prevention is exact. Holds prevent double-booking during checkout/approval.

This is large. I'll deliver it in **3 phases** so each phase is shippable and testable on its own. You approve once; I'll execute all three in order.

---

## Phase 0 — What's already there (no rebuild)

- `vendor_availability` (blocked dates, full-day) ✅
- `package_weekly_availability` (per-package weekly hours) — will be **migrated** to vendor-level
- `vendor_buffer_settings` (default buffers, by-request flag) ✅
- `vendor_packages` already has `duration_minutes`, `setup_time_minutes`, `breakdown_time_minutes`, `instant_book`, `booking_mode` ✅
- `bookings` has `start_time`, `end_time`, `setup_minutes`, `breakdown_minutes` ✅
- `private_packages` ✅
- `useVendorAvailability` hook already cross-checks vendor-wide bookings ✅

---

## Phase 1 — Schema upgrades (migration)

**New tables**
- `vendor_weekly_availability` — vendor-level master weekly hours, supports multiple windows/day.
  Cols: `id, user_id, day_of_week (0–6), start_time, end_time, is_enabled, created_at, updated_at`. Unique on `(user_id, day_of_week, start_time)`.
- `vendor_blocked_times` — partial-day blocks (vendor_availability is full-day only today). Cols: `id, user_id, block_start timestamptz, block_end timestamptz, reason, is_full_day, created_at, updated_at`. Index on `(user_id, block_start, block_end)`.
- `calendar_holds` — temporary holds during checkout / pending vendor approval. Cols: `id, vendor_user_id, customer_user_id, package_id, booking_id, hold_start timestamptz, hold_end timestamptz, status text ('active'|'converted'|'released'|'expired'), expires_at timestamptz, source text ('checkout'|'vendor_approval'|'private_package'), created_at, updated_at`. Indexes on `(vendor_user_id, status, hold_start, hold_end)`, `(expires_at) where status='active'`. RLS: customer reads own; vendor reads own; insert/update via service role + own-user policies.

**Column additions**
- `bookings`: add `calendar_block_start timestamptz`, `calendar_block_end timestamptz`, `event_start_at timestamptz`, `event_end_at timestamptz`, `event_timezone text default 'America/New_York'`, `confirmed_at timestamptz`, `completed_at timestamptz`, `cancellation_deadline timestamptz`, `lifecycle_status text` (new taxonomy below — kept alongside existing `status` to avoid breaking checks/RLS).
- `private_packages`: add `calendar_block_start timestamptz`, `calendar_block_end timestamptz`.
- `vendor_buffer_settings`: add `minimum_notice_hours integer default 48`, `advance_booking_days integer default 180`, `vendor_approval_expires_hours integer default 48`.
- `vendor_packages`: add `requires_vendor_approval boolean default false`, `max_bookings_per_day integer`, `available_days_override integer[]`, `available_window_override jsonb` — used by package-level overrides; falls back to vendor master when null.

**Lifecycle status taxonomy** (new column `lifecycle_status` on bookings, populated by trigger from existing `status`):
`draft | pending_vendor_approval | approved_payment_required | payment_pending | confirmed | in_progress | completed | cancelled_by_customer | cancelled_by_vendor | declined_by_vendor | expired | no_show | refunded`.
Existing `status` stays put to keep current code working. Backfill rule: pending→pending_vendor_approval, approved+!paid→approved_payment_required, etc.

**Validation triggers** (no CHECK constraints, per project guideline):
- On `calendar_holds` insert: `expires_at > now()`, `hold_end > hold_start`.
- On `vendor_weekly_availability` insert/update: `end_time > start_time`.
- On `vendor_blocked_times` insert/update: `block_end > block_start`.
- On `bookings` insert/update: if `calendar_block_*` set, `calendar_block_end > calendar_block_start`.

**Backfill**
- Copy `package_weekly_availability` rows to `vendor_weekly_availability` (DISTINCT on `user_id, day_of_week, start_time, end_time`). Keep the per-package table for backwards compatibility (used by override fields); read code switches to vendor table first.
- Backfill `bookings.event_start_at/end_at` from `event_date + start_time/end_time` (vendor timezone where present).
- Backfill `bookings.calendar_block_start/end` = event_start − setup_minutes, event_end + breakdown_minutes.
- Backfill `bookings.lifecycle_status` from existing `status`.

---

## Phase 2 — Server logic (edge functions + RPC)

**New edge functions**
- `check-vendor-availability` — POST `{ vendor_user_id, package_id?, requested_start, requested_end, timezone? }` → returns `{ available: boolean, reason?, suggestions: [{ start, end, label }] }`. Single canonical availability check used by search, package detail, and checkout. Implements the 13-step rule from the spec, including overlap with bookings (any blocking lifecycle_status), active holds, vendor blocked times, vendor weekly windows, package overrides, min notice, advance window, max-per-day.
- `create-booking-hold` — Called at checkout start and on pending-approval submit. Creates `calendar_holds` row (15 min for instant; vendor approval expiry hours for approval flow). Re-runs availability check inside a transaction to prevent race conditions.
- `release-expired-holds` — Cron-scheduled (every 5 min) — flips active holds where `expires_at < now()` to `expired`. Same job also expires `bookings.lifecycle_status = pending_vendor_approval` past their deadline → `expired`.
- `convert-hold-to-booking` — Called by Stripe webhook on successful payment: hold → `converted`, booking → `confirmed`, `confirmed_at = now()`, `cancellation_deadline` computed from policy.

**Updates to existing edge functions**
- `cancel-booking` / `process-refund`: on cancel of a future booking, set `lifecycle_status = cancelled_by_customer|vendor`, write `cancelled_at`, leave `calendar_block_*` in place but exclude `cancelled_*` / `declined_*` / `expired` from availability queries. Block cancel after `event_start_at`.
- `send-event-reminders`: gate on `lifecycle_status = confirmed | in_progress`.

**Race-condition strategy:** the create-booking-hold function does the overlap query and insert in one SQL statement using `INSERT ... WHERE NOT EXISTS (overlap)` so two simultaneous customers can't both succeed.

---

## Phase 3 — UI

**Vendor dashboard — `Calendar` tab (rebuilt `VendorAvailability.tsx`)**
- Sub-tabs: **Schedule** (weekly hours editor, multi-window per day) · **Blocked time** (full-day + time-range, optional reason, recurring) · **Booking rules** (min notice, advance window, default buffers, by-request toggle, default vendor-approval expiry) · **Calendar** (Day / Week / Month / List with color-coded events: pending=amber, confirmed=primary, blocked=gray, private package=violet, completed=muted). Click event → side panel with customer, package, time, location, status, message/approve/decline.

**Package form — Booking rules section**
- New inputs: `requires_vendor_approval`, `instant_book` (mutually exclusive UI), `max_bookings_per_day`, optional override toggles for available days / windows, plus existing duration/setup/breakdown.

**Customer search & checkout**
- `useBrowsePackages` calls `check-vendor-availability` for each candidate when date+time present; keeps current pre-filters as fast pass.
- Package detail time-picker shows **only valid start times** for the chosen date (computed from vendor master + package length); if none, surfaces flexible alternatives ("Available at 7:30 PM instead", "Next available May 18", "Available this weekend").
- Checkout calls `create-booking-hold` on entry; shows a 15-min countdown; on payment success the Stripe webhook converts the hold.

**Customer bookings page**
- Tabs already present (Pending / Upcoming / Past / Cancelled) — re-keyed off `lifecycle_status` and live `event_start_at`/`event_end_at`. New "Happening now" pill when between start/end. Cancel button hidden after `event_start_at`. Reschedule request stub: "Request change" opens a message draft to the vendor (full reschedule flow deferred — noted below).

**Admin overrides** (admin tab additions)
- View any vendor's calendar; release a hold; reopen / block time; force booking status change.

---

## Explicitly out-of-scope for this build (to keep it shippable)

- Travel-time auto-buffering by distance (kept manual via vendor's setup/cleanup).
- Full reschedule round-trip (we ship the request stub; full flow needs its own design pass).
- True per-event timezone selection by the customer (we use vendor timezone as the event timezone for MVP, per spec).

These will be filed as follow-ups after Phase 3 lands.

---

## Technical / risk notes

- Keeping `bookings.status` alongside the new `lifecycle_status` avoids breaking the 7+ files and 2 edge functions that read `status` today; a trigger keeps them in sync.
- `package_weekly_availability` stays so existing per-package overrides keep working; new vendor-master table is the primary read path.
- All times stored as `timestamptz` in UTC; UI converts using vendor timezone (or `America/New_York` default) — matches what `markets`/`vendor_details` already do.
- `release-expired-holds` runs via Supabase Cron (every 5 minutes) — if Cron isn't available in this Cloud env I'll fall back to expiring on read inside `check-vendor-availability` and on every hold-create call.

---

## Acceptance criteria

- One vendor master calendar; no separate per-package calendars in the read path.
- Booking any package blocks the vendor's calendar for `setup + duration + cleanup + buffer`.
- Search results only show vendors whose master calendar can actually fit the requested time.
- When exact time is unavailable, results include flexible alternatives.
- Checkout creates a 15-min hold; abandoning checkout releases the slot.
- Vendor-approval requests create a soft hold; expiring at vendor-set hours.
- Cancelling a future booking releases its calendar block (lifecycle_status excluded from availability query).
- Vendor-approval-required bookings can't be paid until approved.
- `event_start_at` past → no customer-side cancel; `event_end_at` past → moves to Completed automatically.
- Private packages allocate against the same vendor calendar with `calendar_block_*`.
