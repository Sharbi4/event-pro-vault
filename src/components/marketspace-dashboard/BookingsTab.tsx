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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { SlotType } from '@/hooks/useMarketSpaceOnboarding';
import { format } from 'date-fns';
import { 
  Search, 
  MoreVertical, 
  Check, 
  X, 
  Mail, 
  Phone,
  DollarSign,
  Calendar,
  ClipboardList,
  Eye,
  Truck,
  Tent,
  Zap,
  Droplets,
  Wifi,
  Clock,
  MapPin,
  RefreshCw,
  Download,
  MessageSquare,
  User,
  Tag,
  Info,
  FileText,
  Undo2
} from 'lucide-react';
import { CancellationDialog } from '@/components/shared/CancellationDialog';

interface BookingsTabProps {
  bookings: SlotBooking[];
  slotTypes: SlotType[];
  updateBookingStatus: (bookingId: string, status: SlotBooking['status']) => Promise<void>;
}

export function BookingsTab({ bookings, slotTypes, updateBookingStatus }: BookingsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<SlotBooking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<SlotBooking | null>(null);

  const now = new Date();
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      booking.vendorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      booking.slotTypeName?.toLowerCase().includes(search.toLowerCase()) ||
      booking.vendorCategory?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Date filter
    let matchesDate = true;
    if (booking.inventoryDate) {
      const bookingDate = new Date(booking.inventoryDate);
      if (dateFilter === 'upcoming') {
        matchesDate = bookingDate >= now;
      } else if (dateFilter === 'past') {
        matchesDate = bookingDate < now;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort by date
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!a.inventoryDate || !b.inventoryDate) return 0;
    const dateA = new Date(a.inventoryDate);
    const dateB = new Date(b.inventoryDate);
    return dateFilter === 'past' 
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
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

  const getVendorTypeIcon = (type?: string) => {
    switch (type) {
      case 'food_truck':
        return <Truck className="w-4 h-4" />;
      case 'trailer':
        return <Truck className="w-4 h-4" />;
      default:
        return <Tent className="w-4 h-4" />;
    }
  };

  const formatVendorType = (type?: string) => {
    if (!type) return 'Booth';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const upcomingCount = bookings.filter(b => {
    if (!b.inventoryDate) return false;
    return new Date(b.inventoryDate) >= now && b.status !== 'cancelled';
  }).length;

  // Calculate earnings
  const totalEarnings = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.baseAmount || b.totalPrice), 0);

  const openBookingDetails = (booking: SlotBooking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const exportBookings = () => {
    const csv = [
      ['Date', 'Vendor Name', 'Category', 'Slot Type', 'Status', 'Payment', 'Total'].join(','),
      ...sortedBookings.map(b => [
        b.inventoryDate || '',
        b.vendorName || '',
        b.vendorCategory || '',
        b.slotTypeName || '',
        b.status,
        b.paymentStatus,
        b.totalPrice.toFixed(2)
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Collected</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Vendor Reservations</h2>
          <p className="text-sm text-muted-foreground">
            {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportBookings} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor name, email, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
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
      {sortedBookings.length === 0 ? (
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
        <div className="space-y-3">
          {sortedBookings.map(booking => (
            <Card 
              key={booking.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openBookingDetails(booking)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Date Badge */}
                <div className="flex lg:flex-col items-center gap-2 lg:gap-0 lg:w-16 lg:text-center shrink-0">
                  {booking.inventoryDate ? (
                    <>
                      <span className="text-xs text-muted-foreground uppercase">
                        {format(new Date(booking.inventoryDate), 'EEE')}
                      </span>
                      <span className="text-xl font-bold text-foreground">
                        {format(new Date(booking.inventoryDate), 'd')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(booking.inventoryDate), 'MMM')}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">TBD</span>
                  )}
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground">
                      {booking.vendorName || 'Unknown Vendor'}
                    </h3>
                    {getStatusBadge(booking.status)}
                    {getPaymentBadge(booking.paymentStatus)}
                    {booking.isRecurring && (
                      <Badge variant="outline" className="gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {booking.vendorCategory && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {booking.vendorCategory}
                      </span>
                    )}
                    {booking.vendorType && (
                      <span className="flex items-center gap-1">
                        {getVendorTypeIcon(booking.vendorType)}
                        {formatVendorType(booking.vendorType)}
                      </span>
                    )}
                    {booking.boothSize && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.boothSize}
                      </span>
                    )}
                  </div>
                </div>

                {/* Slot & Price */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {booking.slotTypeName && (
                    <Badge variant="outline">{booking.slotTypeName}</Badge>
                  )}
                  
                  {/* Amenities icons */}
                  <div className="flex items-center gap-1">
                    {booking.needsPower && (
                      <span className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center" title="Power needed">
                        <Zap className="w-3 h-3 text-amber-500" />
                      </span>
                    )}
                    {booking.needsWater && (
                      <span className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center" title="Water needed">
                        <Droplets className="w-3 h-3 text-blue-500" />
                      </span>
                    )}
                    {booking.needsWifi && (
                      <span className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center" title="WiFi needed">
                        <Wifi className="w-3 h-3 text-purple-500" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    {booking.totalPrice.toFixed(2)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-green-600 border-green-500/50 hover:bg-green-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBookingStatus(booking.id, 'confirmed');
                        }}
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBookingStatus(booking.id, 'cancelled');
                        }}
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openBookingDetails(booking)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {booking.vendorEmail && (
                        <DropdownMenuItem asChild>
                          <a href={`mailto:${booking.vendorEmail}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Vendor
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {booking.status === 'confirmed' && (
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'cancelled' && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setBookingToCancel(booking);
                            setCancelDialogOpen(true);
                          }}
                        >
                          <Undo2 className="w-4 h-4 mr-2" />
                          {booking.paymentStatus === 'paid' ? 'Cancel & Refund' : 'Cancel Booking'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Booking Details
              {selectedBooking && getStatusBadge(selectedBooking.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="vendor">Vendor Info</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Event Date</span>
                    </div>
                    <p className="font-semibold">
                      {selectedBooking.inventoryDate 
                        ? format(new Date(selectedBooking.inventoryDate), 'EEEE, MMMM d, yyyy')
                        : 'Not set'}
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">Slot Type</span>
                    </div>
                    <p className="font-semibold">{selectedBooking.slotTypeName || 'N/A'}</p>
                  </Card>
                </div>

                {/* Setup Requirements */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Setup Requirements
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vendor Type:</span>
                      <p className="font-medium">{formatVendorType(selectedBooking.vendorType)}</p>
                    </div>
                    {selectedBooking.boothSize && (
                      <div>
                        <span className="text-muted-foreground">Booth Size:</span>
                        <p className="font-medium">{selectedBooking.boothSize}</p>
                      </div>
                    )}
                    {selectedBooking.truckLengthFeet && (
                      <div>
                        <span className="text-muted-foreground">Truck Length:</span>
                        <p className="font-medium">{selectedBooking.truckLengthFeet} ft</p>
                      </div>
                    )}
                    {selectedBooking.arrivalTime && (
                      <div>
                        <span className="text-muted-foreground">Arrival Time:</span>
                        <p className="font-medium">{selectedBooking.arrivalTime}</p>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedBooking.needsPower && (
                      <Badge variant="outline" className="gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Power {selectedBooking.powerAmps ? `(${selectedBooking.powerAmps}A)` : ''}
                      </Badge>
                    )}
                    {selectedBooking.needsWater && (
                      <Badge variant="outline" className="gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        Water
                      </Badge>
                    )}
                    {selectedBooking.needsWifi && (
                      <Badge variant="outline" className="gap-1">
                        <Wifi className="w-3 h-3 text-purple-500" />
                        WiFi
                      </Badge>
                    )}
                    {selectedBooking.hasGenerator && (
                      <Badge variant="outline" className="gap-1">
                        <Zap className="w-3 h-3 text-green-500" />
                        Has Generator
                      </Badge>
                    )}
                  </div>
                </Card>

                {/* Notes */}
                {(selectedBooking.notes || selectedBooking.setupNotes) && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h4>
                    {selectedBooking.notes && (
                      <p className="text-sm text-muted-foreground mb-2">{selectedBooking.notes}</p>
                    )}
                    {selectedBooking.setupNotes && (
                      <div className="text-sm">
                        <span className="font-medium">Setup Notes:</span>
                        <p className="text-muted-foreground">{selectedBooking.setupNotes}</p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Recurring Info */}
                {selectedBooking.isRecurring && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <span className="font-medium">Recurring Booking</span>
                    </div>
                    {selectedBooking.recurringWeekNumber && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Week {selectedBooking.recurringWeekNumber} of series
                      </p>
                    )}
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="vendor" className="space-y-4 mt-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedBooking.vendorName || 'Unknown Vendor'}</h3>
                      {selectedBooking.vendorCategory && (
                        <Badge variant="outline">{selectedBooking.vendorCategory}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedBooking.vendorEmail && (
                      <a 
                        href={`mailto:${selectedBooking.vendorEmail}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span>{selectedBooking.vendorEmail}</span>
                      </a>
                    )}
                    {selectedBooking.vendorPhone && (
                      <a 
                        href={`tel:${selectedBooking.vendorPhone}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <span>{selectedBooking.vendorPhone}</span>
                      </a>
                    )}
                  </div>
                </Card>

                <div className="flex gap-2">
                  {selectedBooking.vendorEmail && (
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <a href={`mailto:${selectedBooking.vendorEmail}`}>
                        <Mail className="w-4 h-4" />
                        Email Vendor
                      </a>
                    </Button>
                  )}
                  {selectedBooking.vendorPhone && (
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <a href={`tel:${selectedBooking.vendorPhone}`}>
                        <Phone className="w-4 h-4" />
                        Call Vendor
                      </a>
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 mt-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Payment Status</h4>
                    {getPaymentBadge(selectedBooking.paymentStatus)}
                  </div>

                  <div className="space-y-2 text-sm">
                    {selectedBooking.baseAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slot Price</span>
                        <span>${selectedBooking.baseAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedBooking.platformFeeAmount && selectedBooking.platformFeeAmount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Platform Fee ({((selectedBooking.platformFeeRate || 0.129) * 100).toFixed(1)}%)</span>
                        <span>${selectedBooking.platformFeeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Total Charged</span>
                      <span className="text-green-600">${selectedBooking.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Payout (after fees)</span>
                    <span className="font-semibold">
                      ${(selectedBooking.baseAmount || selectedBooking.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod === 'stripe' ? 'Online (Stripe)' : 'Cash'}</p>
                    <p className="mt-1"><strong>Booked:</strong> {format(new Date(selectedBooking.createdAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Action Buttons */}
          {selectedBooking && (
            <div className="flex gap-2 mt-4">
              {selectedBooking.status === 'pending' && (
                <>
                  <Button 
                    className="flex-1 gap-2"
                    variant="gradient"
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'confirmed');
                      setDetailsOpen(false);
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Confirm Booking
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      setDetailsOpen(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'completed');
                    setDetailsOpen(false);
                  }}
                >
                  <Check className="w-4 h-4" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      {bookingToCancel && (
        <CancellationDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          bookingId={bookingToCancel.id}
          bookingType="slot_booking"
          totalPaid={bookingToCancel.totalPrice}
          eventDate={bookingToCancel.inventoryDate}
          isPaid={bookingToCancel.paymentStatus === 'paid'}
          onSuccess={() => {
            setBookingToCancel(null);
            updateBookingStatus(bookingToCancel.id, 'cancelled');
          }}
        />
      )}
    </div>
  );
}