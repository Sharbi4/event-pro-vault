import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle, XCircle, Info } from 'lucide-react';

interface DepositRefundIndicatorProps {
  bookingCreatedAt: string;
  eventDate: string;
  depositPaidAt?: string | null;
  depositAmount?: number; // in cents
  className?: string;
}

export function DepositRefundIndicator({
  bookingCreatedAt,
  eventDate,
  depositPaidAt,
  depositAmount = 0,
  className = '',
}: DepositRefundIndicatorProps) {
  // Only show if there's a deposit that was paid
  if (!depositPaidAt || depositAmount <= 0) {
    return null;
  }

  const { isRefundable, reason, timeRemaining } = useMemo(() => {
    const now = new Date();
    const createdAt = new Date(bookingCreatedAt);
    const event = new Date(eventDate);
    
    // Calculate time since booking
    const hoursSinceBooking = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // Calculate days until event
    const daysUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Grace period: within 1 hour of booking AND event is 7+ days away
    const withinGracePeriod = hoursSinceBooking < 1;
    const eventFarEnough = daysUntilEvent >= 7;
    
    if (withinGracePeriod && eventFarEnough) {
      // Calculate remaining time in grace period
      const minutesRemaining = Math.max(0, Math.ceil(60 - (hoursSinceBooking * 60)));
      return {
        isRefundable: true,
        reason: 'Grace period active',
        timeRemaining: minutesRemaining,
      };
    }
    
    if (!eventFarEnough && withinGracePeriod) {
      return {
        isRefundable: false,
        reason: 'Event is less than 7 days away',
        timeRemaining: null,
      };
    }
    
    return {
      isRefundable: false,
      reason: 'Grace period expired (1 hour after booking)',
      timeRemaining: null,
    };
  }, [bookingCreatedAt, eventDate]);

  const depositDollars = depositAmount / 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex ${className}`}>
            {isRefundable ? (
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 gap-1 bg-green-500/10 text-green-600 border-green-500/30 cursor-help"
              >
                <Clock className="w-3 h-3" />
                Deposit refundable ({timeRemaining}m left)
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 gap-1 bg-muted text-muted-foreground border-border cursor-help"
              >
                <Info className="w-3 h-3" />
                Deposit non-refundable
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <p className="font-medium">
              {isRefundable ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Your ${depositDollars.toFixed(0)} deposit is refundable
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <XCircle className="w-3 h-3" />
                  Your ${depositDollars.toFixed(0)} deposit is non-refundable
                </span>
              )}
            </p>
            <p className="text-muted-foreground">{reason}</p>
            <div className="pt-1 border-t border-border text-muted-foreground">
              <p className="font-medium mb-1">Deposit refund policy:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Refundable if Vendor cancels</li>
                <li>Refundable within 1 hour of booking if event is 7+ days away</li>
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
