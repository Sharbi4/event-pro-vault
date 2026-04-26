import { useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useScheduleData, BLOCK_STYLES, ScheduleBlockKind } from '@/hooks/useScheduleData';
import { DayTimeline } from './DayTimeline';
import { BookingCommandCard } from './BookingCommandCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarRange, ListTodo, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bookingBlocksCalendar } from '@/lib/bookingLifecycle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onMessageClient?: (booking: { id: string; customer_email: string; event_location: string }) => void;
  onUpdateStatus?: (id: string, status: string) => Promise<unknown>;
}

const LEGEND_KINDS: ScheduleBlockKind[] = [
  'confirmed_booking', 'pending_request', 'awaiting_payment', 'balance_due',
  'pending_hold', 'manual_block', 'setup_buffer',
];

export function BookingCommandCenter({ onMessageClient, onUpdateStatus }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<'day' | 'week'>('week');
  const [anchor, setAnchor] = useState<Date>(new Date());

  const weekStart = useMemo(() => startOfWeek(anchor, { weekStartsOn: 0 }), [anchor]);
  const days = view === 'day'
    ? [anchor]
    : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];

  const { blocks, bookings, loading, refetch } = useScheduleData(user?.id, rangeStart, rangeEnd);

  const visibleBookings = useMemo(() => {
    return bookings
      .filter(bookingBlocksCalendar)
      .sort((a, b) => {
        const ta = a.event_start_at ? new Date(a.event_start_at).getTime() : 0;
        const tb = b.event_start_at ? new Date(b.event_start_at).getTime() : 0;
        return ta - tb;
      });
  }, [bookings]);

  const handleBlockClick = (block: any) => {
    if (block.bookingId) {
      const card = document.getElementById(`booking-card-${block.bookingId}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.classList.add('ring-2', 'ring-primary');
      setTimeout(() => card?.classList.remove('ring-2', 'ring-primary'), 1600);
    }
  };

  const shift = (delta: number) => {
    setAnchor(d => addDays(d, view === 'day' ? delta : delta * 7));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-display">Booking Command Center</h2>
          <p className="text-sm text-muted-foreground">
            Manage your availability, bookings, blocked time, payments, and event schedule in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
            <Button
              size="sm" variant={view === 'day' ? 'default' : 'ghost'}
              onClick={() => setView('day')} className="h-8 px-3"
            >Day</Button>
            <Button
              size="sm" variant={view === 'week' ? 'default' : 'ghost'}
              onClick={() => setView('week')} className="h-8 px-3"
            >Week</Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAnchor(new Date())}>Today</Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => shift(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => shift(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {LEGEND_KINDS.map(k => {
          const s = BLOCK_STYLES[k];
          return (
            <Badge key={k} variant="outline" className={cn('font-normal', s.bg, s.border, s.text)}>
              {s.label}
            </Badge>
          );
        })}
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              {view === 'day'
                ? format(anchor, 'EEEE, MMMM d, yyyy')
                : `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`}
            </CardTitle>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn('grid gap-3', view === 'week' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1')}>
            {days.map(d => (
              <div key={d.toISOString()} className="space-y-2">
                {view === 'week' && (
                  <div className={cn(
                    'text-center text-xs font-medium px-2 py-1 rounded',
                    isSameDay(d, new Date()) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}>
                    <div>{format(d, 'EEE')}</div>
                    <div className="text-base text-foreground">{format(d, 'd')}</div>
                  </div>
                )}
                <DayTimeline date={d} blocks={blocks} onBlockClick={handleBlockClick} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            Bookings in view ({visibleBookings.length})
          </h3>
        </div>
        {visibleBookings.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No bookings in this {view === 'day' ? 'day' : 'week'}.
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleBookings.map(b => (
              <div key={b.id} id={`booking-card-${b.id}`} className="transition-all rounded-lg">
                <BookingCommandCard
                  booking={b}
                  onMessage={
                    onMessageClient && b.customer_email
                      ? (bk) => onMessageClient({
                          id: bk.id, customer_email: bk.customer_email, event_location: bk.event_location ?? '',
                        })
                      : undefined
                  }
                  onCancel={
                    onUpdateStatus
                      ? (bk) => { if (confirm('Cancel this booking?')) onUpdateStatus(bk.id, 'cancelled'); }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
