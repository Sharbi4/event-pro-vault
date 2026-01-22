import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem, SlotType } from '@/hooks/useMarketDetail';

interface InventoryPickerProps {
  inventory: InventoryItem[];
  slotType: SlotType | null;
  selectedDate: Date | undefined;
  selectedInventoryId: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onInventorySelect: (inventoryId: string) => void;
}

export function InventoryPicker({
  inventory,
  slotType,
  selectedDate,
  selectedInventoryId,
  onDateSelect,
  onInventorySelect,
}: InventoryPickerProps) {
  // Filter inventory for selected slot type
  const filteredInventory = useMemo(() => {
    if (!slotType) return inventory;
    return inventory.filter(inv => inv.slotTypeId === slotType.id);
  }, [inventory, slotType]);

  // Get dates with available inventory
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    filteredInventory.forEach(inv => {
      if (inv.slotsRemaining > 0) {
        dates.add(inv.date);
      }
    });
    return dates;
  }, [filteredInventory]);

  // Get time windows for selected date
  const timeWindows = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return filteredInventory.filter(inv => inv.date === dateStr);
  }, [filteredInventory, selectedDate]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDates.has(dateStr);
  };

  if (!slotType) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Select a slot type to see available dates</p>
      </div>
    );
  }

  if (filteredInventory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No upcoming availability for this slot type</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today || !isDateAvailable(date);
          }}
          modifiers={{
            available: (date) => isDateAvailable(date),
          }}
          modifiersStyles={{
            available: {
              fontWeight: 'bold',
              backgroundColor: 'hsl(var(--trust) / 0.1)',
            },
          }}
          className={cn("p-3 pointer-events-auto rounded-lg border border-border")}
        />
      </div>

      {/* Time Windows */}
      {selectedDate && timeWindows.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Time Window</Label>
          <RadioGroup 
            value={selectedInventoryId} 
            onValueChange={onInventorySelect}
            className="space-y-2"
          >
            {timeWindows.map(window => {
              const isSoldOut = window.slotsRemaining <= 0;
              const price = window.priceOverride || slotType.price;
              
              return (
                <div 
                  key={window.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                    isSoldOut 
                      ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                      : selectedInventoryId === window.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 cursor-pointer"
                  )}
                >
                  <RadioGroupItem 
                    value={window.id} 
                    id={window.id} 
                    disabled={isSoldOut}
                  />
                  <Label 
                    htmlFor={window.id} 
                    className={cn(
                      "flex-1 flex items-center justify-between",
                      !isSoldOut && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatTime(window.startTime)} – {formatTime(window.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {isSoldOut ? (
                          <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                        ) : (
                          <span className="text-sm">
                            {window.slotsRemaining}/{window.totalSlots}
                          </span>
                        )}
                      </div>
                      {window.priceOverride && (
                        <Badge variant="secondary" className="text-xs">
                          ${price}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}

      {selectedDate && timeWindows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No time windows available for this date
        </p>
      )}
    </div>
  );
}
