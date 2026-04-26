import { useMemo, useState, useEffect } from 'react';
import { Clock, AlertCircle, Info, MessageCircle, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { supabase } from '@/integrations/supabase/client';
import type { BookableSlot } from '@/lib/availabilityEngine';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
  /** Optional: called when user picks a suggested alternative date. */
  onAlternativeDate?: (date: Date) => void;
  /** Optional: called when user clicks "Message vendor" in the empty state. */
  onMessageVendor?: () => void;
  className?: string;
}

function endTimeFromStart(start: string, durationMinutes: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const eh = Math.floor((total % (24 * 60)) / 60);
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
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
  onAlternativeDate,
  onMessageVendor,
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

  // ─── Nearby-date suggestions (shown only when current date has 0 slots) ───
  const [nextDates, setNextDates] = useState<Array<{ date: Date; firstStart: string }>>([]);
  const [searchingAlt, setSearchingAlt] = useState(false);
  const noSlots = !loading && !error && slots.length === 0 && Boolean(selectedDate);

  useEffect(() => {
    if (!noSlots || !vendorUserId || !selectedDate) {
      setNextDates([]);
      return;
    }
    let cancelled = false;
    setSearchingAlt(true);

    (async () => {
      const found: Array<{ date: Date; firstStart: string }> = [];
      // Probe the next 14 days forward; collect up to 3 with availability.
      for (let i = 1; i <= 14 && found.length < 3; i++) {
        const probe = addDays(selectedDate, i);
        try {
          const { data } = await supabase.functions.invoke('get-available-slots', {
            body: {
              vendor_user_id: vendorUserId,
              package_id: packageId,
              date: toYMD(probe),
              mode,
              duration_minutes: durationMinutes,
              setup_minutes: setupMinutes,
              breakdown_minutes: breakdownMinutes,
              interval_minutes: intervalMinutes,
            },
          });
          const probeSlots = (data?.slots as BookableSlot[]) ?? [];
          if (probeSlots.length > 0) {
            found.push({ date: probe, firstStart: probeSlots[0].start });
          }
        } catch {
          // skip probe failures silently
        }
      }
      if (!cancelled) {
        setNextDates(found);
        setSearchingAlt(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noSlots, vendorUserId, packageId, dateStr, mode, durationMinutes, setupMinutes, breakdownMinutes, intervalMinutes]);

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

      {!error && noSlots && (
        <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/40">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                No times available for this date.
              </p>
              <p className="text-xs text-muted-foreground">
                This package is booked for {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'that date'}, but there are nearby options.
              </p>
            </div>
          </div>

          {searchingAlt && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          )}

          {!searchingAlt && nextDates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Try a nearby date:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {nextDates.map(({ date, firstStart }) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => onAlternativeDate?.(date)}
                    className="text-left p-2 rounded-lg border border-border hover:border-primary hover:bg-secondary transition-colors"
                  >
                    <div className="text-sm font-medium text-foreground">{format(date, 'EEE, MMM d')}</div>
                    <div className="text-xs text-muted-foreground">from {formatTimeDisplay(firstStart)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!searchingAlt && nextDates.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No openings in the next 14 days. Try messaging the Event Pro directly.
            </p>
          )}

          {onMessageVendor && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMessageVendor}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Event Pro
            </Button>
          )}
        </div>
      )}

      {/* Selected event time preview */}
      {!noSlots && selectedTime && mode !== 'DAILY' && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <ChevronRight className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Your event time:</span>
            <span className="font-medium text-foreground">
              {formatTimeDisplay(selectedTime)} – {formatTimeDisplay(endTimeFromStart(selectedTime, durationMinutes))}
            </span>
          </div>
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
