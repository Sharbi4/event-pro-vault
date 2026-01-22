import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { SlotType } from '@/hooks/useMarketSpaceOnboarding';
import { format } from 'date-fns';
import { 
  Search, 
  MoreVertical, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Phone,
  DollarSign,
  Calendar,
  User,
  ClipboardList
} from 'lucide-react';

interface BookingsTabProps {
  bookings: SlotBooking[];
  slotTypes: SlotType[];
  updateBookingStatus: (bookingId: string, status: SlotBooking['status']) => Promise<void>;
}

export function BookingsTab({ bookings, slotTypes, updateBookingStatus }: BookingsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      booking.vendorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      booking.slotTypeName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SlotBooking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: SlotBooking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30">Unpaid</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Bookings</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} pending reservations` : 'Manage vendor reservations'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No bookings found</h3>
          <p className="text-sm text-muted-foreground">
            {bookings.length === 0 
              ? 'Vendor reservations will appear here once you start receiving them.'
              : 'Try adjusting your search or filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <Card key={booking.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {booking.vendorName || 'Unknown Vendor'}
                    </h3>
                    {getStatusBadge(booking.status)}
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {booking.vendorEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {booking.vendorEmail}
                      </span>
                    )}
                    {booking.vendorPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.vendorPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {booking.inventoryDate 
                      ? format(new Date(booking.inventoryDate), 'MMM d, yyyy')
                      : 'Date TBD'}
                  </div>
                  
                  {booking.slotTypeName && (
                    <Badge variant="outline">{booking.slotTypeName}</Badge>
                  )}
                  
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    ${booking.totalPrice.toFixed(2)}
                  </div>
                  
                  {booking.quantity > 1 && (
                    <Badge variant="secondary">×{booking.quantity}</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-green-600 border-green-500/50 hover:bg-green-500/10"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {booking.status === 'confirmed' && (
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')}>
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'cancelled' && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          Cancel Booking
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <strong>Notes:</strong> {booking.notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
