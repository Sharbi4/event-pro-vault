import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimeRangePickerProps {
  startTime: string | null;
  endTime: string | null;
  onStartTimeChange: (time: string | null) => void;
  onEndTimeChange: (time: string | null) => void;
}

const timeOptions = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '23:00', label: '11:00 PM' },
];

export function TimeRangePicker({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange 
}: TimeRangePickerProps) {
  const getEndTimeOptions = () => {
    if (!startTime) return timeOptions;
    const startIndex = timeOptions.findIndex(t => t.value === startTime);
    return timeOptions.slice(startIndex + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select 
        value={startTime || ''} 
        onValueChange={(val) => onStartTimeChange(val || null)}
      >
        <SelectTrigger className="h-11 w-[100px] bg-card border-border text-sm">
          <SelectValue placeholder="Start" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="clear" className="text-muted-foreground">Clear</SelectItem>
          {timeOptions.map((time) => (
            <SelectItem key={time.value} value={time.value}>
              {time.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-sm">to</span>
      <Select 
        value={endTime || ''} 
        onValueChange={(val) => onEndTimeChange(val || null)}
        disabled={!startTime}
      >
        <SelectTrigger className="h-11 w-[100px] bg-card border-border text-sm">
          <SelectValue placeholder="End" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="clear" className="text-muted-foreground">Clear</SelectItem>
          {getEndTimeOptions().map((time) => (
            <SelectItem key={time.value} value={time.value}>
              {time.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
