import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarDays, Clock, Info, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AvailabilityPreview } from './AvailabilityPreview';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}:00`,
    label: `${displayHour}:${minute} ${ampm}`,
  };
});

export interface PackageWeeklyAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

export interface PackageBlockedDate {
  id?: string;
  date: string;
  reason?: string;
}

interface StepAvailabilityProps {
  packageId?: string;
  weeklyAvailability: PackageWeeklyAvailability[];
  blockedDates: PackageBlockedDate[];
  onWeeklyChange: (availability: PackageWeeklyAvailability[]) => void;
  onBlockedDatesChange: (dates: PackageBlockedDate[]) => void;
}

export function StepAvailability({
  packageId,
  weeklyAvailability,
  blockedDates,
  onWeeklyChange,
  onBlockedDatesChange,
}: StepAvailabilityProps) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing availability if editing a package
  useEffect(() => {
    if (packageId && user) {
      loadAvailability();
    }
  }, [packageId, user]);

  const loadAvailability = async () => {
    if (!packageId || !user) return;
    setLoading(true);
    try {
      const [weeklyResult, blockedResult] = await Promise.all([
        supabase
          .from('package_weekly_availability')
          .select('*')
          .eq('package_id', packageId),
        supabase
          .from('package_availability')
          .select('*')
          .eq('package_id', packageId)
          .eq('is_blocked', true),
      ]);

      if (weeklyResult.data && weeklyResult.data.length > 0) {
        const weekly = weeklyResult.data.map((w: any) => ({
          dayOfWeek: w.day_of_week,
          startTime: w.start_time,
          endTime: w.end_time,
          isEnabled: w.is_enabled,
        }));
        onWeeklyChange(weekly);
      }

      if (blockedResult.data) {
        const blocked = blockedResult.data.map((b: any) => ({
          id: b.id,
          date: b.date,
          reason: b.reason,
        }));
        onBlockedDatesChange(blocked);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayOfWeek: number, updates: Partial<PackageWeeklyAvailability>) => {
    const updated = weeklyAvailability.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    );
    onWeeklyChange(updated);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existingBlock = blockedDates.find((b) => b.date === dateStr);

    if (existingBlock) {
      // Remove the block
      onBlockedDatesChange(blockedDates.filter((b) => b.date !== dateStr));
      toast.success('Date unblocked');
    } else {
      // Show dialog to add block
      setSelectedDate(date);
      setBlockReason('');
      setShowBlockDialog(true);
    }
  };

  const addBlockedDate = () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    onBlockedDatesChange([
      ...blockedDates,
      { date: dateStr, reason: blockReason || undefined },
    ]);
    setShowBlockDialog(false);
    setSelectedDate(null);
    setBlockReason('');
    toast.success('Date blocked');
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.some((b) => b.date === dateStr);
  };

  const isDayDisabled = (dayOfWeek: number) => {
    const day = weeklyAvailability.find((d) => d.dayOfWeek === dayOfWeek);
    return !day?.isEnabled;
  };

  const hasEnabledDays = weeklyAvailability.some((d) => d.isEnabled);

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Weekly Schedule</CardTitle>
          </div>
          <CardDescription>
            Set which days and times this package is available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayAvail = weeklyAvailability.find((d) => d.dayOfWeek === day.value);
            return (
              <div
                key={day.value}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-colors ${
                  dayAvail?.isEnabled ? 'bg-primary/5' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[120px]">
                  <Switch
                    checked={dayAvail?.isEnabled ?? false}
                    onCheckedChange={(checked) =>
                      updateDay(day.value, { isEnabled: checked })
                    }
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {dayAvail?.isEnabled && (
                  <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                    <Select
                      value={dayAvail.startTime}
                      onValueChange={(value) =>
                        updateDay(day.value, { startTime: value })
                      }
                    >
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select
                      value={dayAvail.endTime}
                      onValueChange={(value) =>
                        updateDay(day.value, { endTime: value })
                      }
                    >
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}

          {!hasEnabledDays && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>Enable at least one day for this package to be bookable</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specific Blocked Dates */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Blocked Dates</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px]">
                    Block specific dates when this package is not available
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Click dates to block or unblock them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={(date) => date && handleDateSelect(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={(date) => date < new Date()}
              modifiers={{
                blocked: (date) => isDateBlocked(date),
                disabled: (date) => isDayDisabled(date.getDay()),
              }}
              modifiersClassNames={{
                blocked: 'bg-destructive/20 text-destructive hover:bg-destructive/30',
                disabled: 'bg-muted text-muted-foreground/50',
              }}
              className="rounded-lg border border-border"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-muted border border-border" />
              <span className="text-muted-foreground">Day off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-background border border-border" />
              <span className="text-muted-foreground">Available</span>
            </div>
          </div>

          {/* Blocked Dates List */}
          {blockedDates.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Upcoming blocked dates</Label>
              <div className="flex flex-wrap gap-2">
                {blockedDates
                  .filter((b) => new Date(b.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 10)
                  .map((blocked) => (
                    <Badge
                      key={blocked.date}
                      variant="secondary"
                      className="gap-1.5 py-1"
                    >
                      {format(new Date(blocked.date), 'MMM d, yyyy')}
                      {blocked.reason && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>{blocked.reason}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <button
                        onClick={() =>
                          onBlockedDatesChange(
                            blockedDates.filter((b) => b.date !== blocked.date)
                          )
                        }
                        className="ml-0.5 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Preview */}
      <AvailabilityPreview
        weeklyAvailability={weeklyAvailability}
        blockedDates={blockedDates}
      />

      {/* Block Date Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Block{' '}
              <span className="font-medium text-foreground">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </span>{' '}
              from bookings
            </p>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="e.g., Personal event, vacation, maintenance..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={addBlockedDate}>
              Block Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default weekly availability (9 AM - 5 PM, weekdays enabled)
export const getDefaultWeeklyAvailability = (): PackageWeeklyAvailability[] =>
  DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value,
    startTime: '09:00:00',
    endTime: '17:00:00',
    isEnabled: day.value >= 1 && day.value <= 5, // Mon-Fri
  }));
