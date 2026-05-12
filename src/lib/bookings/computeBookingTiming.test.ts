import { describe, it, expect } from 'vitest';
import { computeBookingTiming } from './computeBookingTiming';
import { bookingBlocksCalendar } from '@/lib/availabilityEngine';

/**
 * These tests cover the master-calendar fields that get written to the
 * `bookings` table when a customer books a package. The same helper is
 * used by useBookings.createBooking; verifying its output here guarantees
 * that:
 *
 *   - Hourly bookings (caller supplies start_time + end_time) keep the
 *     explicit window.
 *   - Non-hourly bookings (caller supplies start_time + duration_minutes)
 *     get a derived end_time and a full ISO window so the Booking Command
 *     Center can render them.
 *   - Setup / breakdown buffers expand calendar_block_* beyond
 *     event_start_at / event_end_at.
 *   - Cross-midnight bookings push the end to the next day.
 *   - Bookings whose lifecycle_status is cancelled / declined / etc.
 *     do not consume calendar capacity.
 */

const isoMinutesBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);

describe('computeBookingTiming — hourly bookings', () => {
  it('uses the explicit end_time the caller provides', () => {
    const t = computeBookingTiming({
      event_date: '2026-06-15',
      start_time: '10:00',
      end_time: '13:00',
      duration_minutes: 180,
      setup_minutes: 30,
      breakdown_minutes: 30,
    });

    expect(t.event_start_at).not.toBeNull();
    expect(t.event_end_at).not.toBeNull();
    expect(isoMinutesBetween(t.event_start_at!, t.event_end_at!)).toBe(180);
    expect(t.end_time).toBe('13:00');
    expect(isoMinutesBetween(t.calendar_block_start!, t.event_start_at!)).toBe(30);
    expect(isoMinutesBetween(t.event_end_at!, t.calendar_block_end!)).toBe(30);
  });

  it('falls back to duration_minutes when end_time is missing', () => {
    const t = computeBookingTiming({
      event_date: '2026-06-15',
      start_time: '10:00',
      end_time: null,
      duration_minutes: 90,
      setup_minutes: 0,
      breakdown_minutes: 0,
    });

    expect(t.end_time).toBe('11:30:00');
    expect(isoMinutesBetween(t.event_start_at!, t.event_end_at!)).toBe(90);
    // No buffers → calendar block === event window
    expect(t.calendar_block_start).toBe(t.event_start_at);
    expect(t.calendar_block_end).toBe(t.event_end_at);
  });
});

describe('computeBookingTiming — non-hourly bookings (catering / pull-up)', () => {
  it('derives a full window for catering with setup + breakdown buffers', () => {
    // Catering package: 2-hour service, 45min setup, 30min breakdown,
    // no explicit end_time (BookingModal does not send one for non-hourly).
    const t = computeBookingTiming({
      event_date: '2026-07-04',
      start_time: '18:00',
      end_time: null,
      duration_minutes: 120,
      setup_minutes: 45,
      breakdown_minutes: 30,
    });

    expect(t.event_start_at).not.toBeNull();
    expect(t.event_end_at).not.toBeNull();
    expect(t.calendar_block_start).not.toBeNull();
    expect(t.calendar_block_end).not.toBeNull();
    expect(t.end_time).toBe('20:00:00');

    expect(isoMinutesBetween(t.event_start_at!, t.event_end_at!)).toBe(120);
    expect(isoMinutesBetween(t.calendar_block_start!, t.calendar_block_end!))
      .toBe(45 + 120 + 30);
  });

  it('defaults to 60 minutes when duration_minutes is missing', () => {
    const t = computeBookingTiming({
      event_date: '2026-07-04',
      start_time: '09:00',
    });
    expect(t.duration_minutes).toBe(60);
    expect(t.end_time).toBe('10:00:00');
    expect(isoMinutesBetween(t.event_start_at!, t.event_end_at!)).toBe(60);
  });
});

describe('computeBookingTiming — edge cases', () => {
  it('pushes end into the next day when the booking crosses midnight', () => {
    const t = computeBookingTiming({
      event_date: '2026-12-31',
      start_time: '23:00',
      end_time: '02:00',
      setup_minutes: 0,
      breakdown_minutes: 0,
    });
    // Timestamps are stored in real UTC; the only invariant the calendar
    // cares about is that end > start by the right duration and the
    // wall-clock end_time was preserved.
    expect(t.event_start_at).not.toBeNull();
    expect(t.event_end_at).not.toBeNull();
    expect(isoMinutesBetween(t.event_start_at!, t.event_end_at!)).toBe(180);
    expect(t.end_time).toBe('02:00');
  });

  it('returns all-null timing fields when start_time is missing', () => {
    const t = computeBookingTiming({
      event_date: '2026-06-15',
      start_time: null,
    });
    expect(t.event_start_at).toBeNull();
    expect(t.event_end_at).toBeNull();
    expect(t.calendar_block_start).toBeNull();
    expect(t.calendar_block_end).toBeNull();
    expect(t.end_time).toBeNull();
  });

  it('returns all-null timing fields when event_date is missing', () => {
    const t = computeBookingTiming({
      start_time: '10:00',
      duration_minutes: 60,
    });
    expect(t.event_start_at).toBeNull();
    expect(t.calendar_block_start).toBeNull();
  });
});

describe('bookingBlocksCalendar — business logic for calendar capacity', () => {
  it.each([
    ['pending_vendor_approval'],
    ['approved_payment_required'],
    ['payment_pending'],
    ['confirmed'],
    ['in_progress'],
  ])('blocks the calendar for lifecycle_status = %s', (lifecycle_status) => {
    expect(bookingBlocksCalendar({ lifecycle_status })).toBe(true);
  });

  it.each([
    ['completed'],
    ['cancelled_by_customer'],
    ['cancelled_by_vendor'],
    ['declined_by_vendor'],
    ['expired'],
    ['no_show'],
    ['refunded'],
  ])('does NOT block the calendar for lifecycle_status = %s', (lifecycle_status) => {
    expect(bookingBlocksCalendar({ lifecycle_status })).toBe(false);
  });

  it('falls back to legacy status when lifecycle_status is null', () => {
    expect(bookingBlocksCalendar({ lifecycle_status: null, status: 'pending' })).toBe(true);
    expect(bookingBlocksCalendar({ lifecycle_status: null, status: 'paid' })).toBe(true);
    expect(bookingBlocksCalendar({ lifecycle_status: null, status: 'cancelled' })).toBe(false);
  });
});
