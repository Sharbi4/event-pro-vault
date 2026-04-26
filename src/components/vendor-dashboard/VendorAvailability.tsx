import { useState, useEffect } from 'react';
import { format, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarX, Trash2, ChevronLeft, ChevronRight, Repeat, Clock, Settings, CalendarRange, Plus } from 'lucide-react';
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

interface BlockedTime {
  id: string;
  block_start: string;
  block_end: string;
  reason: string | null;
  is_full_day: boolean;
}

interface WeeklyAvailRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

interface BookingRules {
  minimum_notice_hours: number;
  advance_booking_days: number;
  vendor_approval_expires_hours: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
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
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [weeklyAvail, setWeeklyAvail] = useState<WeeklyAvailRow[]>([]);
  const [rules, setRules] = useState<BookingRules>({
    minimum_notice_hours: 48,
    advance_booking_days: 180,
    vendor_approval_expires_hours: 48,
    buffer_before_minutes: 30,
    buffer_after_minutes: 30,
  });
  const [loading, setLoading] = useState(true);
  const [savingRules, setSavingRules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Add blocked-time dialog state
  const [btDialogOpen, setBtDialogOpen] = useState(false);
  const [btDate, setBtDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [btStart, setBtStart] = useState('09:00');
  const [btEnd, setBtEnd] = useState('12:00');
  const [btReason, setBtReason] = useState('');

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    const [datesRes, recurringRes, btRes, weeklyRes, rulesRes] = await Promise.all([
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
        .eq('is_blocked', true),
      supabase
        .from('vendor_blocked_times')
        .select('*')
        .eq('user_id', user.id)
        .order('block_start', { ascending: true }),
      supabase
        .from('vendor_weekly_availability')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week'),
      supabase
        .from('vendor_buffer_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    if (datesRes.data) setBlockedDates(datesRes.data);
    if (recurringRes.data) setRecurringBlocks(recurringRes.data);
    if (btRes.data) setBlockedTimes(btRes.data as any);
    if (weeklyRes.data && weeklyRes.data.length > 0) {
      setWeeklyAvail(weeklyRes.data as any);
    } else {
      // Seed defaults: Mon-Sat 9-17 enabled, Sun off
      const seeded: WeeklyAvailRow[] = DAYS_OF_WEEK.map((d) => ({
        id: '',
        day_of_week: d.value,
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_enabled: d.value !== 0,
      }));
      setWeeklyAvail(seeded);
    }
    if (rulesRes.data) {
      const r = rulesRes.data as any;
      setRules({
        minimum_notice_hours: r.minimum_notice_hours ?? 48,
        advance_booking_days: r.advance_booking_days ?? 180,
        vendor_approval_expires_hours: r.vendor_approval_expires_hours ?? 48,
        buffer_before_minutes: r.buffer_before_minutes ?? 30,
        buffer_after_minutes: r.buffer_after_minutes ?? 30,
      });
    }
    setLoading(false);
  };

  const blockedDaysOfWeek = new Set(recurringBlocks.map(r => r.day_of_week));
  const blockedDateSet = new Set(
    blockedDates.map(b => format(new Date(b.date), 'yyyy-MM-dd'))
  );
  const isRecurringBlocked = (date: Date) => blockedDaysOfWeek.has(getDay(date));

  // ---- Specific dates ----
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isRecurringBlocked(date)) {
      toast({
        title: 'Day blocked by recurring rule',
        description: `${DAYS_OF_WEEK[getDay(date)].label}s are blocked. Disable the recurring rule first.`,
        variant: 'destructive'
      });
      return;
    }
    const existing = blockedDates.find(b => isSameDay(new Date(b.date), date));
    if (existing) {
      removeBlockedDate(existing.id);
    } else {
      setSelectedDate(date);
      setReason('');
      setDialogOpen(true);
    }
  };

  const addBlockedDate = async () => {
    if (!user || !selectedDate) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('vendor_availability')
      .insert({
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        is_blocked: true,
        reason: reason || null,
      })
      .select('id, date, reason')
      .single();
    if (error) {
      toast({ title: 'Failed to block date', description: error.message, variant: 'destructive' });
    } else {
      setBlockedDates(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      toast({ title: 'Date blocked' });
    }
    setSaving(false);
    setDialogOpen(false);
    setSelectedDate(undefined);
    setReason('');
  };

  const removeBlockedDate = async (id: string) => {
    const { error } = await supabase.from('vendor_availability').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    } else {
      setBlockedDates(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Date unblocked' });
    }
  };

  const toggleRecurringDay = async (dayOfWeek: number) => {
    if (!user) return;
    const existing = recurringBlocks.find(r => r.day_of_week === dayOfWeek);
    if (existing) {
      const { error } = await supabase.from('vendor_recurring_availability').delete().eq('id', existing.id);
      if (!error) setRecurringBlocks(prev => prev.filter(r => r.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('vendor_recurring_availability')
        .insert({ user_id: user.id, day_of_week: dayOfWeek, is_blocked: true })
        .select('id, day_of_week')
        .single();
      if (!error && data) setRecurringBlocks(prev => [...prev, data]);
    }
  };

  // ---- Weekly availability hours ----
  const updateWeekly = (dow: number, patch: Partial<WeeklyAvailRow>) => {
    setWeeklyAvail(prev => prev.map(w => w.day_of_week === dow ? { ...w, ...patch } : w));
  };

  const saveWeekly = async () => {
    if (!user) return;
    setSavingRules(true);
    // Delete existing then re-insert (simpler than diffing)
    await supabase.from('vendor_weekly_availability').delete().eq('user_id', user.id);
    const rows = weeklyAvail.map(w => ({
      user_id: user.id,
      day_of_week: w.day_of_week,
      start_time: w.start_time.length === 5 ? `${w.start_time}:00` : w.start_time,
      end_time: w.end_time.length === 5 ? `${w.end_time}:00` : w.end_time,
      is_enabled: w.is_enabled,
    }));
    const { error } = await supabase.from('vendor_weekly_availability').insert(rows);
    setSavingRules(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Weekly hours saved' });
      fetchAll();
    }
  };

  // ---- Blocked times ----
  const addBlockedTime = async () => {
    if (!user) return;
    const start = new Date(`${btDate}T${btStart}:00`);
    const end = new Date(`${btDate}T${btEnd}:00`);
    if (end <= start) {
      toast({ title: 'End must be after start', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('vendor_blocked_times')
      .insert({
        user_id: user.id,
        block_start: start.toISOString(),
        block_end: end.toISOString(),
        reason: btReason || null,
        is_full_day: false,
      })
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    } else {
      setBlockedTimes(prev => [...prev, data as any].sort((a, b) => a.block_start.localeCompare(b.block_start)));
      setBtDialogOpen(false);
      setBtReason('');
      toast({ title: 'Time blocked' });
    }
  };

  const removeBlockedTime = async (id: string) => {
    const { error } = await supabase.from('vendor_blocked_times').delete().eq('id', id);
    if (!error) setBlockedTimes(prev => prev.filter(b => b.id !== id));
  };

  // ---- Booking rules ----
  const saveRules = async () => {
    if (!user) return;
    setSavingRules(true);
    const { error } = await supabase
      .from('vendor_buffer_settings')
      .upsert({
        user_id: user.id,
        ...rules,
      }, { onConflict: 'user_id' });
    setSavingRules(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking rules saved' });
    }
  };

  const upcomingBlocked = blockedDates.filter(b =>
    new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const upcomingBlockedTimes = blockedTimes.filter(b => new Date(b.block_end) >= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="schedule" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 max-w-2xl">
        <TabsTrigger value="schedule" className="gap-2">
          <Clock className="w-4 h-4" /> <span className="hidden sm:inline">Schedule</span>
        </TabsTrigger>
        <TabsTrigger value="dates" className="gap-2">
          <CalendarX className="w-4 h-4" /> <span className="hidden sm:inline">Dates</span>
        </TabsTrigger>
        <TabsTrigger value="times" className="gap-2">
          <CalendarRange className="w-4 h-4" /> <span className="hidden sm:inline">Times</span>
        </TabsTrigger>
        <TabsTrigger value="rules" className="gap-2">
          <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Rules</span>
        </TabsTrigger>
      </TabsList>

      {/* ===== Schedule Tab: Weekly hours + recurring weekly blocks ===== */}
      <TabsContent value="schedule" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Weekly Hours
            </CardTitle>
            <CardDescription>
              Your master operating hours. Every package pulls availability from this calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyAvail.sort((a, b) => a.day_of_week - b.day_of_week).map((w) => (
              <div key={w.day_of_week} className="flex items-center gap-4 py-2 border-b last:border-0">
                <div className="w-28 flex items-center gap-3">
                  <Switch
                    checked={w.is_enabled}
                    onCheckedChange={(v) => updateWeekly(w.day_of_week, { is_enabled: v })}
                  />
                  <span className="text-sm font-medium">{DAYS_OF_WEEK[w.day_of_week].label}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={w.start_time.slice(0, 5)}
                    onChange={(e) => updateWeekly(w.day_of_week, { start_time: e.target.value })}
                    disabled={!w.is_enabled}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={w.end_time.slice(0, 5)}
                    onChange={(e) => updateWeekly(w.day_of_week, { end_time: e.target.value })}
                    disabled={!w.is_enabled}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
            <Button onClick={saveWeekly} disabled={savingRules}>
              {savingRules && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Weekly Hours
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5" /> Recurring Weekly Blocks
            </CardTitle>
            <CardDescription>
              Block entire days of the week (overrides weekly hours).
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
                    <div className={cn("w-3 h-3 rounded-full", isBlocked ? "bg-destructive" : "bg-trust")} />
                    <span className="text-xs text-muted-foreground">{isBlocked ? 'Blocked' : 'Available'}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ===== Dates Tab: full-day blocks ===== */}
      <TabsContent value="dates">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarX className="w-5 h-5" /> Block Specific Dates
              </CardTitle>
              <CardDescription>Tap a date to block or unblock it.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
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
                  blocked: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', fontWeight: 'bold' },
                  recurring: { backgroundColor: 'hsl(var(--destructive) / 0.6)', color: 'hsl(var(--destructive-foreground))', fontWeight: 'bold' },
                  past: { opacity: 0.4 }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Blackouts</CardTitle>
              <CardDescription>{upcomingBlocked.length} date{upcomingBlocked.length !== 1 ? 's' : ''} blocked</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBlocked.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No specific dates blocked</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {upcomingBlocked.map((block) => (
                    <div key={block.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 group">
                      <div>
                        <p className="font-medium text-sm">{format(new Date(block.date), 'EEE, MMM d, yyyy')}</p>
                        {block.reason && <p className="text-xs text-muted-foreground mt-1">{block.reason}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => removeBlockedDate(block.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ===== Times Tab: partial-day blocks ===== */}
      <TabsContent value="times">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5" /> Blocked Time Windows
              </CardTitle>
              <CardDescription>
                Block partial-day windows (lunch breaks, doctor visits, prep time, etc.)
              </CardDescription>
            </div>
            <Button onClick={() => setBtDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Block
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingBlockedTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No blocked time windows</p>
            ) : (
              <div className="space-y-2">
                {upcomingBlockedTimes.map((bt) => (
                  <div key={bt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group">
                    <div>
                      <p className="font-medium text-sm">
                        {format(new Date(bt.block_start), 'EEE, MMM d')} · {format(new Date(bt.block_start), 'h:mm a')} – {format(new Date(bt.block_end), 'h:mm a')}
                      </p>
                      {bt.reason && <p className="text-xs text-muted-foreground mt-1">{bt.reason}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => removeBlockedTime(bt.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ===== Rules Tab ===== */}
      <TabsContent value="rules">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Booking Rules
            </CardTitle>
            <CardDescription>
              Apply across every package. Individual packages may add stricter constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="min-notice">Minimum notice (hours)</Label>
                <Input
                  id="min-notice"
                  type="number"
                  min={0}
                  value={rules.minimum_notice_hours}
                  onChange={(e) => setRules(r => ({ ...r, minimum_notice_hours: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Customers can't book closer than this to event start.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Max booking window (days out)</Label>
                <Input
                  id="advance"
                  type="number"
                  min={1}
                  value={rules.advance_booking_days}
                  onChange={(e) => setRules(r => ({ ...r, advance_booking_days: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">How far in the future customers can book.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval">Approval window (hours)</Label>
                <Input
                  id="approval"
                  type="number"
                  min={1}
                  value={rules.vendor_approval_expires_hours}
                  onChange={(e) => setRules(r => ({ ...r, vendor_approval_expires_hours: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Time you have to approve a request before it auto-expires.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buf-before">Buffer before (min)</Label>
                <Input
                  id="buf-before"
                  type="number"
                  min={0}
                  value={rules.buffer_before_minutes}
                  onChange={(e) => setRules(r => ({ ...r, buffer_before_minutes: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buf-after">Buffer after (min)</Label>
                <Input
                  id="buf-after"
                  type="number"
                  min={0}
                  value={rules.buffer_after_minutes}
                  onChange={(e) => setRules(r => ({ ...r, buffer_after_minutes: Number(e.target.value) }))}
                />
              </div>
            </div>
            <Button onClick={saveRules} disabled={savingRules}>
              {savingRules && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Booking Rules
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add blocked-date dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Date</DialogTitle>
            <DialogDescription>
              {selectedDate && `Block ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" placeholder="Vacation, holiday..." value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addBlockedDate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Block Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add blocked-time dialog */}
      <Dialog open={btDialogOpen} onOpenChange={setBtDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Time Window</DialogTitle>
            <DialogDescription>Block a partial-day window on a specific date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={btDate} onChange={(e) => setBtDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input type="time" value={btStart} onChange={(e) => setBtStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input type="time" value={btEnd} onChange={(e) => setBtEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input placeholder="Lunch, prep, appointment..." value={btReason} onChange={(e) => setBtReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBtDialogOpen(false)}>Cancel</Button>
            <Button onClick={addBlockedTime} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Block Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
