import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, MapPin, Calendar } from 'lucide-react';
import { VendorBooking } from '@/hooks/useVendorDashboard';

interface VendorBookingsProps {
  bookings: VendorBooking[];
  onUpdateStatus: (id: string, status: string) => Promise<unknown>;
}

export function VendorBookings({ bookings, onUpdateStatus }: VendorBookingsProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    await onUpdateStatus(id, status);
    setUpdating(null);
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined'
  );

  const BookingCard = ({ booking }: { booking: VendorBooking }) => {
    const isPast = new Date(booking.event_date) < new Date();
    const isPending = booking.status === 'pending';

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {new Date(booking.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{booking.event_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {booking.units} {booking.units === 1 ? 'unit' : 'units'}
                </span>
                {booking.add_ons && booking.add_ons.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{booking.add_ons.length} add-ons
                  </Badge>
                )}
              </div>
              {booking.notes && (
                <p className="text-sm text-muted-foreground italic">
                  "{booking.notes}"
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xl font-bold gradient-text">
                ${booking.total_price}
              </span>
              <Badge variant={
                booking.status === 'confirmed' ? 'default' :
                booking.status === 'pending' ? 'secondary' :
                booking.status === 'completed' ? 'outline' : 'destructive'
              }>
                {booking.status}
              </Badge>
              
              {isPending && !isPast && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    disabled={updating === booking.id}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(booking.id, 'declined')}
                    disabled={updating === booking.id}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}

              {booking.status === 'confirmed' && !isPast && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                  disabled={updating === booking.id}
                  className="text-destructive"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending bookings
              </p>
            ) : (
              pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No confirmed bookings
              </p>
            ) : (
              confirmedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No past bookings
              </p>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
