import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Clock, DollarSign, User, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BookingResult {
  id: string;
  event_date: string;
  event_location: string;
  event_city: string | null;
  event_state: string | null;
  start_time: string | null;
  end_time: string | null;
  total_price: number;
  status: string;
  payment_status: string | null;
  customer_email: string | null;
  created_at: string;
  package_name?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  awaiting_payment: { label: 'Awaiting Payment', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  confirmed: { label: 'Confirmed', className: 'bg-trust/10 text-trust' },
  completed: { label: 'Completed', className: 'bg-primary/10 text-primary' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
  declined: { label: 'Declined', className: 'bg-muted text-muted-foreground' },
  disputed: { label: 'Disputed', className: 'bg-destructive/10 text-destructive' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting Payment', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  cash_due: { label: 'Cash Due', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  deposit_paid: { label: 'Deposit Paid', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  awaiting_approval: { label: 'Awaiting Approval', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  paid: { label: 'Paid in Full', className: 'bg-trust/10 text-trust' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

export default function BookingStatus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a booking ID or email address');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    try {
      // Try searching by booking ID first
      let query = supabase
        .from('bookings')
        .select(`
          id,
          event_date,
          event_location,
          event_city,
          event_state,
          start_time,
          end_time,
          total_price,
          status,
          payment_status,
          customer_email,
          created_at,
          package_id
        `);

      // Check if it looks like a UUID (booking ID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery.trim());
      
      if (isUUID) {
        query = query.eq('id', searchQuery.trim());
      } else {
        // Search by email
        query = query.eq('customer_email', searchQuery.trim().toLowerCase());
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Fetch package name
        const { data: packageData } = await supabase
          .from('vendor_packages')
          .select('name')
          .eq('id', data.package_id)
          .single();

        setBooking({
          ...data,
          package_name: packageData?.name || 'Service Package',
        });
      } else {
        setError('No booking found with that ID or email address');
      }
    } catch (err) {
      console.error('Error searching booking:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Check Booking Status
            </h1>
            <p className="text-muted-foreground">
              Enter your booking ID or email address to view your booking details
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Booking ID or email address"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-center text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {booking && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl font-display">
                      {booking.package_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Booking ID: {booking.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <Badge className={statusConfig[booking.status]?.className || statusConfig.pending.className}>
                      {statusConfig[booking.status]?.label || booking.status}
                    </Badge>
                    {booking.payment_status && (
                      <Badge variant="outline" className={paymentStatusConfig[booking.payment_status]?.className || paymentStatusConfig.pending.className}>
                        {paymentStatusConfig[booking.payment_status]?.label || booking.payment_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    {booking.start_time && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(booking.start_time)}
                        {booking.end_time && ` – ${formatTime(booking.end_time)}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">
                      {[booking.event_location, booking.event_city, booking.event_state]
                        .filter(Boolean)
                        .join(', ') || 'Location TBD'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                {booking.customer_email && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{booking.customer_email}</p>
                    </div>
                  </div>
                )}

                <div className="h-px bg-border my-4" />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total</span>
                  </div>
                  <p className="text-lg font-semibold">${booking.total_price.toLocaleString()}</p>
                </div>

                {/* Booked on */}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          )}

          {searched && !booking && !error && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No booking found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
