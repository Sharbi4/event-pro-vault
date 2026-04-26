import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { CalendarBlockPreview } from './CalendarBlockPreview';

interface TimeAndBuffersProps {
  durationMinutes?: number;
  setupMinutes: number;
  cleanupMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeHours: number | null | undefined;
  onChange: (updates: {
    duration_minutes?: number;
    setup_minutes?: number;
    cleanup_minutes?: number;
    buffer_before_minutes?: number;
    buffer_after_minutes?: number;
    minimum_notice_hours?: number | null;
  }) => void;
}

const NOTICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'default', label: 'Use calendar default' },
  { value: '0', label: 'Same day' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days' },
  { value: '336', label: '14 days' },
];

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1.5 mt-1">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          step={5}
          value={value || 0}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="text-sm"
        />
        <span className="text-xs text-muted-foreground">min</span>
      </div>
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function TimeAndBuffers({
  durationMinutes,
  setupMinutes,
  cleanupMinutes,
  bufferBeforeMinutes,
  bufferAfterMinutes,
  minimumNoticeHours,
  onChange,
}: TimeAndBuffersProps) {
  const noticeValue =
    minimumNoticeHours === null || minimumNoticeHours === undefined
      ? 'default'
      : String(minimumNoticeHours);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <Label className="text-base font-semibold">Time this package needs</Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <NumberField
            label="Service duration"
            value={durationMinutes ?? 0}
            onChange={(n) => onChange({ duration_minutes: n })}
            hint="What customers book"
          />
          <NumberField
            label="Setup time"
            value={setupMinutes}
            onChange={(n) => onChange({ setup_minutes: n })}
          />
          <NumberField
            label="Cleanup time"
            value={cleanupMinutes}
            onChange={(n) => onChange({ cleanup_minutes: n })}
          />
          <NumberField
            label="Buffer before"
            value={bufferBeforeMinutes}
            onChange={(n) => onChange({ buffer_before_minutes: n })}
            hint="Travel / prep"
          />
          <NumberField
            label="Buffer after"
            value={bufferAfterMinutes}
            onChange={(n) => onChange({ buffer_after_minutes: n })}
            hint="Drive home / reset"
          />
        </div>
      </div>

      <CalendarBlockPreview
        durationMinutes={durationMinutes ?? 0}
        setupMinutes={setupMinutes}
        cleanupMinutes={cleanupMinutes}
        bufferBeforeMinutes={bufferBeforeMinutes}
        bufferAfterMinutes={bufferAfterMinutes}
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Minimum notice</Label>
        <p className="text-xs text-muted-foreground">
          How far in advance do customers need to book?
        </p>
        <Select
          value={noticeValue}
          onValueChange={(v) =>
            onChange({ minimum_notice_hours: v === 'default' ? null : parseInt(v, 10) })
          }
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTICE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
