import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { SlotType, SlotInventoryItem, WeeklyScheduleDay } from '@/hooks/useMarketSpaceOnboarding';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Copy, Loader2 } from 'lucide-react';

interface StepInventoryProps {
  slotTypes: SlotType[];
  inventory: SlotInventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<SlotInventoryItem[]>>;
  saveInventoryItem: (item: SlotInventoryItem) => Promise<string | null>;
  deleteInventoryItem: (id: string) => Promise<void>;
  bulkCreateInventory: (items: Omit<SlotInventoryItem, 'id'>[]) => Promise<void>;
  weeklySchedule: WeeklyScheduleDay[];
}

export function StepInventory({
  slotTypes,
  inventory,
  setInventory,
  saveInventoryItem,
  deleteInventoryItem,
  bulkCreateInventory,
  weeklySchedule,
}: StepInventoryProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlotType, setSelectedSlotType] = useState<string>('');
  const [totalSlots, setTotalSlots] = useState(10);
  const [creating, setCreating] = useState(false);

  const enabledDays = weeklySchedule.filter(d => d.isEnabled);
  const defaultSchedule = enabledDays[0] || { startTime: '08:00', endTime: '14:00' };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Slot Inventory
        </h2>
        <p className="text-sm text-muted-foreground">
          Set how many slots are available for each date.
        </p>
      </div>

      {slotTypes.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <p className="text-muted-foreground">Create slot types first to add inventory.</p>
        </Card>
      ) : (
        <>
          {/* Quick Add Form */}
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slot Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={selectedSlotType}
                  onChange={(e) => setSelectedSlotType(e.target.value)}
                >
                  <option value="">Select slot type</option>
                  {slotTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Total Slots Available</Label>
                <Input
                  type="number"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
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
              Add {selectedDates.length} Date{selectedDates.length !== 1 ? 's' : ''}
            </Button>
          </Card>

          {/* Inventory List */}
          {inventory.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Current Inventory</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {inventory.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{format(new Date(inv.date), 'EEE, MMM d')}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="text-sm">{getSlotTypeName(inv.slotTypeId)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{inv.slotsRemaining}/{inv.totalSlots} slots</Badge>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
