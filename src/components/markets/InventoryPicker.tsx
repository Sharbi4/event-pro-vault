import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, AlertTriangle, TrendingUp } from 'lucide-react';
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

  // Find next available date if current selection is sold out
  const nextAvailableDate = useMemo(() => {
    if (availableDates.size === 0) return null;
    const sorted = Array.from(availableDates).sort();
    const today = format(new Date(), 'yyyy-MM-dd');
    return sorted.find(d => d >= today) || sorted[0];
  }, [availableDates]);

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

  // Get urgency level for a time window
  const getUrgencyLevel = (remaining: number, total: number) => {
    if (remaining <= 0) return 'sold-out';
    if (remaining <= 3) return 'critical';
    if (remaining <= 10 || remaining / total <= 0.2) return 'high';
    return 'normal';
  };

  if (!slotType) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Select a slot type to see available dates</p>
      </div>
    );
  }

  if (filteredInventory.length === 0 || availableDates.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">No upcoming availability</p>
        <p className="text-sm mt-1">Check back soon or try a different spot type</p>
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
              const urgency = getUrgencyLevel(window.slotsRemaining, window.totalSlots);
              const fillPercentage = ((window.totalSlots - window.slotsRemaining) / window.totalSlots) * 100;
              
              return (
                <div 
                  key={window.id}
                  className={cn(
                    "relative p-3 rounded-lg border transition-all",
                    isSoldOut 
                      ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                      : selectedInventoryId === window.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : urgency === 'critical'
                          ? "border-destructive/50 bg-destructive/5 cursor-pointer hover:border-destructive"
                          : "border-border hover:border-primary/50 cursor-pointer"
                  )}
                  onClick={() => !isSoldOut && onInventorySelect(window.id)}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={window.id} 
                      id={window.id} 
                      disabled={isSoldOut}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTime(window.startTime)} – {formatTime(window.endTime)}
                          </span>
                        </div>
                        {window.priceOverride && (
                          <Badge variant="secondary" className="text-xs">
                            ${price}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Availability Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <Users className={cn(
                              "w-3.5 h-3.5",
                              urgency === 'critical' && "text-destructive",
                              urgency === 'high' && "text-trust",
                              urgency === 'normal' && "text-muted-foreground"
                            )} />
                            {isSoldOut ? (
                              <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                            ) : (
                              <span className={cn(
                                "font-medium",
                                urgency === 'critical' && "text-destructive",
                                urgency === 'high' && "text-trust"
                              )}>
                                {window.slotsRemaining} / {window.totalSlots} spots left
                              </span>
                            )}
                          </div>
                          {urgency === 'critical' && !isSoldOut && (
                            <Badge variant="destructive" className="gap-1 text-xs animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Selling fast
                            </Badge>
                          )}
                          {urgency === 'high' && (
                            <Badge variant="trust" className="gap-1 text-xs">
                              <TrendingUp className="w-3 h-3" />
                              High demand
                            </Badge>
                          )}
                        </div>
                        {!isSoldOut && (
                          <Progress 
                            value={fillPercentage} 
                            className={cn(
                              "h-1.5",
                              urgency === 'critical' && "[&>div]:bg-destructive",
                              urgency === 'high' && "[&>div]:bg-trust"
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
          
          {/* Show next available if all time windows are sold out */}
          {timeWindows.every(w => w.slotsRemaining <= 0) && nextAvailableDate && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-sm text-muted-foreground">
                All slots sold out. Next available:{' '}
                <button 
                  className="font-medium text-primary underline"
                  onClick={() => onDateSelect(parseISO(nextAvailableDate))}
                >
                  {format(parseISO(nextAvailableDate), 'EEE, MMM d')}
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {selectedDate && timeWindows.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No time windows available for this date</p>
          {nextAvailableDate && (
            <button 
              className="text-sm font-medium text-primary underline mt-2"
              onClick={() => onDateSelect(parseISO(nextAvailableDate))}
            >
              Jump to next available: {format(parseISO(nextAvailableDate), 'EEE, MMM d')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
