import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SlotType, SlotInventoryItem, WeeklyScheduleDay } from '@/hooks/useMarketSpaceOnboarding';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isToday } from 'date-fns';
import { 
  CalendarIcon, Plus, Trash2, Loader2, ChevronLeft, ChevronRight, 
  Users, Zap, Droplets, Wifi, Clock, Phone, Mail, Truck, Store 
} from 'lucide-react';

interface InventoryTabProps {
  slotTypes: SlotType[];
  inventory: SlotInventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<SlotInventoryItem[]>>;
  saveInventoryItem: (item: SlotInventoryItem) => Promise<string | null>;
  deleteInventoryItem: (id: string) => Promise<void>;
  bulkCreateInventory: (items: Omit<SlotInventoryItem, 'id'>[]) => Promise<void>;
  weeklySchedule: WeeklyScheduleDay[];
  bookings?: SlotBooking[];
}

export function InventoryTab({
  slotTypes,
  inventory,
  setInventory,
  saveInventoryItem,
  deleteInventoryItem,
  bulkCreateInventory,
  weeklySchedule,
  bookings = [],
}: InventoryTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlotType, setSelectedSlotType] = useState<string>('');
  const [totalSlots, setTotalSlots] = useState(10);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<SlotBooking | null>(null);

  const enabledDays = weeklySchedule.filter(d => d.isEnabled);
  const defaultSchedule = enabledDays[0] || { startTime: '08:00', endTime: '14:00' };

  // Group inventory by date for calendar view
  const inventoryByDate = useMemo(() => {
    const map = new Map<string, SlotInventoryItem[]>();
    inventory.forEach(inv => {
      const key = inv.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    });
    return map;
  }, [inventory]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, SlotBooking[]>();
    bookings.forEach(b => {
      if (b.inventoryDate) {
        const key = b.inventoryDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
      }
    });
    return map;
  }, [bookings]);

  const handleCreateInventory = async () => {
    if (!selectedSlotType || selectedDates.length === 0) return;
    
    setCreating(true);
    try {
      const items: Omit<SlotInventoryItem, 'id'>[] = selectedDates.map(date => ({
        slotTypeId: selectedSlotType,
        date: format(date, 'yyyy-MM-dd'),
        startTime: defaultSchedule.startTime,
        endTime: defaultSchedule.endTime,
        totalSlots,
        slotsRemaining: totalSlots,
      }));
      
      await bulkCreateInventory(items);
      setSelectedDates([]);
    } finally {
      setCreating(false);
    }
  };

  const getSlotTypeName = (id: string) => slotTypes.find(s => s.id === id)?.name || 'Unknown';
  const getSlotTypeColor = (id: string) => {
    const idx = slotTypes.findIndex(s => s.id === id);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[idx % colors.length];
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayInventory = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return inventoryByDate.get(dateStr) || [];
  };

  const getDayBookings = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookingsByDate.get(dateStr) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getVendorTypeIcon = (type?: string) => {
    switch (type) {
      case 'food-truck': return <Truck className="w-4 h-4" />;
      case 'booth': return <Store className="w-4 h-4" />;
      default: return <Store className="w-4 h-4" />;
    }
  };

  // Day detail modal content
  const renderDayDetail = () => {
    if (!selectedDate) return null;
    
    const dayInventory = getDayInventory(selectedDate);
    const dayBookings = getDayBookings(selectedDate);
    
    return (
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Inventory Summary */}
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Inventory</h3>
              {dayInventory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory for this date</p>
              ) : (
                <div className="space-y-2">
                  {dayInventory.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded ${getSlotTypeColor(inv.slotTypeId)}`} />
                        <div>
                          <div className="font-medium">{getSlotTypeName(inv.slotTypeId)}</div>
                          <div className="text-sm text-muted-foreground">{inv.startTime} - {inv.endTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={inv.slotsRemaining > 0 ? 'outline' : 'secondary'}>
                          {inv.slotsRemaining}/{inv.totalSlots} available
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => inv.id && deleteInventoryItem(inv.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Bookings for this day */}
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Bookings ({dayBookings.length})
              </h3>
              {dayBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings for this date</p>
              ) : (
                <div className="space-y-3">
                  {dayBookings.map(booking => (
                    <Card 
                      key={booking.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedBooking(booking);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(booking.status)}`} />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {getVendorTypeIcon(booking.vendorType)}
                              {booking.vendorName || 'Unnamed Vendor'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.slotTypeName} • {booking.vendorCategory || 'Uncategorized'}
                            </div>
                            {booking.isRecurring && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Week {booking.recurringWeekNumber} of recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <div className="text-sm font-medium mt-1">${booking.totalPrice}</div>
                        </div>
                      </div>
                      
                      {/* Quick setup info */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {booking.needsPower && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Zap className="w-3 h-3" /> Power
                          </Badge>
                        )}
                        {booking.needsWater && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Droplets className="w-3 h-3" /> Water
                          </Badge>
                        )}
                        {booking.needsWifi && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Wifi className="w-3 h-3" /> WiFi
                          </Badge>
                        )}
                        {booking.arrivalTime && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="w-3 h-3" /> {booking.arrivalTime}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Booking detail modal
  const renderBookingDetail = () => {
    if (!selectedBooking) return null;
    
    return (
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getVendorTypeIcon(selectedBooking.vendorType)}
              {selectedBooking.vendorName || 'Vendor Details'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <Badge variant={selectedBooking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                {selectedBooking.status}
              </Badge>
              <span className="text-lg font-bold">${selectedBooking.totalPrice}</span>
            </div>
            
            {/* Booking Info */}
            <Card className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedBooking.inventoryDate && format(new Date(selectedBooking.inventoryDate), 'EEE, MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slot Type</span>
                <span className="font-medium">{selectedBooking.slotTypeName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedBooking.vendorCategory || '-'}</span>
              </div>
              {selectedBooking.boothSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booth Size</span>
                  <span className="font-medium">{selectedBooking.boothSize}</span>
                </div>
              )}
            </Card>
            
            {/* Contact Info */}
            <Card className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Contact</h4>
              <div className="space-y-2">
                {selectedBooking.vendorEmail && (
                  <a 
                    href={`mailto:${selectedBooking.vendorEmail}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedBooking.vendorEmail}
                  </a>
                )}
                {selectedBooking.vendorPhone && (
                  <a 
                    href={`tel:${selectedBooking.vendorPhone}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedBooking.vendorPhone}
                  </a>
                )}
              </div>
            </Card>
            
            {/* Setup Requirements */}
            {(selectedBooking.needsPower || selectedBooking.needsWater || selectedBooking.needsWifi || selectedBooking.arrivalTime) && (
              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Setup Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.needsPower && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" /> 
                      Power {selectedBooking.powerAmps && `(${selectedBooking.powerAmps}A)`}
                    </Badge>
                  )}
                  {selectedBooking.needsWater && (
                    <Badge variant="secondary" className="gap-1">
                      <Droplets className="w-3 h-3" /> Water
                    </Badge>
                  )}
                  {selectedBooking.needsWifi && (
                    <Badge variant="secondary" className="gap-1">
                      <Wifi className="w-3 h-3" /> WiFi
                    </Badge>
                  )}
                  {selectedBooking.hasGenerator && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" /> Has Generator
                    </Badge>
                  )}
                </div>
                {selectedBooking.arrivalTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Arriving at {selectedBooking.arrivalTime}
                  </div>
                )}
                {selectedBooking.setupNotes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">{selectedBooking.setupNotes}</p>
                )}
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Inventory Calendar</h2>
            <p className="text-sm text-muted-foreground">Manage slot availability and view bookings by date</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {slotTypes.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-muted-foreground">Create slot types first to add inventory.</p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Add Panel */}
            <Card className="p-4 space-y-4 lg:col-span-1">
              <h3 className="font-medium">Quick Add Inventory</h3>
              
              <div className="space-y-2">
                <Label>Slot Type</Label>
                <Select value={selectedSlotType} onValueChange={setSelectedSlotType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {slotTypes.map(st => (
                      <SelectItem key={st.id} value={st.id!}>{st.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Slots</Label>
                <Input
                  type="number"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Dates</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <Button
                onClick={handleCreateInventory}
                disabled={!selectedSlotType || selectedDates.length === 0 || creating}
                className="w-full gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add {selectedDates.length || 0} Date{selectedDates.length !== 1 ? 's' : ''}
              </Button>
            </Card>

            {/* Calendar/List View */}
            <div className="lg:col-span-2">
              {viewMode === 'calendar' ? (
                <Card className="p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for start of month */}
                    {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-24" />
                    ))}
                    
                    {calendarDays.map(date => {
                      const dayInventory = getDayInventory(date);
                      const dayBookings = getDayBookings(date);
                      const isPast = date < new Date() && !isToday(date);
                      const hasBookings = dayBookings.length > 0;
                      const confirmedCount = dayBookings.filter(b => b.status === 'confirmed').length;
                      const pendingCount = dayBookings.filter(b => b.status === 'pending').length;
                      
                      return (
                        <Tooltip key={date.toISOString()}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => !isPast && setSelectedDate(date)}
                              className={`min-h-24 p-1 border rounded-lg transition-all cursor-pointer ${
                                isPast 
                                  ? 'bg-muted/30 opacity-50 cursor-not-allowed' 
                                  : 'bg-background hover:border-primary/50 hover:shadow-sm'
                              } ${isToday(date) ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                                  {format(date, 'd')}
                                </span>
                                {hasBookings && (
                                  <div className="flex items-center gap-0.5">
                                    <Users className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">{dayBookings.length}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Inventory indicators */}
                              {dayInventory.length > 0 && (
                                <div className="space-y-0.5 mb-1">
                                  {dayInventory.slice(0, 2).map(inv => (
                                    <div
                                      key={inv.id}
                                      className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${getSlotTypeColor(inv.slotTypeId)}`}
                                    >
                                      {inv.slotsRemaining}/{inv.totalSlots}
                                    </div>
                                  ))}
                                  {dayInventory.length > 2 && (
                                    <div className="text-[10px] text-muted-foreground">
                                      +{dayInventory.length - 2} more
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Booking status dots */}
                              {hasBookings && (
                                <div className="flex gap-0.5 flex-wrap mt-auto">
                                  {confirmedCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] px-1 rounded bg-green-100 text-green-700">
                                      {confirmedCount} ✓
                                    </span>
                                  )}
                                  {pendingCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] px-1 rounded bg-yellow-100 text-yellow-700">
                                      {pendingCount} ⏳
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="font-medium">{format(date, 'EEEE, MMM d')}</p>
                            <p className="text-xs text-muted-foreground">
                              {dayInventory.length} slot type{dayInventory.length !== 1 ? 's' : ''} • {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                            </p>
                            {hasBookings && (
                              <p className="text-xs mt-1">
                                Click to view Vendor details
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Slot Types:</span>
                      {slotTypes.map((st) => (
                        <div key={st.id} className="flex items-center gap-1 text-xs">
                          <div className={`w-3 h-3 rounded ${getSlotTypeColor(st.id!)}`} />
                          <span>{st.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">Bookings:</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="inline-block px-1 rounded bg-green-100 text-green-700">✓</span>
                        <span>Confirmed</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="inline-block px-1 rounded bg-yellow-100 text-yellow-700">⏳</span>
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {inventory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No inventory created yet</p>
                    ) : (
                      inventory.map(inv => {
                        const dateBookings = bookingsByDate.get(inv.date) || [];
                        const invBookings = dateBookings.filter(b => b.slotTypeId === inv.slotTypeId);
                        
                        return (
                          <div
                            key={inv.id}
                            className="p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded ${getSlotTypeColor(inv.slotTypeId)}`} />
                                <div>
                                  <div className="font-medium">
                                    {format(new Date(inv.date), 'EEE, MMM d, yyyy')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {getSlotTypeName(inv.slotTypeId)} • {inv.startTime} - {inv.endTime}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={inv.slotsRemaining > 0 ? 'outline' : 'secondary'}>
                                  {inv.slotsRemaining}/{inv.totalSlots} available
                                </Badge>
                                {invBookings.length > 0 && (
                                  <Badge variant="default" className="gap-1">
                                    <Users className="w-3 h-3" />
                                    {invBookings.length}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => inv.id && deleteInventoryItem(inv.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Show bookings for this inventory item */}
                            {invBookings.length > 0 && (
                              <div className="mt-3 pt-3 border-t space-y-2">
                                {invBookings.map(booking => (
                                  <div 
                                    key={booking.id}
                                    className="flex items-center justify-between p-2 bg-background rounded cursor-pointer hover:bg-accent/50"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`} />
                                      <span className="text-sm font-medium">{booking.vendorName}</span>
                                      <span className="text-xs text-muted-foreground">{booking.vendorCategory}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {booking.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* Modals */}
        {renderDayDetail()}
        {renderBookingDetail()}
      </div>
    </TooltipProvider>
  );
}
