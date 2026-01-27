import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Package, TrendingUp } from 'lucide-react';
import { VendorBooking, VendorPackage } from '@/hooks/useVendorDashboard';
import { EventPreviewCard } from './EventPreviewCard';

interface VendorOverviewProps {
  bookings: VendorBooking[];
  packages: VendorPackage[];
  totalEarnings: number;
  pendingEarnings: number;
  upcomingBookings: VendorBooking[];
  onMessageClient?: (booking: VendorBooking) => void;
}

export function VendorOverview({
  bookings,
  packages,
  totalEarnings,
  pendingEarnings,
  upcomingBookings,
  onMessageClient
}: VendorOverviewProps) {
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(null);
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
  const activeListings = packages.filter(p => p.is_active).length;

  // Map package info to bookings for display
  const getPackageInfo = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? { name: pkg.name, category: pkg.category } : null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${pendingEarnings.toFixed(2)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Packages
            </CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">
              of {packages.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming bookings yet
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => {
                const pkgInfo = getPackageInfo(booking.package_id);
                return (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div>
                      <p className="font-medium">{pkgInfo?.name || booking.event_location}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {booking.event_city && ` • ${booking.event_city}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold gradient-text">${booking.total_price}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-trust/20 text-trust' 
                          : 'bg-yellow-500/20 text-yellow-600'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Preview Dialog */}
      {selectedBooking && (
        <EventPreviewCard
          open={!!selectedBooking}
          onOpenChange={(open) => !open && setSelectedBooking(null)}
          booking={{
            id: selectedBooking.id,
            event_date: selectedBooking.event_date,
            event_location: selectedBooking.event_location,
            event_city: selectedBooking.event_city,
            event_state: selectedBooking.event_state,
            start_time: selectedBooking.start_time,
            end_time: selectedBooking.end_time,
            duration_minutes: selectedBooking.duration_minutes,
            total_price: selectedBooking.total_price,
            status: selectedBooking.status,
            payment_status: selectedBooking.payment_status,
            customer_email: selectedBooking.customer_email,
            notes: selectedBooking.notes,
            package_name: getPackageInfo(selectedBooking.package_id)?.name,
            package_category: getPackageInfo(selectedBooking.package_id)?.category || undefined
          }}
          onMessageClient={onMessageClient ? () => onMessageClient(selectedBooking) : undefined}
        />
      )}
    </div>
  );
}
