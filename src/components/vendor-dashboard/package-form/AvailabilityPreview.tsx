import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, CalendarX } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay, getDay } from 'date-fns';
import { PackageWeeklyAvailability, PackageBlockedDate } from './StepAvailability';

interface AvailabilityPreviewProps {
  weeklyAvailability: PackageWeeklyAvailability[];
  blockedDates: PackageBlockedDate[];
  className?: string;
}

interface DayStatus {
  date: Date;
  isAvailable: boolean;
  reason?: 'day_off' | 'blocked' | 'past';
  timeRange?: string;
}

export function AvailabilityPreview({
  weeklyAvailability,
  blockedDates,
  className,
}: AvailabilityPreviewProps) {
  const next30Days = useMemo(() => {
    const today = startOfDay(new Date());
    const days: DayStatus[] = [];

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = getDay(date);
      const dateStr = format(date, 'yyyy-MM-dd');

      const daySchedule = weeklyAvailability.find(d => d.dayOfWeek === dayOfWeek);
      const isBlocked = blockedDates.some(b => b.date === dateStr);
      const isDayEnabled = daySchedule?.isEnabled ?? false;

      let status: DayStatus = {
        date,
        isAvailable: false,
        reason: 'day_off',
      };

      if (isBlocked) {
        status = { date, isAvailable: false, reason: 'blocked' };
      } else if (isDayEnabled) {
        const startTime = daySchedule?.startTime?.slice(0, 5) || '09:00';
        const endTime = daySchedule?.endTime?.slice(0, 5) || '17:00';
        status = {
          date,
          isAvailable: true,
          timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        };
      }

      days.push(status);
    }

    return days;
  }, [weeklyAvailability, blockedDates]);

  const availableDaysCount = next30Days.filter(d => d.isAvailable).length;
  const nextAvailableDay = next30Days.find(d => d.isAvailable);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            Next 30 Days Preview
          </CardTitle>
          <Badge variant={availableDaysCount > 0 ? 'default' : 'secondary'}>
            {availableDaysCount} available
          </Badge>
        </div>
        {nextAvailableDay && (
          <p className="text-xs text-muted-foreground">
            Next available: {format(nextAvailableDay.date, 'EEEE, MMM d')} ({nextAvailableDay.timeRange})
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={`header-${i}`}
              className="text-[10px] text-center text-muted-foreground font-medium py-1"
            >
              {day}
            </div>
          ))}

          {/* Fill empty cells for first week alignment */}
          {Array.from({ length: getDay(next30Days[0]?.date || new Date()) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {next30Days.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors ${
                day.isAvailable
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : day.reason === 'blocked'
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
              title={
                day.isAvailable
                  ? `${format(day.date, 'MMM d')}: ${day.timeRange}`
                  : day.reason === 'blocked'
                  ? `${format(day.date, 'MMM d')}: Blocked`
                  : `${format(day.date, 'MMM d')}: Day off`
              }
            >
              {format(day.date, 'd')}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green-500/40" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-destructive/40" />
            <span className="text-muted-foreground">Blocked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-muted" />
            <span className="text-muted-foreground">Day off</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}
