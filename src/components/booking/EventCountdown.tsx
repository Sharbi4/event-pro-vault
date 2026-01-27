import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, isToday } from 'date-fns';

interface EventCountdownProps {
  eventDate: Date;
  className?: string;
  compact?: boolean;
}

export function EventCountdown({ eventDate, className = '', compact = false }: EventCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isPast(eventDate)) {
    return (
      <div className={`flex items-center gap-1.5 text-muted-foreground ${className}`}>
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs">Event completed</span>
      </div>
    );
  }

  if (isToday(eventDate)) {
    return (
      <div className={`flex items-center gap-1.5 text-primary font-medium ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs">Today!</span>
      </div>
    );
  }

  const days = differenceInDays(eventDate, now);
  const hours = differenceInHours(eventDate, now) % 24;
  const minutes = differenceInMinutes(eventDate, now) % 60;

  if (compact) {
    if (days > 0) {
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">
            {days}d {hours}h
          </span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1.5 text-primary ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs font-medium">{hours}h {minutes}m</span>
      </div>
    );
  }

  // Full display
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">Countdown</span>
      </div>
      <div className="flex items-center gap-2">
        {days > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold leading-none">{days}</p>
            <p className="text-[10px] text-muted-foreground">days</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-bold leading-none">{hours}</p>
          <p className="text-[10px] text-muted-foreground">hrs</p>
        </div>
        {days === 0 && (
          <div className="text-center">
            <p className="text-lg font-bold leading-none">{minutes}</p>
            <p className="text-[10px] text-muted-foreground">min</p>
          </div>
        )}
      </div>
    </div>
  );
}
