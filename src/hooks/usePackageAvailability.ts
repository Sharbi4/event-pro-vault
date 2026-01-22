import { supabase } from '@/integrations/supabase/client';
import { PackageWeeklyAvailability, PackageBlockedDate } from '@/components/vendor-dashboard/package-form/StepAvailability';

export async function savePackageAvailability(
  packageId: string,
  userId: string,
  weeklyAvailability: PackageWeeklyAvailability[],
  blockedDates: PackageBlockedDate[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, delete existing weekly availability for this package
    await supabase
      .from('package_weekly_availability')
      .delete()
      .eq('package_id', packageId);

    // Insert new weekly availability
    if (weeklyAvailability.length > 0) {
      const weeklyData = weeklyAvailability.map(day => ({
        package_id: packageId,
        user_id: userId,
        day_of_week: day.dayOfWeek,
        start_time: day.startTime,
        end_time: day.endTime,
        is_enabled: day.isEnabled,
      }));

      const { error: weeklyError } = await supabase
        .from('package_weekly_availability')
        .insert(weeklyData);

      if (weeklyError) {
        console.error('Error saving weekly availability:', weeklyError);
        return { success: false, error: weeklyError.message };
      }
    }

    // Delete existing blocked dates for this package
    await supabase
      .from('package_availability')
      .delete()
      .eq('package_id', packageId);

    // Insert new blocked dates
    if (blockedDates.length > 0) {
      const blockedData = blockedDates.map(date => ({
        package_id: packageId,
        user_id: userId,
        date: date.date,
        is_blocked: true,
        reason: date.reason || null,
      }));

      const { error: blockedError } = await supabase
        .from('package_availability')
        .insert(blockedData);

      if (blockedError) {
        console.error('Error saving blocked dates:', blockedError);
        return { success: false, error: blockedError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving package availability:', error);
    return { success: false, error: 'Failed to save availability' };
  }
}

export async function loadPackageAvailability(
  packageId: string
): Promise<{
  weeklyAvailability: PackageWeeklyAvailability[];
  blockedDates: PackageBlockedDate[];
}> {
  try {
    const [weeklyRes, blockedRes] = await Promise.all([
      supabase
        .from('package_weekly_availability')
        .select('*')
        .eq('package_id', packageId)
        .order('day_of_week'),
      supabase
        .from('package_availability')
        .select('*')
        .eq('package_id', packageId)
        .eq('is_blocked', true)
        .order('date'),
    ]);

    const weeklyAvailability: PackageWeeklyAvailability[] = weeklyRes.data?.map(row => ({
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      isEnabled: row.is_enabled,
    })) || [];

    const blockedDates: PackageBlockedDate[] = blockedRes.data?.map(row => ({
      id: row.id,
      date: row.date,
      reason: row.reason || undefined,
    })) || [];

    return { weeklyAvailability, blockedDates };
  } catch (error) {
    console.error('Error loading package availability:', error);
    return { weeklyAvailability: [], blockedDates: [] };
  }
}
