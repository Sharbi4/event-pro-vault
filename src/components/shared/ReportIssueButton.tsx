import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Clock } from 'lucide-react';

interface ReportIssueButtonProps {
  eventDate: string;
  eventEndTime?: string;
  paymentMethod?: string;
  onClick: () => void;
}

export function ReportIssueButton({
  eventDate,
  eventEndTime,
  paymentMethod,
  onClick,
}: ReportIssueButtonProps) {
  const { canReport, hoursRemaining, hasEventEnded } = useMemo(() => {
    // Only online payments are eligible
    if (paymentMethod === 'cash') {
      return { canReport: false, hoursRemaining: 0, hasEventEnded: false };
    }

    const eventDateTime = new Date(eventDate);
    // If end time is provided, use it; otherwise assume end of day
    if (eventEndTime) {
      const [hours, minutes] = eventEndTime.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
    } else {
      eventDateTime.setHours(23, 59, 59, 999);
    }

    const now = new Date();
    const hasEnded = now >= eventDateTime;
    
    // Event must have ended
    if (!hasEnded) {
      return { canReport: false, hoursRemaining: 0, hasEventEnded: false };
    }

    // Within 24 hours of event ending
    const windowEnd = new Date(eventDateTime.getTime() + 24 * 60 * 60 * 1000);
    const msRemaining = windowEnd.getTime() - now.getTime();
    const hours = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));

    return {
      canReport: msRemaining > 0,
      hoursRemaining: hours,
      hasEventEnded: true,
    };
  }, [eventDate, eventEndTime, paymentMethod]);

  // Don't show anything if event hasn't ended or payment is cash
  if (!hasEventEnded || paymentMethod === 'cash') {
    return null;
  }

  // Show expired state if window has passed
  if (!canReport) {
    return null; // Don't show button after 24 hours
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 px-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600"
          onClick={onClick}
        >
          <AlertTriangle className="w-3 h-3" />
          <span className="hidden sm:inline">Report Issue</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3 h-3" />
          <span>{hoursRemaining}h left to report</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
