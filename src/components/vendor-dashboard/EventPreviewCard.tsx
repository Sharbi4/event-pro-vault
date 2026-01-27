import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Package, DollarSign, MessageCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface EventPreviewCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    event_date: string;
    event_location: string;
    event_city?: string | null;
    event_state?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    duration_minutes?: number | null;
    total_price: number;
    status: string;
    payment_status?: string | null;
    customer_email?: string | null;
    notes?: string | null;
    package_name?: string;
    package_category?: string;
  };
  onMessageClient?: () => void;
  onViewDetails?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmed', className: 'bg-trust/10 text-trust' },
  completed: { label: 'Completed', className: 'bg-primary/10 text-primary' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting Payment', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  deposit_paid: { label: 'Deposit Paid', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  paid: { label: 'Paid in Full', className: 'bg-trust/10 text-trust' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

export function EventPreviewCard({ 
  open, 
  onOpenChange, 
  booking,
  onMessageClient,
  onViewDetails 
}: EventPreviewCardProps) {
  const eventDate = new Date(booking.event_date);
  const status = statusConfig[booking.status] || statusConfig.pending;
  const paymentStatus = paymentStatusConfig[booking.payment_status || 'pending'] || paymentStatusConfig.pending;

  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  const locationDisplay = [
    booking.event_location,
    booking.event_city,
    booking.event_state
  ].filter(Boolean).join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-display">
                  {booking.package_name || 'Event Booking'}
                </DialogTitle>
                {booking.package_category && (
                  <p className="text-sm text-muted-foreground">{booking.package_category}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <Badge className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', paymentStatus.className)}>
                  {paymentStatus.label}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
              {booking.start_time && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(booking.start_time)}
                  {booking.end_time && ` – ${formatTime(booking.end_time)}`}
                  {booking.duration_minutes && ` (${Math.round(booking.duration_minutes / 60)}h)`}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/50">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{locationDisplay || 'Location TBD'}</p>
            </div>
          </div>

          {/* Customer */}
          {booking.customer_email && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{booking.customer_email}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{booking.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-lg font-semibold">${booking.total_price.toLocaleString()}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onMessageClient && (
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => {
                  onMessageClient();
                  onOpenChange(false);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
            )}
            {onViewDetails && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  onViewDetails();
                  onOpenChange(false);
                }}
              >
                <ExternalLink className="w-4 h-4" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
