import { useState, useEffect } from 'react';
import { format, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarX, Trash2, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface RecurringBlock {
  id: string;
  day_of_week: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export function VendorAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const [datesRes, recurringRes] = await Promise.all([
      supabase
        .from('vendor_availability')
        .select('id, date, reason')
        .eq('user_id', user.id)
        .eq('is_blocked', true)
        .order('date', { ascending: true }),
      supabase
        .from('vendor_recurring_availability')
        .select('id, day_of_week')
        .eq('user_id', user.id)
        .eq('is_blocked', true)
    ]);

    if (datesRes.error) {
      toast({
        title: 'Failed to load availability',
        description: datesRes.error.message,
        variant: 'destructive'
      });
    } else {
      setBlockedDates(datesRes.data || []);
    }

    if (recurringRes.data) {
      setRecurringBlocks(recurringRes.data);
    }

    setLoading(false);
  };

  const blockedDaysOfWeek = new Set(recurringBlocks.map(r => r.day_of_week));

  const isRecurringBlocked = (date: Date) => {
    return blockedDaysOfWeek.has(getDay(date));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Don't allow selecting dates that are blocked by recurring rules
    if (isRecurringBlocked(date)) {
      toast({
        title: 'Day blocked by recurring rule',
        description: `${DAYS_OF_WEEK[getDay(date)].label}s are blocked. Disable the recurring rule first.`,
        variant: 'destructive'
      });
      return;
    }
    
    // Check if date is already blocked
    const existingBlock = blockedDates.find(b => 
      isSameDay(new Date(b.date), date)
    );

    if (existingBlock) {
      removeBlockedDate(existingBlock.id);
    } else {
      setSelectedDate(date);
      setReason('');
      setDialogOpen(true);
    }
  };

  const addBlockedDate = async () => {
    if (!user || !selectedDate) return;

    setSaving(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('vendor_availability')
      .insert({
        user_id: user.id,
        date: dateStr,
        is_blocked: true,
        reason: reason || null
      })
      .select('id, date, reason')
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Date already blocked',
          description: 'This date is already marked as unavailable',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Failed to block date',
          description: error.message,
          variant: 'destructive'
        });
      }
    } else {
      setBlockedDates(prev => [...prev, data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast({
        title: 'Date blocked',
        description: `${format(selectedDate, 'PPP')} is now unavailable`
      });
    }

    setSaving(false);
    setDialogOpen(false);
    setSelectedDate(undefined);
    setReason('');
  };

  const removeBlockedDate = async (id: string) => {
    const { error } = await supabase
      .from('vendor_availability')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Failed to unblock date',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setBlockedDates(prev => prev.filter(b => b.id !== id));
      toast({
        title: 'Date unblocked',
        description: 'The date is now available for bookings'
      });
    }
  };

  const toggleRecurringDay = async (dayOfWeek: number) => {
    if (!user) return;

    const existing = recurringBlocks.find(r => r.day_of_week === dayOfWeek);

    if (existing) {
      // Remove the recurring block
      const { error } = await supabase
        .from('vendor_recurring_availability')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast({
          title: 'Failed to update',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setRecurringBlocks(prev => prev.filter(r => r.id !== existing.id));
        toast({
          title: `${DAYS_OF_WEEK[dayOfWeek].label}s unblocked`,
          description: 'This day is now available for bookings'
        });
      }
    } else {
      // Add the recurring block
      const { data, error } = await supabase
        .from('vendor_recurring_availability')
        .insert({
          user_id: user.id,
          day_of_week: dayOfWeek,
          is_blocked: true
        })
        .select('id, day_of_week')
        .single();

      if (error) {
        toast({
          title: 'Failed to update',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setRecurringBlocks(prev => [...prev, data]);
        toast({
          title: `${DAYS_OF_WEEK[dayOfWeek].label}s blocked`,
          description: 'All future dates on this day are now unavailable'
        });
      }
    }
  };

  const blockedDateSet = new Set(
    blockedDates.map(b => format(new Date(b.date), 'yyyy-MM-dd'))
  );

  const isDateBlocked = (date: Date) => {
    return blockedDateSet.has(format(date, 'yyyy-MM-dd')) || isRecurringBlocked(date);
  };

  // Get upcoming blocked dates for the list view
  const upcomingBlocked = blockedDates.filter(b => 
    new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recurring Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Block entire days of the week. These will be unavailable every week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isBlocked = blockedDaysOfWeek.has(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleRecurringDay(day.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    isBlocked 
                      ? "border-destructive bg-destructive/10 text-destructive" 
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-sm font-medium">{day.short}</span>
                  <div className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    isBlocked ? "bg-destructive" : "bg-trust"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {isBlocked ? 'Blocked' : 'Available'}
                  </span>
                </button>
              );
            })}
          </div>
          {recurringBlocks.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              <span className="font-medium">{recurringBlocks.length} day{recurringBlocks.length !== 1 ? 's' : ''}</span> blocked weekly:{' '}
              {recurringBlocks.map(r => DAYS_OF_WEEK[r.day_of_week].label).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="w-5 h-5" />
              Specific Dates
            </CardTitle>
            <CardDescription>
              Block individual dates for holidays, vacations, or other one-time events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                blocked: (date) => blockedDateSet.has(format(date, 'yyyy-MM-dd')),
                recurring: (date) => isRecurringBlocked(date),
                past: (date) => date < new Date(new Date().setHours(0, 0, 0, 0))
              }}
              modifiersStyles={{
                blocked: {
                  backgroundColor: 'hsl(var(--destructive))',
                  color: 'hsl(var(--destructive-foreground))',
                  fontWeight: 'bold'
                },
                recurring: {
                  backgroundColor: 'hsl(var(--destructive) / 0.6)',
                  color: 'hsl(var(--destructive-foreground))',
                  fontWeight: 'bold'
                },
                past: {
                  opacity: 0.4
                }
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive" />
                <span className="text-muted-foreground">Specific date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/60" />
                <span className="text-muted-foreground">Weekly recurring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-muted-foreground">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Blocked Dates List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Blackout Dates</CardTitle>
            <CardDescription>
              {upcomingBlocked.length} specific date{upcomingBlocked.length !== 1 ? 's' : ''} blocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBlocked.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No specific dates blocked
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {upcomingBlocked.map((block) => (
                  <div 
                    key={block.id} 
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 group"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {format(new Date(block.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {block.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {block.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => removeBlockedDate(block.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Date</DialogTitle>
            <DialogDescription>
              {selectedDate && `Block ${format(selectedDate, 'EEEE, MMMM d, yyyy')} from bookings`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Personal day, Holiday, Vacation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is for your reference only and won't be shown to customers
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addBlockedDate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Block Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
