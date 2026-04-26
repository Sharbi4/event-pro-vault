import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, addMinutes, isWithinInterval, parse } from 'date-fns';

interface ExistingBooking {
  id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  setup_minutes: number;
  breakdown_minutes: number;
  package_id: string;
  status: string;
}

interface PackageInfo {
  id: string;
  name: string;
  duration_minutes: number | null;
  setup_time_minutes: number | null;
  breakdown_time_minutes: number | null;
  pricing_type: string | null;
}

interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  totalStart: string; // Including setup buffer
  totalEnd: string; // Including breakdown buffer
  packageName: string;
  bookingId: string;
}

interface VendorAvailabilityData {
  bookings: ExistingBooking[];
  packages: PackageInfo[];
  weeklyAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
  }[];
  bufferSettings: {
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    respectSetupBreakdown: boolean;
    availableByRequestOnly: boolean;
  };
}

/**
 * Hook to check vendor-wide availability across ALL packages.
 * Ensures that booking one package blocks the Event Pro for that time slot
 * across all their other packages.
 */
export function useVendorAvailability(vendorUserId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VendorAvailabilityData>({
    bookings: [],
    packages: [],
    weeklyAvailability: [],
    bufferSettings: {
      bufferBeforeMinutes: 30,
      bufferAfterMinutes: 30,
      respectSetupBreakdown: true,
      availableByRequestOnly: false,
    },
  });

  // Fetch all Event Pro data
  useEffect(() => {
    if (!vendorUserId) {
      setLoading(false);
      return;
    }

    async function fetchVendorData() {
      setLoading(true);
      try {
        const [bookingsRes, packagesRes, weeklyRes, bufferRes] = await Promise.all([
          // Get all active bookings for this Event Pro
          supabase
            .from('bookings')
            .select('id, event_date, start_time, end_time, duration_minutes, setup_minutes, breakdown_minutes, package_id, status')
            .eq('vendor_user_id', vendorUserId)
            .in('status', ['confirmed', 'pending'])
            .order('event_date'),
          // Get all Event Pro packages with their duration settings
          supabase
            .from('vendor_packages')
            .select('id, name, duration_minutes, setup_time_minutes, breakdown_time_minutes, pricing_type')
            .eq('user_id', vendorUserId)
            .eq('is_active', true),
          // Get Event Pro's weekly availability
          supabase
            .from('vendor_weekly_availability')
            .select('*')
            .eq('user_id', vendorUserId)
            .order('day_of_week'),
          // Get Event Pro's buffer settings
          supabase
            .from('vendor_buffer_settings')
            .select('*')
            .eq('user_id', vendorUserId)
            .maybeSingle(),
        ]);

        const bookings: ExistingBooking[] = bookingsRes.data?.map(b => ({
          id: b.id,
          event_date: b.event_date,
          start_time: b.start_time,
          end_time: b.end_time,
          duration_minutes: b.duration_minutes || 60,
          setup_minutes: b.setup_minutes || 0,
          breakdown_minutes: b.breakdown_minutes || 0,
          package_id: b.package_id,
          status: b.status,
        })) || [];

        const packages: PackageInfo[] = packagesRes.data?.map(p => ({
          id: p.id,
          name: p.name,
          duration_minutes: p.duration_minutes,
          setup_time_minutes: p.setup_time_minutes,
          breakdown_time_minutes: p.breakdown_time_minutes,
          pricing_type: p.pricing_type,
        })) || [];

        const weeklyAvailability = weeklyRes.data?.map(w => ({
          dayOfWeek: w.day_of_week,
          startTime: w.start_time,
          endTime: w.end_time,
          isEnabled: w.is_enabled,
        })) || [];

        const bufferSettings = bufferRes.data ? {
          bufferBeforeMinutes: bufferRes.data.buffer_before_minutes,
          bufferAfterMinutes: bufferRes.data.buffer_after_minutes,
          respectSetupBreakdown: bufferRes.data.respect_setup_breakdown,
          availableByRequestOnly: bufferRes.data.available_by_request_only,
        } : {
          bufferBeforeMinutes: 30,
          bufferAfterMinutes: 30,
          respectSetupBreakdown: true,
          availableByRequestOnly: false,
        };

        setData({ bookings, packages, weeklyAvailability, bufferSettings });
      } catch (error) {
        console.error('Error fetching Event Pro availability:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVendorData();
  }, [vendorUserId]);

  // Get all booked time slots for a specific date
  const getBookedSlotsForDate = useCallback((date: Date): TimeSlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots: TimeSlot[] = [];

    data.bookings
      .filter(b => b.event_date === dateStr)
      .forEach(booking => {
        if (!booking.start_time) return;

        // Find package info for additional context
        const pkg = data.packages.find(p => p.id === booking.package_id);
        
        // Calculate total blocked time including buffers
        const setupBuffer = data.bufferSettings.respectSetupBreakdown 
          ? booking.setup_minutes 
          : data.bufferSettings.bufferBeforeMinutes;
        
        const breakdownBuffer = data.bufferSettings.respectSetupBreakdown
          ? booking.breakdown_minutes
          : data.bufferSettings.bufferAfterMinutes;

        // Parse times
        const baseDate = parseISO(`${dateStr}T00:00:00`);
        const [startHour, startMin] = booking.start_time.split(':').map(Number);
        const startDateTime = new Date(baseDate);
        startDateTime.setHours(startHour, startMin, 0, 0);

        const endDateTime = booking.end_time 
          ? (() => {
              const [endHour, endMin] = booking.end_time.split(':').map(Number);
              const end = new Date(baseDate);
              end.setHours(endHour, endMin, 0, 0);
              return end;
            })()
          : addMinutes(startDateTime, booking.duration_minutes);

        const totalStartDateTime = addMinutes(startDateTime, -setupBuffer);
        const totalEndDateTime = addMinutes(endDateTime, breakdownBuffer);

        slots.push({
          startTime: format(startDateTime, 'HH:mm'),
          endTime: format(endDateTime, 'HH:mm'),
          totalStart: format(totalStartDateTime, 'HH:mm'),
          totalEnd: format(totalEndDateTime, 'HH:mm'),
          packageName: pkg?.name || 'Unknown Package',
          bookingId: booking.id,
        });
      });

    return slots;
  }, [data]);

  // Check if a specific time slot conflicts with existing bookings
  const checkTimeSlotConflict = useCallback((
    date: Date,
    startTime: string, // HH:mm format
    durationMinutes: number,
    setupMinutes: number = 0,
    breakdownMinutes: number = 0
  ): { hasConflict: boolean; conflictingSlot?: TimeSlot; reason?: string } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const bookedSlots = getBookedSlotsForDate(date);

    if (bookedSlots.length === 0) {
      return { hasConflict: false };
    }

    // Calculate the full time range for the new booking
    const baseDate = parseISO(`${dateStr}T00:00:00`);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const newStart = new Date(baseDate);
    newStart.setHours(startHour, startMin, 0, 0);
    
    const newEnd = addMinutes(newStart, durationMinutes);
    const newTotalStart = addMinutes(newStart, -setupMinutes);
    const newTotalEnd = addMinutes(newEnd, breakdownMinutes);

    // Check each booked slot for overlap
    for (const slot of bookedSlots) {
      const [slotTotalStartHour, slotTotalStartMin] = slot.totalStart.split(':').map(Number);
      const [slotTotalEndHour, slotTotalEndMin] = slot.totalEnd.split(':').map(Number);
      
      const slotStart = new Date(baseDate);
      slotStart.setHours(slotTotalStartHour, slotTotalStartMin, 0, 0);
      
      const slotEnd = new Date(baseDate);
      slotEnd.setHours(slotTotalEndHour, slotTotalEndMin, 0, 0);

      // Check for any overlap
      const hasOverlap = (
        (newTotalStart >= slotStart && newTotalStart < slotEnd) ||
        (newTotalEnd > slotStart && newTotalEnd <= slotEnd) ||
        (newTotalStart <= slotStart && newTotalEnd >= slotEnd)
      );

      if (hasOverlap) {
        return {
          hasConflict: true,
          conflictingSlot: slot,
          reason: `Conflicts with "${slot.packageName}" booking (${slot.startTime} - ${slot.endTime})`,
        };
      }
    }

    return { hasConflict: false };
  }, [getBookedSlotsForDate]);

  // Get available time slots for a date
  const getAvailableSlots = useCallback((
    date: Date,
    durationMinutes: number,
    setupMinutes: number = 0,
    breakdownMinutes: number = 0,
    intervalMinutes: number = 30
  ): string[] => {
    const dayOfWeek = date.getDay();
    const dayAvailability = data.weeklyAvailability.find(w => w.dayOfWeek === dayOfWeek);

    // If no weekly availability set, assume full day available
    const dayStart = dayAvailability?.isEnabled 
      ? dayAvailability.startTime 
      : '08:00';
    const dayEnd = dayAvailability?.isEnabled 
      ? dayAvailability.endTime 
      : '22:00';

    if (dayAvailability && !dayAvailability.isEnabled) {
      return []; // Day is disabled
    }

    const availableSlots: string[] = [];
    const [startHour, startMin] = dayStart.split(':').map(Number);
    const [endHour, endMin] = dayEnd.split(':').map(Number);

    const dateStr = format(date, 'yyyy-MM-dd');
    const baseDate = parseISO(`${dateStr}T00:00:00`);
    
    let currentTime = new Date(baseDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const dayEndTime = new Date(baseDate);
    dayEndTime.setHours(endHour, endMin, 0, 0);

    // Total time needed for booking including buffers
    const totalTimeNeeded = setupMinutes + durationMinutes + breakdownMinutes;

    while (currentTime < dayEndTime) {
      const slotTime = format(currentTime, 'HH:mm');
      const slotEndTime = addMinutes(currentTime, totalTimeNeeded);

      // Check if slot fits within day's available hours
      if (slotEndTime <= dayEndTime) {
        const conflict = checkTimeSlotConflict(
          date,
          slotTime,
          durationMinutes,
          setupMinutes,
          breakdownMinutes
        );

        if (!conflict.hasConflict) {
          availableSlots.push(slotTime);
        }
      }

      currentTime = addMinutes(currentTime, intervalMinutes);
    }

    return availableSlots;
  }, [data.weeklyAvailability, checkTimeSlotConflict]);

  // Calculate total commitment time for a booking
  const calculateTotalCommitment = useCallback((
    durationMinutes: number,
    setupMinutes: number = 0,
    breakdownMinutes: number = 0
  ): {
    faceTime: number;
    setupTime: number;
    breakdownTime: number;
    totalCommitment: number;
    bufferBefore: number;
    bufferAfter: number;
  } => {
    const bufferBefore = data.bufferSettings.respectSetupBreakdown
      ? setupMinutes
      : data.bufferSettings.bufferBeforeMinutes;
    
    const bufferAfter = data.bufferSettings.respectSetupBreakdown
      ? breakdownMinutes
      : data.bufferSettings.bufferAfterMinutes;

    return {
      faceTime: durationMinutes,
      setupTime: setupMinutes,
      breakdownTime: breakdownMinutes,
      totalCommitment: bufferBefore + durationMinutes + bufferAfter,
      bufferBefore,
      bufferAfter,
    };
  }, [data.bufferSettings]);

  // Check if a date has any availability left
  const hasAvailabilityOnDate = useCallback((
    date: Date,
    durationMinutes: number,
    setupMinutes: number = 0,
    breakdownMinutes: number = 0
  ): boolean => {
    const availableSlots = getAvailableSlots(date, durationMinutes, setupMinutes, breakdownMinutes);
    return availableSlots.length > 0;
  }, [getAvailableSlots]);

  return {
    loading,
    data,
    getBookedSlotsForDate,
    checkTimeSlotConflict,
    getAvailableSlots,
    calculateTotalCommitment,
    hasAvailabilityOnDate,
    bufferSettings: data.bufferSettings,
    weeklyAvailability: data.weeklyAvailability,
  };
}
