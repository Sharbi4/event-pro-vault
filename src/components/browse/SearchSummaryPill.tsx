import { format } from 'date-fns';
import { Search, MapPin, CalendarDays, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchSummaryPillProps {
  searchQuery: string;
  location: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  onEdit: () => void;
  onClear: () => void;
}

export function SearchSummaryPill({
  searchQuery,
  location,
  date,
  startTime,
  endTime,
  onEdit,
  onClear,
}: SearchSummaryPillProps) {
  const hasFilters = searchQuery || location || date || startTime;

  if (!hasFilters) return null;

  const formatTimeDisplay = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-full border border-border">
      <button 
        onClick={onEdit}
        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary/80 rounded-full transition-colors"
      >
        {searchQuery && (
          <span className="flex items-center gap-1 text-foreground">
            <Search className="w-3.5 h-3.5" />
            {searchQuery}
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1 text-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
        )}
        {date && (
          <span className="flex items-center gap-1 text-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {format(new Date(date), 'MMM d')}
          </span>
        )}
        {startTime && endTime && (
          <span className="flex items-center gap-1 text-foreground">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeDisplay(startTime)}–{formatTimeDisplay(endTime)}
          </span>
        )}
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full"
        onClick={onClear}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
