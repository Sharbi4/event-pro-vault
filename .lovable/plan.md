## Status

The edge function and shared engine you described already exist from the previous phase:

- `supabase/functions/get-available-slots/index.ts` — POST endpoint that accepts `vendor_user_id`, `package_id`, `date`, optional `mode` (HOURLY/DAILY), `duration_minutes`, `setup_minutes`, `breakdown_minutes`, `interval_minutes`. It pulls weekly windows, recurring blocks, full-day blocks, partial-day blocks, active holds, and lifecycle-blocking bookings, then runs the engine.
- `supabase/functions/_shared/availabilityEngine.ts` (mirrored at `src/lib/availabilityEngine.ts`) — `computeBookableSlots()` validates duration, setup, breakdown, buffers, minimum notice, advance window, and overlap for both HOURLY and DAILY modes.
- `src/hooks/useAvailableSlots.ts` — React hook that calls the edge function.

What's missing: the customer-facing `TimeSlotPicker` still uses the legacy client-only `useVendorAvailability` hook, so server-validated slots are never shown.

## What this plan does

Wire the picker to the edge function so customers get server-validated bookable slots that respect package duration, setup/cleanup, buffers, min notice, blocks, holds, and active bookings — and toggle between HOURLY and DAILY modes.

## Changes

1. **`src/components/booking/TimeSlotPicker.tsx`**
   - Add props: `packageId?: string`, `mode?: 'HOURLY' | 'DAILY'` (default HOURLY), `intervalMinutes?: number` (default 30).
   - Replace `useVendorAvailability` with `useAvailableSlots`.
   - Render `slots[].start` (HH:MM) for HOURLY; render a single "Full day" card for DAILY.
   - Pass the picked slot's `start` to `onTimeSelect` (preserve existing signature) and expose `blockStartISO`/`blockEndISO` via an optional `onSlotSelect(slot)` callback for parents that need the calendar block window.
   - Loading skeleton + "no slots" empty state stay; remove the "booked slots" sidebar (server already excludes them).

2. **`src/components/booking/SpatialDrawer.tsx`**
   - Pass `packageId` and `mode` (derived from the selected package's `pricing_type`/`type`) into `<TimeSlotPicker>`.
   - When a slot is chosen, capture `blockStartISO`/`blockEndISO` for the downstream hold + booking insert so the lifecycle status and calendar block window are consistent with the engine.

3. **No DB or edge function changes** — the engine, function, and hook are already deployed.

## Acceptance

- Selecting a date in checkout calls `get-available-slots` with the package's duration + buffers and shows only slots the engine returns.
- DAILY-mode packages show one "Full day" option (or none if blocked).
- Holds, in-progress bookings, and partial-day blocks all suppress overlapping slots.
- Past-due slots inside the minimum-notice window are hidden.
