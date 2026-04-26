import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHoldCountdown, type HoldState } from '@/hooks/useCheckoutHold';

interface CheckoutHoldBannerProps {
  hold: HoldState;
  className?: string;
}

/**
 * StyleSeat-style 15-minute hold countdown shown during checkout.
 * Renders nothing when no hold is active.
 */
export function CheckoutHoldBanner({ hold, className }: CheckoutHoldBannerProps) {
  if (hold.status === 'idle' || hold.status === 'released') return null;

  const isExpired = hold.status === 'expired';
  const isError = hold.status === 'error';
  const lowTime = hold.secondsRemaining > 0 && hold.secondsRemaining <= 60;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
        isExpired || isError
          ? 'border-destructive/40 bg-destructive/5 text-destructive'
          : lowTime
            ? 'border-warning/40 bg-warning/5 text-warning-foreground'
            : 'border-primary/30 bg-primary/5 text-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {isExpired || isError ? (
        <AlertCircle className="w-4 h-4 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 shrink-0" />
      )}
      <div className="flex-1">
        {isError ? (
          <p className="font-medium">{hold.error ?? 'Could not hold this time slot.'}</p>
        ) : isExpired ? (
          <p className="font-medium">Your hold expired. Pick a time to try again.</p>
        ) : (
          <p>
            <span className="font-semibold">{formatHoldCountdown(hold.secondsRemaining)}</span>{' '}
            <span className="text-muted-foreground">— this time is held for you. Complete checkout to confirm.</span>
          </p>
        )}
      </div>
    </div>
  );
}
