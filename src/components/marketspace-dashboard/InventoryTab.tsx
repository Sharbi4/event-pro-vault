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
import { SlotType, SlotInventoryItem, WeeklyScheduleDay } from '@/hooks/useMarketSpaceOnboarding';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface InventoryTabProps {
  slotTypes: SlotType[];
  inventory: SlotInventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<SlotInventoryItem[]>>;
  saveInventoryItem: (item: SlotInventoryItem) => Promise<string | null>;
  deleteInventoryItem: (id: string) => Promise<void>;
  bulkCreateInventory: (items: Omit<SlotInventoryItem, 'id'>[]) => Promise<void>;
  weeklySchedule: WeeklyScheduleDay[];
}

export function InventoryTab({
  slotTypes,
  inventory,
  setInventory,
  saveInventoryItem,
  deleteInventoryItem,
  bulkCreateInventory,
  weeklySchedule,
}: InventoryTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlotType, setSelectedSlotType] = useState<string>('');
  const [totalSlots, setTotalSlots] = useState(10);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Inventory Calendar</h2>
          <p className="text-sm text-muted-foreground">Manage slot availability by date</p>
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
                    <div key={`empty-${i}`} className="min-h-20" />
                  ))}
                  
                  {calendarDays.map(date => {
                    const dayInventory = getDayInventory(date);
                    const isPast = date < new Date();
                    const totalAvailable = dayInventory.reduce((acc, inv) => acc + inv.slotsRemaining, 0);
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`min-h-20 p-1 border rounded-lg ${
                          isPast ? 'bg-muted/30 opacity-50' : 'bg-background'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">{format(date, 'd')}</div>
                        {dayInventory.length > 0 && (
                          <div className="space-y-0.5">
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
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                  {slotTypes.map((st, idx) => (
                    <div key={st.id} className="flex items-center gap-1 text-xs">
                      <div className={`w-3 h-3 rounded ${getSlotTypeColor(st.id!)}`} />
                      <span>{st.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {inventory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No inventory created yet</p>
                  ) : (
                    inventory.map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded ${getSlotTypeColor(inv.slotTypeId)}`} />
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
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
