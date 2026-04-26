import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Calendar, Clock, MapPin, Receipt, MessageCircle, CreditCard,
  Star, XCircle, CheckCircle2, AlertCircle, Lock, Radio, Users, Package as PackageIcon,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  BookingUiState, STATE_LABELS, CANCELLATION_RULES,
  deriveBookingState, getCancellationStatus, getEventStart, getEventEnd,
  type CancellationPolicy,
} from '@/lib/bookingState';
import { CancellationDialog } from '@/components/shared/CancellationDialog';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import type { BookingData } from '@/hooks/useBookings';

interface FullBooking extends BookingData {
  booking_type?: string;
  customer_email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  event_city?: string | null;
  event_state?: string | null;
  event_zip?: string | null;
  event_zip_full?: string | null;
  setup_minutes?: number | null;
  breakdown_minutes?: number | null;
  cancelled_at?: string | null;
  payment_method?: 'stripe' | 'cash';
}

const TONE_CLASSES: Record<string, string> = {
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  neutral: 'bg-secondary text-foreground border-border',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
  live: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

function fmtMoney(n?: number | null) {
  if (n == null) return '—';
  return `$${Number(n).toFixed(2)}`;
}

function fmtDate(d: Date) {
  return isNaN(d.getTime()) ? 'TBD' : format(d, 'EEE, MMM d, yyyy');
}
function fmtTime(d: Date) {
  return isNaN(d.getTime()) ? '' : format(d, 'h:mm a');
}

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [booking, setBooking] = useState<FullBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: bk, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!active) return;
      if (error || !bk) {
        toast({ title: 'Booking not found', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Fetch package + vendor details for richer display
      const [pkgRes, vendorRes] = await Promise.all([
        supabase.from('vendor_packages')
          .select('id, name, cover_image_url, cancellation_policy')
          .eq('id', bk.package_id).maybeSingle(),
        supabase.from('profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', bk.vendor_user_id || '').maybeSingle(),
      ]);
      const pkg = (pkgRes.data ?? null) as { name?: string; cover_image_url?: string; cancellation_policy?: string } | null;
      const vendor = (vendorRes.data ?? null) as { display_name?: string; avatar_url?: string } | null;

      const merged: FullBooking = {
        ...(bk as any),
        package_name: pkg?.name ?? bk.package_id,
        package_cover_image: pkg?.cover_image_url ?? undefined,
        cancellation_policy: (pkg?.cancellation_policy as CancellationPolicy | undefined) ?? ((bk as any).cancellation_policy as CancellationPolicy | undefined) ?? 'standard',
        vendor_display_name: vendor?.display_name ?? 'Vendor',
        vendor_avatar: vendor?.avatar_url ?? undefined,
      };
      setBooking(merged);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, user, toast]);

  const handleMessageVendor = async () => {
    if (!booking || !user) return;
    setMessaging(true);
    try {
      // Find or create conversation with this vendor
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_user_id', user.id)
        .eq('vendor_user_id', booking.vendor_user_id ?? '')
        .maybeSingle();

      let convoId = existing?.id;
      if (!convoId) {
        const { data: created, error } = await supabase
          .from('conversations')
          .insert({
            client_user_id: user.id,
            vendor_user_id: booking.vendor_user_id ?? '',
            booking_id: booking.id,
          })
          .select('id')
          .single();
        if (error) throw error;
        convoId = created.id;
      }
      navigate(`/dashboard?tab=messages&conversation=${convoId}`);
    } catch (e) {
      console.error(e);
      toast({ title: 'Could not open conversation', variant: 'destructive' });
    } finally {
      setMessaging(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: { booking_id: booking.id, payment_type: 'deposit_or_full' },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast({ title: 'Payment failed to start', description: e?.message, variant: 'destructive' });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Booking not found</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const state: BookingUiState = deriveBookingState(booking as any);
  const meta = STATE_LABELS[state];
  const start = getEventStart(booking);
  const end = getEventEnd(booking);
  const policy = (booking.cancellation_policy ?? 'standard') as CancellationPolicy;
  const rule = CANCELLATION_RULES[policy];
  const cancelStatus = getCancellationStatus(booking as any);

  const initials = (booking.vendor_display_name ?? 'V')
    .split(' ').map(s => s[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

  // Reminder timeline (purely informational — actual sends happen on the server)
  const reminderMilestones = [
    { label: 'Booking confirmed', when: booking.deposit_paid_at || booking.final_paid_at || booking.created_at },
    { label: '7 days before event', when: !isNaN(start.getTime()) ? new Date(start.getTime() - 7 * 86400_000).toISOString() : null },
    { label: '48 hours before event', when: !isNaN(start.getTime()) ? new Date(start.getTime() - 48 * 3600_000).toISOString() : null },
    { label: '24 hours before event', when: !isNaN(start.getTime()) ? new Date(start.getTime() - 24 * 3600_000).toISOString() : null },
    { label: 'Morning of event', when: !isNaN(start.getTime()) ? new Date(new Date(start).setHours(8, 0, 0, 0)).toISOString() : null },
    { label: 'Review request (after event)', when: !isNaN(end.getTime()) ? new Date(end.getTime() + 4 * 3600_000).toISOString() : null },
  ];

  const fullAddress = [
    booking.address_line1,
    booking.address_line2,
    [booking.event_city, booking.event_state].filter(Boolean).join(', '),
    booking.event_zip,
  ].filter(Boolean).join(' · ') || booking.event_location || 'Location TBD';

  const totalPaid =
    (booking.deposit_paid_at ? Number(booking.deposit_amount ?? 0) : 0) +
    (booking.final_paid_at ? Number(booking.final_amount ?? 0) : 0);
  const totalDue = Number(booking.total_price ?? 0) - totalPaid;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to bookings</Link>
        </Button>

        {/* Status banner */}
        <Card className="p-5 md:p-6 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.vendor_avatar} alt={booking.vendor_display_name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                  {booking.vendor_display_name}
                </h1>
                <p className="text-sm text-muted-foreground">{booking.package_name}</p>
                <Badge variant="outline" className={`mt-2 gap-1.5 font-medium ${TONE_CLASSES[meta.tone]}`}>
                  {state === 'pending_vendor' && <Clock className="w-3 h-3" />}
                  {state === 'awaiting_payment' && <CreditCard className="w-3 h-3" />}
                  {state === 'confirmed_cancellable' && <CheckCircle2 className="w-3 h-3" />}
                  {state === 'confirmed_locked' && <Lock className="w-3 h-3" />}
                  {state === 'in_progress' && <Radio className="w-3 h-3" />}
                  {state === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  {state === 'cancelled' && <XCircle className="w-3 h-3" />}
                  {meta.label}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleMessageVendor} disabled={messaging} className="rounded-full">
                <MessageCircle className="w-4 h-4 mr-1.5" /> Message vendor
              </Button>
              {state === 'awaiting_payment' && (
                <Button size="sm" variant="gradient" onClick={handlePayNow} disabled={paying} className="rounded-full">
                  <CreditCard className="w-4 h-4 mr-1.5" /> Pay now
                </Button>
              )}
              {(state === 'pending_vendor' || state === 'confirmed_cancellable') && cancelStatus.canCancel && (
                <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)} className="rounded-full text-destructive hover:text-destructive">
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
              )}
              {state === 'completed' && (
                <Button size="sm" variant="gradient" onClick={() => setReviewOpen(true)} className="rounded-full">
                  <Star className="w-4 h-4 mr-1.5" /> Leave review
                </Button>
              )}
            </div>
          </div>

          {state === 'confirmed_locked' && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground inline-flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>The cancellation window has closed. Message your vendor for any change requests.</span>
            </div>
          )}
          {state === 'in_progress' && (
            <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm font-medium text-rose-700 dark:text-rose-400">
              Your event is live right now. Enjoy!
            </div>
          )}
          {state === 'cancelled' && booking.cancelled_at && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              Cancelled on {format(new Date(booking.cancelled_at), 'MMM d, yyyy')}.
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Event details */}
          <Card className="p-5 md:col-span-2 space-y-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Event details
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider">Date</div>
                <div className="font-medium">{fmtDate(start)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider">Time</div>
                <div className="font-medium">
                  {fmtTime(start)}{booking.end_time && !isNaN(end.getTime()) ? ` – ${fmtTime(end)}` : ''}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </div>
                <div className="font-medium">{fullAddress}</div>
              </div>
              {booking.units > 0 && (
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" /> Units / guests
                  </div>
                  <div className="font-medium">{booking.units}</div>
                </div>
              )}
              {(booking.setup_minutes || booking.breakdown_minutes) ? (
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Setup / breakdown</div>
                  <div className="font-medium">
                    {booking.setup_minutes ?? 0} min / {booking.breakdown_minutes ?? 0} min
                  </div>
                </div>
              ) : null}
            </div>

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer notes</div>
                  <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
                </div>
              </>
            )}

            {booking.add_ons?.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <PackageIcon className="w-3 h-3" /> Add-ons
                  </div>
                  <ul className="text-sm list-disc pl-5 space-y-0.5">
                    {booking.add_ons.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </>
            )}
          </Card>

          {/* Payment summary */}
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{fmtMoney(booking.total_price)}</span>
              </div>
              {Number(booking.deposit_amount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Deposit {booking.deposit_paid_at ? '(paid)' : '(due)'}
                  </span>
                  <span>{fmtMoney(Number(booking.deposit_amount) / 100)}</span>
                </div>
              )}
              {Number(booking.final_amount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Balance {booking.final_paid_at ? '(paid)' : '(due)'}
                  </span>
                  <span>{fmtMoney(Number(booking.final_amount) / 100)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Outstanding</span>
                <span className={totalDue > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                  {totalDue > 0 ? fmtMoney(totalDue) : 'Paid in full'}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground pt-1">
                Payment method: {booking.payment_method === 'cash' ? 'Cash at event' : 'Card on file'}
              </div>
            </div>
          </Card>
        </div>

        {/* Cancellation policy */}
        <Card className="p-5 mt-4">
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Cancellation policy
          </h2>
          <div className="text-sm">
            <span className="font-medium">{rule.label}</span>
            <span className="text-muted-foreground"> — {rule.description}</span>
          </div>
          {state === 'confirmed_cancellable' && (
            <p className="text-xs text-muted-foreground mt-2">
              {cancelStatus.refundPct === 100
                ? 'You are within the full refund window.'
                : `You are within a ${cancelStatus.refundPct}% refund window.`}
            </p>
          )}
          {state === 'confirmed_locked' && (
            <p className="text-xs text-muted-foreground mt-2">
              Online cancellation is no longer available for this booking.
            </p>
          )}
        </Card>

        {/* Reminder timeline */}
        <Card className="p-5 mt-4">
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Reminder timeline
          </h2>
          <ol className="relative border-l border-border ml-2 space-y-3">
            {reminderMilestones.map((m, i) => {
              const past = m.when ? new Date(m.when).getTime() <= Date.now() : false;
              return (
                <li key={i} className="ml-4">
                  <span className={`absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 ${past ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/40'}`} />
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${past ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</span>
                    {m.when && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(m.when), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] text-muted-foreground mt-3">
            Reminders are sent automatically via email and in-app notifications.
          </p>
        </Card>
      </div>

      {/* Dialogs */}
      <CancellationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        bookingId={booking.id}
        bookingType="booking"
        totalPaid={totalPaid}
        eventDate={booking.event_date}
        isPaid={!!booking.deposit_paid_at || !!booking.final_paid_at}
        cancellationPolicy={policy === 'custom' ? 'standard' : policy}
        onSuccess={() => navigate('/dashboard?tab=bookings')}
      />
      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        bookingId={booking.id}
        vendorUserId={booking.vendor_user_id ?? ''}
        vendorName={booking.vendor_display_name ?? 'Vendor'}
        packageId={booking.package_id}
        packageName={booking.package_name}
        eventDate={booking.event_date}
        reviewerName={user?.user_metadata?.full_name ?? user?.email ?? 'Customer'}
        reviewerAvatar={user?.user_metadata?.avatar_url}
      />
    </Layout>
  );
}
