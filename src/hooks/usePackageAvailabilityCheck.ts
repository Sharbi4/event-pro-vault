import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addDays, getDay, format, parseISO } from 'date-fns';

interface WeeklyAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

interface BlockedDate {
  date: string;
  reason?: string;
}

interface AvailabilityData {
  weeklyAvailability: WeeklyAvailability[];
  blockedDates: BlockedDate[];
  existingBookings: string[]; // dates with confirmed bookings
}

export function usePackageAvailabilityCheck(packageId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityData>({
    weeklyAvailability: [],
    blockedDates: [],
    existingBookings: []
  });

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      try {
        const [weeklyRes, blockedRes, bookingsRes] = await Promise.all([
          supabase
            .from('package_weekly_availability')
            .select('*')
            .eq('package_id', packageId),
          supabase
            .from('package_availability')
            .select('*')
            .eq('package_id', packageId)
            .eq('is_blocked', true),
          supabase
            .from('bookings')
            .select('event_date')
            .eq('package_id', packageId)
            .in('status', ['confirmed', 'pending'])
        ]);

        const weeklyAvailability: WeeklyAvailability[] = weeklyRes.data?.map(row => ({
          dayOfWeek: row.day_of_week,
          startTime: row.start_time,
          endTime: row.end_time,
          isEnabled: row.is_enabled
        })) || [];

        const blockedDates: BlockedDate[] = blockedRes.data?.map(row => ({
          date: row.date,
          reason: row.reason || undefined
        })) || [];

        const existingBookings = bookingsRes.data?.map(row => row.event_date) || [];

        setAvailability({ weeklyAvailability, blockedDates, existingBookings });
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [packageId]);

  // Check if a specific date is available
  const isDateAvailable = useCallback((date: Date): { available: boolean; reason?: string } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday

    // Check blocked dates
    const blocked = availability.blockedDates.find(b => b.date === dateStr);
    if (blocked) {
      return { available: false, reason: blocked.reason || 'This date is blocked' };
    }

    // Check existing bookings
    if (availability.existingBookings.includes(dateStr)) {
      return { available: false, reason: 'Already booked' };
    }

    // Check weekly availability
    if (availability.weeklyAvailability.length > 0) {
      const dayAvailability = availability.weeklyAvailability.find(
        w => w.dayOfWeek === dayOfWeek
      );
      if (!dayAvailability || !dayAvailability.isEnabled) {
        return { available: false, reason: 'Not available on this day of the week' };
      }
    }

    return { available: true };
  }, [availability]);

  // Check if time is within available hours for a date
  const isTimeAvailable = useCallback((date: Date, startTime: string, endTime: string): { available: boolean; reason?: string } => {
    const dayOfWeek = getDay(date);
    
    if (availability.weeklyAvailability.length === 0) {
      return { available: true }; // No restrictions if not set
    }

    const dayAvailability = availability.weeklyAvailability.find(
      w => w.dayOfWeek === dayOfWeek
    );

    if (!dayAvailability || !dayAvailability.isEnabled) {
      return { available: false, reason: 'Not available on this day' };
    }

    // Parse times for comparison
    const reqStart = parseInt(startTime.replace(':', ''));
    const reqEnd = parseInt(endTime.replace(':', ''));
    const availStart = parseInt(dayAvailability.startTime.replace(':', ''));
    const availEnd = parseInt(dayAvailability.endTime.replace(':', ''));

    if (reqStart < availStart || reqEnd > availEnd) {
      return { 
        available: false, 
        reason: `Available ${dayAvailability.startTime} - ${dayAvailability.endTime}` 
      };
    }

    return { available: true };
  }, [availability]);

  // Get unavailable dates for the calendar
  const getUnavailableDates = useCallback((): Date[] => {
    const unavailable: Date[] = [];
    
    // Add blocked dates
    availability.blockedDates.forEach(b => {
      unavailable.push(parseISO(b.date));
    });

    // Add existing bookings
    availability.existingBookings.forEach(dateStr => {
      unavailable.push(parseISO(dateStr));
    });

    return unavailable;
  }, [availability]);

  // Get disabled days of week (0-6)
  const getDisabledDaysOfWeek = useCallback((): number[] => {
    if (availability.weeklyAvailability.length === 0) {
      return [];
    }

    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const enabledDays = availability.weeklyAvailability
      .filter(w => w.isEnabled)
      .map(w => w.dayOfWeek);

    return allDays.filter(day => !enabledDays.includes(day));
  }, [availability]);

  // Find alternative dates near a given date
  const findAlternatives = useCallback((date: Date, count: number = 3): Date[] => {
    const alternatives: Date[] = [];
    const searchRange = 14; // Search within 2 weeks

    for (let i = 1; i <= searchRange && alternatives.length < count; i++) {
      // Check before
      const before = addDays(date, -i);
      if (before >= new Date() && isDateAvailable(before).available) {
        alternatives.push(before);
      }
      
      // Check after
      if (alternatives.length < count) {
        const after = addDays(date, i);
        if (isDateAvailable(after).available) {
          alternatives.push(after);
        }
      }
    }

    // Sort by distance from original date
    return alternatives.sort((a, b) => 
      Math.abs(a.getTime() - date.getTime()) - Math.abs(b.getTime() - date.getTime())
    ).slice(0, count);
  }, [isDateAvailable]);

  // Get available hours for a specific date
  const getAvailableHours = useCallback((date: Date): { start: string; end: string } | null => {
    const dayOfWeek = getDay(date);
    const dayAvailability = availability.weeklyAvailability.find(
      w => w.dayOfWeek === dayOfWeek && w.isEnabled
    );

    if (dayAvailability) {
      return {
        start: dayAvailability.startTime,
        end: dayAvailability.endTime
      };
    }

    return null;
  }, [availability]);

  return {
    loading,
    availability,
    isDateAvailable,
    isTimeAvailable,
    getUnavailableDates,
    getDisabledDaysOfWeek,
    findAlternatives,
    getAvailableHours
  };
}
