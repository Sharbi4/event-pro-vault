import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, MapPin, Clock, Loader2, Store, 
  ChevronRight, AlertCircle, CheckCircle, XCircle,
  CalendarDays, DollarSign, Tent
} from 'lucide-react';
import { SlotBooking } from '@/hooks/useSlotBookings';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';

interface VendorMarketBookingsProps {
  bookings: SlotBooking[];
  loading: boolean;
  onCancel: (bookingId: string) => Promise<boolean>;
}

export function VendorMarketBookings({ bookings, loading, onCancel }: VendorMarketBookingsProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  // Filter bookings by status
  const upcomingBookings = bookings.filter(b => 
    b.inventoryDate && isFuture(parseISO(b.inventoryDate)) && 
    (b.status === 'confirmed' || b.status === 'pending')
  );
  
  const todayBookings = bookings.filter(b => 
    b.inventoryDate && isToday(parseISO(b.inventoryDate)) &&
    (b.status === 'confirmed' || b.status === 'pending')
  );
  
  const pastBookings = bookings.filter(b => 
    b.inventoryDate && isPast(parseISO(b.inventoryDate)) && !isToday(parseISO(b.inventoryDate))
  );
  
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  // Stats
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalSpent = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    await onCancel(bookingId);
    setCancellingId(null);
  };

  const BookingCard = ({ booking }: { booking: SlotBooking }) => {
    const eventDate = booking.inventoryDate ? parseISO(booking.inventoryDate) : null;
    const isUpcoming = eventDate && isFuture(eventDate);
    const isEventToday = eventDate && isToday(eventDate);

    return (
      <Card variant="glow" className="overflow-hidden">
        <div className="flex">
          {/* Date badge */}
          <div className={`w-20 flex-shrink-0 flex flex-col items-center justify-center p-3 ${
            isEventToday ? 'bg-primary text-primary-foreground' : 
            isUpcoming ? 'bg-trust/10 text-trust' : 'bg-muted text-muted-foreground'
          }`}>
            {eventDate ? (
              <>
                <span className="text-2xl font-bold">{format(eventDate, 'd')}</span>
                <span className="text-xs uppercase">{format(eventDate, 'MMM')}</span>
                <span className="text-xs">{format(eventDate, 'yyyy')}</span>
              </>
            ) : (
              <span className="text-xs">TBD</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{booking.marketName}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tent className="w-3 h-3" />
                  {booking.slotTypeName} × {booking.quantity}
                </p>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            {booking.startTime && booking.endTime && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <Clock className="w-3 h-3" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="font-bold gradient-text">${booking.totalPrice.toFixed(2)}</span>
              <div className="flex items-center gap-2">
                {booking.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Cancel'
                    )}
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Market Bookings
            </CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length + todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayBookings.length > 0 && `${todayBookings.length} today`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Confirmation
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting host</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In market spots</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">No market bookings yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Reserve spots at local markets to sell your products and grow your business.
          </p>
          <Link to="/markets">
            <Button variant="gradient" className="gap-2">
              <Store className="w-4 h-4" />
              Browse Markets
            </Button>
          </Link>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              {(upcomingBookings.length + todayBookings.length) > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
                  {upcomingBookings.length + todayBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              Past
              {pastBookings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
                  {pastBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-2">
              Cancelled
              {cancelledBookings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
                  {cancelledBookings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {todayBookings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Today
                </h3>
                {todayBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {upcomingBookings.length > 0 && (
              <div className="space-y-3">
                {todayBookings.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground mt-6">Coming Up</h3>
                )}
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {upcomingBookings.length === 0 && todayBookings.length === 0 && (
              <Card variant="glass" className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming market events</p>
                <Link to="/markets" className="mt-3 inline-block">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Store className="w-4 h-4" />
                    Find Markets
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card variant="glass" className="p-6 text-center">
                <p className="text-muted-foreground">No past market events</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card variant="glass" className="p-6 text-center">
                <p className="text-muted-foreground">No cancelled bookings</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
