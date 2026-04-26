import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, MessageCircle, CreditCard, DollarSign, Eye, Ban, CalendarPlus } from 'lucide-react';
import { LIFECYCLE_LABEL, LIFECYCLE_TONE } from '@/lib/bookingLifecycle';
import { cn } from '@/lib/utils';

const TONE_CLASSES: Record<string, string> = {
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
  neutral: 'bg-muted text-muted-foreground border-border',
  danger: 'bg-destructive/15 text-destructive border-destructive/40',
};

interface BookingCommandCardProps {
  booking: any;
  onView?: (b: any) => void;
  onMessage?: (b: any) => void;
  onSendPaymentLink?: (b: any) => void;
  onMarkPaidInPerson?: (b: any) => void;
  onCancel?: (b: any) => void;
  onBlockMore?: (b: any) => void;
}

export function BookingCommandCard({
  booking, onView, onMessage, onSendPaymentLink, onMarkPaidInPerson, onCancel, onBlockMore,
}: BookingCommandCardProps) {
  const lifecycle = (booking.lifecycle_status ?? 'pending_vendor_approval') as keyof typeof LIFECYCLE_LABEL;
  const tone = LIFECYCLE_TONE[lifecycle] ?? 'neutral';
  const eventStart = booking.event_start_at ? new Date(booking.event_start_at) : null;
  const eventEnd = booking.event_end_at ? new Date(booking.event_end_at) : null;
  const blockStart = booking.calendar_block_start ? new Date(booking.calendar_block_start) : eventStart;
  const blockEnd = booking.calendar_block_end ? new Date(booking.calendar_block_end) : eventEnd;
  const eventDate = booking.event_date ? new Date(booking.event_date + 'T00:00:00') : eventStart;

  const depositAmount = (booking.deposit_amount ?? 0) / 100;
  const finalAmount = (booking.final_amount ?? 0) / 100;
  const depositPaid = !!booking.deposit_paid_at;
  const finalPaid = !!booking.final_paid_at;
  const balanceDue = depositPaid && !finalPaid && finalAmount > 0;
  const allowsInPerson = !!booking.allow_in_person_balance;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-semibold">
              {eventDate ? format(eventDate, 'EEE, MMM d, yyyy') : '—'}
            </span>
            <Badge variant="outline" className={cn('text-[10px]', TONE_CLASSES[tone])}>
              {LIFECYCLE_LABEL[lifecycle] ?? booking.status}
            </Badge>
          </div>

          {eventStart && eventEnd && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Service {format(eventStart, 'h:mma')}–{format(eventEnd, 'h:mma')}
              </span>
              {blockStart && blockEnd && (blockStart < eventStart || blockEnd > eventEnd) && (
                <span className="opacity-70">
                  · Blocked {format(blockStart, 'h:mma')}–{format(blockEnd, 'h:mma')}
                </span>
              )}
            </div>
          )}

          {booking.event_location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{booking.event_location}</span>
            </div>
          )}

          {booking.customer_email && (
            <div className="text-xs text-muted-foreground truncate">
              {booking.customer_email}
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold">${Number(booking.total_price ?? 0).toFixed(0)}</div>
          {(depositAmount > 0 || finalAmount > 0) && (
            <div className="text-[10px] text-muted-foreground space-y-0.5 mt-0.5">
              <div>Deposit ${depositAmount.toFixed(0)} {depositPaid && <span className="text-emerald-500">✓</span>}</div>
              <div>Balance ${finalAmount.toFixed(0)} {finalPaid && <span className="text-emerald-500">✓</span>}</div>
            </div>
          )}
        </div>
      </div>

      {balanceDue && (
        <div className="rounded-md bg-blue-500/10 border border-blue-500/30 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
          Balance of <strong>${finalAmount.toFixed(2)}</strong> still due
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {onView && (
          <Button size="sm" variant="outline" onClick={() => onView(booking)}>
            <Eye className="w-3.5 h-3.5 mr-1" /> View
          </Button>
        )}
        {onMessage && booking.customer_email && (
          <Button size="sm" variant="outline" onClick={() => onMessage(booking)}>
            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Message
          </Button>
        )}
        {balanceDue && onSendPaymentLink && (
          <Button size="sm" variant="default" onClick={() => onSendPaymentLink(booking)}>
            <CreditCard className="w-3.5 h-3.5 mr-1" /> Send payment link
          </Button>
        )}
        {balanceDue && allowsInPerson && onMarkPaidInPerson && (
          <Button size="sm" variant="outline" onClick={() => onMarkPaidInPerson(booking)}>
            <DollarSign className="w-3.5 h-3.5 mr-1" /> Mark paid in person
          </Button>
        )}
        {onBlockMore && (
          <Button size="sm" variant="ghost" onClick={() => onBlockMore(booking)}>
            <CalendarPlus className="w-3.5 h-3.5 mr-1" /> Block more time
          </Button>
        )}
        {onCancel && (
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onCancel(booking)}>
            <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
