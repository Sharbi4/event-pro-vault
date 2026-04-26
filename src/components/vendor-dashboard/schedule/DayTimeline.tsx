import { useMemo } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { ScheduleBlock, BLOCK_STYLES } from '@/hooks/useScheduleData';
import { cn } from '@/lib/utils';

interface DayTimelineProps {
  date: Date;
  blocks: ScheduleBlock[];
  startHour?: number; // 0-23
  endHour?: number;   // 0-24
  onBlockClick?: (block: ScheduleBlock) => void;
}

/**
 * Vertical 24-hour-style timeline for a single day, rendering color-coded blocks.
 */
export function DayTimeline({ date, blocks, startHour = 6, endHour = 23, onBlockClick }: DayTimelineProps) {
  const hours = endHour - startHour;
  const pxPerHour = 56;
  const totalHeight = hours * pxPerHour;

  // Filter to blocks intersecting this day
  const dayStart = new Date(date); dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(date); dayEnd.setHours(endHour, 0, 0, 0);

  const dayBlocks = useMemo(() => {
    return blocks
      .filter(b => b.end > dayStart && b.start < dayEnd)
      .map(b => {
        const s = b.start < dayStart ? dayStart : b.start;
        const e = b.end > dayEnd ? dayEnd : b.end;
        const offsetMin = differenceInMinutes(s, dayStart);
        const heightMin = Math.max(20, differenceInMinutes(e, s));
        return {
          block: b,
          top: (offsetMin / 60) * pxPerHour,
          height: (heightMin / 60) * pxPerHour,
        };
      });
  }, [blocks, dayStart.getTime(), dayEnd.getTime()]);

  return (
    <div className="relative border rounded-lg bg-card overflow-hidden">
      <div className="flex">
        {/* Hour gutter */}
        <div className="w-14 flex-shrink-0 border-r bg-muted/30">
          {Array.from({ length: hours }, (_, i) => {
            const h = startHour + i;
            const label = h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
            return (
              <div
                key={h}
                className="text-[10px] text-muted-foreground text-right pr-2 border-b border-border/50"
                style={{ height: pxPerHour }}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="relative flex-1" style={{ height: totalHeight }}>
          {/* Hour gridlines */}
          {Array.from({ length: hours }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-b border-border/40"
              style={{ top: i * pxPerHour, height: pxPerHour }}
            />
          ))}

          {/* Blocks */}
          {dayBlocks.map(({ block, top, height }) => {
            const style = BLOCK_STYLES[block.kind];
            const isBuffer = block.kind === 'setup_buffer' || block.kind === 'breakdown_buffer';
            return (
              <button
                key={block.id}
                onClick={() => onBlockClick?.(block)}
                className={cn(
                  'absolute left-1 right-1 px-2 py-1 rounded-md border text-left transition-all overflow-hidden',
                  style.bg, style.border, style.text,
                  'hover:ring-2 hover:ring-primary/30',
                  isBuffer && 'opacity-80'
                )}
                style={{ top, height }}
              >
                <div className="text-[11px] font-semibold truncate">
                  {format(block.start, 'h:mma')}–{format(block.end, 'h:mma')}
                </div>
                <div className="text-xs font-medium truncate">{block.title}</div>
                {height > 44 && block.subtitle && (
                  <div className="text-[10px] truncate opacity-80">{block.subtitle}</div>
                )}
              </button>
            );
          })}

          {dayBlocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Nothing scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
