import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Eye, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveCalendarPreviewProps {
  durationMinutes: number;
  setupMinutes: number;
  cleanupMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  /** Day window shown in the timeline (24h). Defaults 8am–10pm. */
  dayStartHour?: number;
  dayEndHour?: number;
  /** Example customer-facing booking start times (24h "HH:MM"). */
  exampleBookings?: string[];
}

interface Block {
  label: string;
  startMin: number; // minutes from dayStart
  endMin: number;
  customerStartMin: number;
  customerEndMin: number;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${display} ${period}` : `${display}:${String(m).padStart(2, '0')} ${period}`;
}

export function LiveCalendarPreview({
  durationMinutes,
  setupMinutes,
  cleanupMinutes,
  bufferBeforeMinutes,
  bufferAfterMinutes,
  dayStartHour = 8,
  dayEndHour = 22,
  exampleBookings = ['11:00', '17:00'],
}: LiveCalendarPreviewProps) {
  const dayStart = dayStartHour * 60;
  const dayEnd = dayEndHour * 60;
  const totalDayMinutes = dayEnd - dayStart;

  const blocks: Block[] = useMemo(() => {
    if (!durationMinutes) return [];
    return exampleBookings.map((start, i) => {
      const cs = toMinutes(start);
      const ce = cs + durationMinutes;
      const bs = cs - setupMinutes - bufferBeforeMinutes;
      const be = ce + cleanupMinutes + bufferAfterMinutes;
      return {
        label: `Booking ${i + 1}`,
        startMin: bs - dayStart,
        endMin: be - dayStart,
        customerStartMin: cs - dayStart,
        customerEndMin: ce - dayStart,
      };
    });
  }, [exampleBookings, durationMinutes, setupMinutes, cleanupMinutes, bufferBeforeMinutes, bufferAfterMinutes, dayStart]);

  // Hourly tick marks
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = dayStartHour; h <= dayEndHour; h++) arr.push(h);
    return arr;
  }, [dayStartHour, dayEndHour]);

  const TIMELINE_HEIGHT = 320; // px
  const pxPerMin = TIMELINE_HEIGHT / totalDayMinutes;

  if (!durationMinutes) {
    return (
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Set a service duration above to see how your calendar gets blocked.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Live calendar preview</h4>
        </div>
        <span className="text-[10px] text-muted-foreground">Example day</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Here's how your day looks if you got{' '}
        <span className="font-medium text-foreground">{exampleBookings.length} bookings</span>{' '}
        with your current settings. Customers see the inner block; your calendar reserves the full block.
      </p>

      {/* Timeline */}
      <div className="relative" style={{ height: TIMELINE_HEIGHT }}>
        {/* Hour grid */}
        <div className="absolute inset-0">
          {hours.map((h) => {
            const top = (h * 60 - dayStart) * pxPerMin;
            return (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-center"
                style={{ top }}
              >
                <span className="text-[10px] tabular-nums text-muted-foreground w-12 -mt-1.5">
                  {formatTime(h * 60)}
                </span>
                <div className="flex-1 border-t border-dashed border-border/60" />
              </div>
            );
          })}
        </div>

        {/* Booking blocks */}
        <div className="absolute left-12 right-2 top-0 bottom-0">
          {blocks.map((b, i) => {
            const top = Math.max(0, b.startMin * pxPerMin);
            const height = Math.max(0, (b.endMin - b.startMin) * pxPerMin);
            const innerTop = (b.customerStartMin - b.startMin) * pxPerMin;
            const innerHeight = (b.customerEndMin - b.customerStartMin) * pxPerMin;

            // Hide off-screen
            if (b.endMin < 0 || b.startMin > totalDayMinutes) return null;

            return (
              <div
                key={i}
                className="absolute left-0 right-0 rounded-md bg-primary/15 border border-primary/40 overflow-hidden"
                style={{ top, height }}
              >
                {/* Setup label */}
                {innerTop > 14 && (
                  <div className="absolute left-1.5 top-1 text-[9px] font-medium text-primary/80 uppercase tracking-wide">
                    Setup + buffer
                  </div>
                )}

                {/* Customer-visible service block */}
                <div
                  className="absolute left-1 right-1 rounded-sm bg-primary text-primary-foreground px-2 py-1 shadow-sm"
                  style={{ top: innerTop, height: Math.max(20, innerHeight) }}
                >
                  <div className="text-[10px] font-semibold leading-tight">
                    {b.label}
                  </div>
                  <div className="text-[9px] opacity-90 tabular-nums leading-tight">
                    {formatTime(b.customerStartMin + dayStart)} – {formatTime(b.customerEndMin + dayStart)}
                  </div>
                </div>

                {/* Cleanup label */}
                {(height - innerTop - innerHeight) > 14 && (
                  <div className="absolute left-1.5 bottom-1 text-[9px] font-medium text-primary/80 uppercase tracking-wide">
                    Cleanup + buffer
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted-foreground">Customer sees</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/15 border border-primary/40" />
          <span className="text-[10px] text-muted-foreground">Calendar blocks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {durationMinutes + setupMinutes + cleanupMinutes + bufferBeforeMinutes + bufferAfterMinutes} min/booking
          </span>
        </div>
      </div>
    </Card>
  );
}
