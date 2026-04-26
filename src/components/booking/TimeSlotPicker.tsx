import { useMemo } from 'react';
import { Clock, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import type { BookableSlot } from '@/lib/availabilityEngine';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeSlotPickerProps {
  vendorUserId: string;
  packageId?: string;
  selectedDate: Date;
  durationMinutes: number;
  setupMinutes?: number;
  breakdownMinutes?: number;
  mode?: 'HOURLY' | 'DAILY';
  intervalMinutes?: number;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  /** Optional: receive the full slot (with calendar block ISO window). */
  onSlotSelect?: (slot: BookableSlot) => void;
  className?: string;
}

function formatTimeDisplay(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TimeSlotPicker({
  vendorUserId,
  packageId,
  selectedDate,
  durationMinutes,
  setupMinutes = 0,
  breakdownMinutes = 0,
  mode = 'HOURLY',
  intervalMinutes = 30,
  selectedTime,
  onTimeSelect,
  onSlotSelect,
  className,
}: TimeSlotPickerProps) {
  const dateStr = useMemo(() => (selectedDate ? toYMD(selectedDate) : undefined), [selectedDate]);

  const { loading, slots, error } = useAvailableSlots({
    vendorUserId,
    packageId,
    date: dateStr,
    mode,
    durationMinutes,
    setupMinutes,
    breakdownMinutes,
    intervalMinutes,
    enabled: Boolean(vendorUserId && dateStr),
  });

  const totalCommitment = setupMinutes + durationMinutes + breakdownMinutes;

  const handlePick = (slot: BookableSlot) => {
    onTimeSelect(slot.start);
    onSlotSelect?.(slot);
  };

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Loading available times…</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {mode === 'DAILY' ? 'Full-Day Availability' : 'Select Start Time'}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Info className="w-3 h-3" />
              <span>Total: {formatDuration(totalCommitment)}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[250px]">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Service time:</span>
                <span className="font-medium">{formatDuration(durationMinutes)}</span>
              </div>
              {setupMinutes > 0 && (
                <div className="flex justify-between">
                  <span>Setup:</span>
                  <span className="font-medium">{formatDuration(setupMinutes)}</span>
                </div>
              )}
              {breakdownMinutes > 0 && (
                <div className="flex justify-between">
                  <span>Breakdown:</span>
                  <span className="font-medium">{formatDuration(breakdownMinutes)}</span>
                </div>
              )}
              <div className="border-t border-border pt-1 mt-1 flex justify-between font-medium">
                <span>Total commitment:</span>
                <span>{formatDuration(totalCommitment)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Couldn’t load availability. Please try again.</span>
        </div>
      )}

      {!error && slots.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No available {mode === 'DAILY' ? 'date' : 'time slots'} for this day. The vendor may be fully booked.</span>
        </div>
      )}

      {/* DAILY mode: single full-day card */}
      {mode === 'DAILY' && slots.length > 0 && (
        <button
          onClick={() => handlePick(slots[0])}
          className={cn(
            'w-full p-4 rounded-lg border text-left transition-all',
            selectedTime === slots[0].start
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:border-primary hover:bg-secondary'
          )}
        >
          <div className="text-sm font-medium">Full day available</div>
          <div className="text-xs opacity-80 mt-1">
            {formatTimeDisplay(slots[0].start)} – {formatTimeDisplay(slots[0].end)}
          </div>
        </button>
      )}

      {/* HOURLY mode: slot grid */}
      {mode !== 'DAILY' && slots.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => handlePick(slot)}
              className={cn(
                'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                'border border-border hover:border-primary',
                selectedTime === slot.start
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-secondary'
              )}
            >
              {formatTimeDisplay(slot.start)}
            </button>
          ))}
        </div>
      )}

      {/* Period quick-jump */}
      {mode !== 'DAILY' && slots.length > 8 && (
        <div className="flex gap-2 flex-wrap">
          {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => {
            const periodSlots = slots.filter((slot) => {
              const hour = parseInt(slot.start.split(':')[0]);
              if (period === 'Morning') return hour >= 6 && hour < 12;
              if (period === 'Afternoon') return hour >= 12 && hour < 17;
              return hour >= 17 && hour < 22;
            });
            if (periodSlots.length === 0) return null;
            return (
              <button
                key={period}
                onClick={() => handlePick(periodSlots[0])}
                className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {period} ({periodSlots.length})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
