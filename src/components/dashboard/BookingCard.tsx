import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, Clock, MapPin, MessageCircle, CreditCard, XCircle,
  Star, Receipt, Repeat, Lock, Radio, CheckCircle2, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BookingUiState,
  STATE_LABELS,
  deriveBookingState,
  getCancellationStatus,
  getEventStart,
  getEventEnd,
  CANCELLATION_RULES,
} from '@/lib/bookingState';
import type { BookingData } from '@/hooks/useBookings';

interface ExtendedBooking extends BookingData {
  payment_status?: string;
  deposit_amount?: number;
  final_amount?: number;
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
  deposit_percentage?: number;
  payment_method?: 'stripe' | 'cash';
}

interface BookingCardProps {
  booking: ExtendedBooking;
  isPaying?: boolean;
  isMessaging?: boolean;
  onMessage: (b: ExtendedBooking) => void;
  onPayNow: (b: ExtendedBooking) => void;
  onCancel: (b: ExtendedBooking) => void;
  onLeaveReview?: (b: ExtendedBooking) => void;
}

const TONE_CLASSES: Record<string, string> = {
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  neutral: 'bg-secondary text-foreground border-border',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
  live: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 animate-pulse',
};

export function BookingCard({
  booking,
  isPaying,
  isMessaging,
  onMessage,
  onPayNow,
  onCancel,
  onLeaveReview,
}: BookingCardProps) {
  const state: BookingUiState = deriveBookingState(booking);
  const meta = STATE_LABELS[state];
  const start = getEventStart(booking);
  const end = getEventEnd(booking);
  const cancelStatus = getCancellationStatus(booking);
  const policy = booking.cancellation_policy ?? 'standard';

  const initials = (booking.vendor_display_name ?? 'V')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isCancelled = state === 'cancelled';
  const isCompleted = state === 'completed';

  return (
    <Card
      className={`p-4 sm:p-5 transition-all ${
        isCancelled ? 'opacity-70' : ''
      } ${state === 'in_progress' ? 'ring-2 ring-rose-500/30' : ''}`}
    >
      {/* Status badge row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge
          variant="outline"
          className={`gap-1.5 font-medium ${TONE_CLASSES[meta.tone]}`}
        >
          {state === 'pending_vendor' && <Clock className="w-3 h-3" />}
          {state === 'awaiting_payment' && <CreditCard className="w-3 h-3" />}
          {state === 'confirmed_cancellable' && <CheckCircle2 className="w-3 h-3" />}
          {state === 'confirmed_locked' && <Lock className="w-3 h-3" />}
          {state === 'in_progress' && <Radio className="w-3 h-3" />}
          {state === 'completed' && <CheckCircle2 className="w-3 h-3" />}
          {state === 'cancelled' && <XCircle className="w-3 h-3" />}
          {meta.label}
        </Badge>

        <Link
          to={`/bookings/${booking.id}`}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Event Pro + package */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-11 w-11 shrink-0">
          <AvatarImage src={booking.vendor_avatar ?? undefined} alt={booking.vendor_display_name} />
          <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base leading-tight truncate">
            {booking.vendor_display_name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{booking.package_name}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="text-foreground">
            {!isNaN(start.getTime()) ? format(start, 'EEE, MMM d, yyyy') : 'Date TBD'}
            {booking.start_time && !isNaN(start.getTime()) && (
              <>
                {' · '}
                {format(start, 'h:mm a')}
                {booking.end_time && !isNaN(end.getTime()) ? `–${format(end, 'h:mm a')}` : ''}
              </>
            )}
          </span>
        </div>
        {booking.event_location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{booking.event_location}</span>
          </div>
        )}
      </div>

      {/* State-specific banner */}
      {state === 'awaiting_payment' && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mb-3 text-xs">
          <p className="font-medium text-blue-700 dark:text-blue-400">
            {booking.vendor_display_name} approved your booking.
          </p>
          <p className="text-muted-foreground mt-0.5">
            Complete payment to confirm your event. Event Pro availability is held briefly.
          </p>
        </div>
      )}
      {state === 'pending_vendor' && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 mb-3 text-xs text-muted-foreground">
          Waiting for Event Pro to approve your request. You'll be notified by email and in-app.
        </div>
      )}
      {state === 'confirmed_locked' && (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 mb-3 text-xs text-muted-foreground inline-flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>This booking can no longer be cancelled online — the event is too close. Message your Event Pro for any change requests.</span>
        </div>
      )}
      {state === 'in_progress' && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 mb-3 text-xs font-medium text-rose-700 dark:text-rose-400">
          Your event is live right now. Enjoy! Cancellations are no longer available.
        </div>
      )}
      {state === 'cancelled' && (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 mb-3 text-xs text-muted-foreground">
          This booking was cancelled.
        </div>
      )}

      {/* Refund hint while cancellable */}
      {state === 'confirmed_cancellable' && (
        <div className="text-[11px] text-muted-foreground mb-3">
          Cancellation policy: <span className="font-medium text-foreground">{CANCELLATION_RULES[policy].label}</span> ·
          {' '}{cancelStatus.refundPct === 100 ? 'Full refund available' : `${cancelStatus.refundPct}% refund window`}
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap gap-2">
        {state === 'pending_vendor' && (
          <>
            <Button size="sm" variant="outline" onClick={() => onMessage(booking)} disabled={isMessaging} className="rounded-full">
              {isMessaging ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5 mr-1.5" />}
              Message Event Pro
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onCancel(booking)} className="rounded-full text-destructive hover:text-destructive">
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Cancel request
            </Button>
          </>
        )}

        {state === 'awaiting_payment' && (
          <>
            <Button size="sm" variant="gradient" onClick={() => onPayNow(booking)} disabled={isPaying} className="rounded-full">
              {isPaying ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
              Pay now
            </Button>
            <Button size="sm" variant="outline" onClick={() => onMessage(booking)} disabled={isMessaging} className="rounded-full">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Message Event Pro
            </Button>
          </>
        )}

        {(state === 'confirmed_cancellable' || state === 'confirmed_locked') && (
          <>
            <Button size="sm" asChild variant="outline" className="rounded-full">
              <Link to={`/bookings/${booking.id}`}>View details</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onMessage(booking)} disabled={isMessaging} className="rounded-full">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Message Event Pro
            </Button>
            {state === 'confirmed_cancellable' && (
              <Button size="sm" variant="ghost" onClick={() => onCancel(booking)} className="rounded-full text-destructive hover:text-destructive ml-auto">
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            )}
          </>
        )}

        {state === 'in_progress' && (
          <>
            <Button size="sm" asChild variant="outline" className="rounded-full">
              <Link to={`/bookings/${booking.id}`}>View details</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onMessage(booking)} disabled={isMessaging} className="rounded-full">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Message Event Pro
            </Button>
          </>
        )}

        {state === 'completed' && (
          <>
            {onLeaveReview && (
              <Button size="sm" variant="gradient" onClick={() => onLeaveReview(booking)} className="rounded-full">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Leave review
              </Button>
            )}
            <Button size="sm" asChild variant="outline" className="rounded-full">
              <Link to={`/package/${booking.package_id}`}>
                <Repeat className="w-3.5 h-3.5 mr-1.5" />
                Book again
              </Link>
            </Button>
            <Button size="sm" asChild variant="ghost" className="rounded-full">
              <Link to={`/bookings/${booking.id}`}>
                <Receipt className="w-3.5 h-3.5 mr-1.5" />
                Receipt
              </Link>
            </Button>
          </>
        )}

        {state === 'cancelled' && (
          <>
            <Button size="sm" asChild variant="outline" className="rounded-full">
              <Link to={`/package/${booking.package_id}`}>
                <Repeat className="w-3.5 h-3.5 mr-1.5" />
                Book again
              </Link>
            </Button>
            <Button size="sm" asChild variant="ghost" className="rounded-full">
              <Link to={`/bookings/${booking.id}`}>View details</Link>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
