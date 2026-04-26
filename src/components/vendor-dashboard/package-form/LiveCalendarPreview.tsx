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

  return <PreviewBody
    durationMinutes={durationMinutes}
    setupMinutes={setupMinutes}
    cleanupMinutes={cleanupMinutes}
    bufferBeforeMinutes={bufferBeforeMinutes}
    bufferAfterMinutes={bufferAfterMinutes}
    blocks={blocks}
    hours={hours}
    dayStart={dayStart}
    totalDayMinutes={totalDayMinutes}
    pxPerMin={pxPerMin}
    timelineHeight={TIMELINE_HEIGHT}
    exampleBookings={exampleBookings}
  />;
}

interface PreviewBodyProps {
  durationMinutes: number;
  setupMinutes: number;
  cleanupMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  blocks: Block[];
  hours: number[];
  dayStart: number;
  totalDayMinutes: number;
  pxPerMin: number;
  timelineHeight: number;
  exampleBookings: string[];
}

type ViewMode = 'customer' | 'Vendor';

function PreviewBody({
  durationMinutes,
  setupMinutes,
  cleanupMinutes,
  bufferBeforeMinutes,
  bufferAfterMinutes,
  blocks,
  hours,
  dayStart,
  totalDayMinutes,
  pxPerMin,
  timelineHeight,
  exampleBookings,
}: PreviewBodyProps) {
  const [view, setView] = useState<ViewMode>('Vendor');
  const showOuter = view === 'Vendor';

  return (
    <Card className="p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Live calendar preview</h4>
        </div>

        {/* View toggle */}
        <div
          role="tablist"
          aria-label="Calendar view"
          className="inline-flex items-center bg-muted rounded-full p-0.5 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'customer'}
            onClick={() => setView('customer')}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full transition-all',
              view === 'customer'
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="w-3 h-3" />
            Customer view
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'Vendor'}
            onClick={() => setView('Vendor')}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full transition-all',
              view === 'Vendor'
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Lock className="w-3 h-3" />
            My calendar
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {view === 'customer' ? (
          <>
            What customers see when picking a time —{' '}
            <span className="font-medium text-foreground">just the service window</span>.
          </>
        ) : (
          <>
            What's actually reserved on your calendar —{' '}
            <span className="font-medium text-foreground">
              service + setup, cleanup, and buffers
            </span>
            .
          </>
        )}
      </p>

      {/* Timeline */}
      <div className="relative" style={{ height: timelineHeight }}>
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
            const innerTop = (b.customerStartMin - b.startMin) * pxPerMin;
            const innerHeight = (b.customerEndMin - b.customerStartMin) * pxPerMin;

            // In customer view, only render the inner service block.
            if (!showOuter) {
              const top = Math.max(0, b.customerStartMin * pxPerMin);
              const height = Math.max(20, innerHeight);
              if (b.customerEndMin < 0 || b.customerStartMin > totalDayMinutes) return null;
              return (
                <div
                  key={i}
                  className="absolute left-0 right-0 rounded-sm bg-primary text-primary-foreground px-2 py-1 shadow-sm"
                  style={{ top, height }}
                >
                  <div className="text-[10px] font-semibold leading-tight">{b.label}</div>
                  <div className="text-[9px] opacity-90 tabular-nums leading-tight">
                    {formatTime(b.customerStartMin + dayStart)} –{' '}
                    {formatTime(b.customerEndMin + dayStart)}
                  </div>
                </div>
              );
            }

            // Vendor view: full reserved block with inner service block.
            const top = Math.max(0, b.startMin * pxPerMin);
            const height = Math.max(0, (b.endMin - b.startMin) * pxPerMin);
            if (b.endMin < 0 || b.startMin > totalDayMinutes) return null;

            return (
              <div
                key={i}
                className="absolute left-0 right-0 rounded-md bg-primary/15 border border-primary/40 overflow-hidden"
                style={{ top, height }}
              >
                {innerTop > 14 && (
                  <div className="absolute left-1.5 top-1 text-[9px] font-medium text-primary/80 uppercase tracking-wide">
                    Setup + buffer
                  </div>
                )}

                <div
                  className="absolute left-1 right-1 rounded-sm bg-primary text-primary-foreground px-2 py-1 shadow-sm"
                  style={{ top: innerTop, height: Math.max(20, innerHeight) }}
                >
                  <div className="text-[10px] font-semibold leading-tight">{b.label}</div>
                  <div className="text-[9px] opacity-90 tabular-nums leading-tight">
                    {formatTime(b.customerStartMin + dayStart)} –{' '}
                    {formatTime(b.customerEndMin + dayStart)}
                  </div>
                </div>

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
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted-foreground">Customer sees</span>
        </div>
        {showOuter && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/15 border border-primary/40" />
            <span className="text-[10px] text-muted-foreground">Calendar blocks</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {showOuter
              ? `${durationMinutes + setupMinutes + cleanupMinutes + bufferBeforeMinutes + bufferAfterMinutes} min reserved`
              : `${durationMinutes} min service`}
          </span>
        </div>
      </div>
    </Card>
  );
}
