import { Card } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface CalendarBlockPreviewProps {
  durationMinutes: number;
  setupMinutes: number;
  cleanupMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  /** Demo start time, defaults to 17:00 (5:00 PM) */
  demoStart?: string;
}

function addMinutes(timeHHMM: string, minutes: number): string {
  const [h, m] = timeHHMM.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function formatTime(timeHHMM: string): string {
  const [h, m] = timeHHMM.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, '0')} ${period}`;
}

export function CalendarBlockPreview({
  durationMinutes,
  setupMinutes,
  cleanupMinutes,
  bufferBeforeMinutes,
  bufferAfterMinutes,
  demoStart = '17:00',
}: CalendarBlockPreviewProps) {
  const customerStart = demoStart;
  const customerEnd = addMinutes(demoStart, durationMinutes || 0);
  const blockStart = addMinutes(demoStart, -(setupMinutes + bufferBeforeMinutes));
  const blockEnd = addMinutes(customerEnd, cleanupMinutes + bufferAfterMinutes);

  const totalBlock =
    (durationMinutes || 0) + setupMinutes + cleanupMinutes + bufferBeforeMinutes + bufferAfterMinutes;
  const totalHrs = Math.floor(totalBlock / 60);
  const totalMins = totalBlock % 60;
  const totalLabel = `${totalHrs}h${totalMins ? ` ${totalMins}m` : ''}`;

  return (
    <Card className="p-4 bg-muted/30 border-dashed space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        EventPro uses these times to show accurate availability and prevent double bookings.
      </p>

      <div className="space-y-2">
        <Row
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
          label="Customer sees"
          value={`${formatTime(customerStart)} – ${formatTime(customerEnd)}`}
          subtle
        />
        <Row
          icon={<Calendar className="w-4 h-4 text-primary" />}
          label="Your calendar blocks"
          value={`${formatTime(blockStart)} – ${formatTime(blockEnd)}`}
          highlight
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">Total time blocked</span>
        <span className="text-xs font-medium">{totalLabel}</span>
      </div>
    </Card>
  );
}

function Row({
  icon,
  label,
  value,
  subtle,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtle?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className={`text-xs ${subtle ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </span>
      </div>
      <span
        className={`text-sm font-medium tabular-nums ${
          highlight ? 'text-primary' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
