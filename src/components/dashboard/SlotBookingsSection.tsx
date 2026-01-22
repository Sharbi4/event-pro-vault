import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, MapPin, Clock, Loader2, Store, 
  ChevronRight, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { SlotBooking } from '@/hooks/useSlotBookings';
import { format, parseISO } from 'date-fns';

interface SlotBookingsSectionProps {
  bookings: SlotBooking[];
  loading: boolean;
  onCancel: (bookingId: string) => Promise<boolean>;
}

export function SlotBookingsSection({ bookings, loading, onCancel }: SlotBookingsSectionProps) {
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  const getStatusBadge = (status: SlotBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="verified" className="text-[10px] px-2 py-0.5 gap-1">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="glass" className="text-[10px] px-2 py-0.5 gap-1 bg-amber-500/20 text-amber-500 border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="trust" className="text-[10px] px-2 py-0.5 gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="glass" className="text-[10px] px-2 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card variant="glass" className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-1">No market bookings yet</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Reserve spots at local markets to sell your products
        </p>
        <Link to="/?mode=markets">
          <Button variant="gradient" size="sm" className="gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Find Markets
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <Card key={booking.id} variant="glow" className="p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {booking.marketName}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.slotTypeName} × {booking.quantity}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {booking.inventoryDate 
                    ? format(parseISO(booking.inventoryDate), 'MMM d, yyyy')
                    : 'Date TBD'}
                </span>
                {booking.startTime && booking.endTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span className="font-bold text-sm gradient-text">
                  ${booking.totalPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => onCancel(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Link to={`/market/${booking.marketId}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
                      View Market
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
