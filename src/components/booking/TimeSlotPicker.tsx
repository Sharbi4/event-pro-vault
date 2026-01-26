import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVendorAvailability } from '@/hooks/useVendorAvailability';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeSlotPickerProps {
  vendorUserId: string;
  selectedDate: Date;
  durationMinutes: number;
  setupMinutes?: number;
  breakdownMinutes?: number;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  className?: string;
}

export function TimeSlotPicker({
  vendorUserId,
  selectedDate,
  durationMinutes,
  setupMinutes = 0,
  breakdownMinutes = 0,
  selectedTime,
  onTimeSelect,
  className,
}: TimeSlotPickerProps) {
  const { loading, getAvailableSlots, getBookedSlotsForDate, calculateTotalCommitment } = useVendorAvailability(vendorUserId);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableSlots(selectedDate, durationMinutes, setupMinutes, breakdownMinutes);
  }, [selectedDate, durationMinutes, setupMinutes, breakdownMinutes, getAvailableSlots]);

  const bookedSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getBookedSlotsForDate(selectedDate);
  }, [selectedDate, getBookedSlotsForDate]);

  const commitment = useMemo(() => {
    return calculateTotalCommitment(durationMinutes, setupMinutes, breakdownMinutes);
  }, [durationMinutes, setupMinutes, breakdownMinutes, calculateTotalCommitment]);

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Loading available times...</span>
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
    <div className={cn("space-y-4", className)}>
      {/* Header with commitment info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Select Start Time</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Info className="w-3 h-3" />
              <span>Total: {formatDuration(commitment.totalCommitment)}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[250px]">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Service time:</span>
                <span className="font-medium">{formatDuration(commitment.faceTime)}</span>
              </div>
              {commitment.bufferBefore > 0 && (
                <div className="flex justify-between">
                  <span>Setup buffer:</span>
                  <span className="font-medium">{formatDuration(commitment.bufferBefore)}</span>
                </div>
              )}
              {commitment.bufferAfter > 0 && (
                <div className="flex justify-between">
                  <span>Breakdown buffer:</span>
                  <span className="font-medium">{formatDuration(commitment.bufferAfter)}</span>
                </div>
              )}
              <div className="border-t border-border pt-1 mt-1 flex justify-between font-medium">
                <span>Total commitment:</span>
                <span>{formatDuration(commitment.totalCommitment)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* No slots available message */}
      {availableSlots.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No available time slots for this date. The vendor may be fully booked.</span>
        </div>
      )}

      {/* Booked slots info */}
      {bookedSlots.length > 0 && (
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
          <span className="font-medium">Already booked: </span>
          {bookedSlots.map((slot, i) => (
            <span key={slot.bookingId}>
              {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
              {i < bookedSlots.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {/* Time slots grid */}
      {availableSlots.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                "border border-border hover:border-primary",
                selectedTime === time
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-secondary"
              )}
            >
              {formatTimeDisplay(time)}
            </button>
          ))}
        </div>
      )}

      {/* Quick time categories */}
      {availableSlots.length > 8 && (
        <div className="flex gap-2 flex-wrap">
          {['Morning', 'Afternoon', 'Evening'].map((period) => {
            const periodSlots = availableSlots.filter((time) => {
              const hour = parseInt(time.split(':')[0]);
              if (period === 'Morning') return hour >= 6 && hour < 12;
              if (period === 'Afternoon') return hour >= 12 && hour < 17;
              return hour >= 17 && hour < 22;
            });
            
            if (periodSlots.length === 0) return null;
            
            return (
              <button
                key={period}
                onClick={() => onTimeSelect(periodSlots[0])}
                className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {period} ({periodSlots.length} slots)
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
