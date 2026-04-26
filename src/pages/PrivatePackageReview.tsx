import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Package,
  Users,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';

interface PrivatePackage {
  id: string;
  vendor_user_id: string;
  customer_user_id: string | null;
  customer_email: string | null;
  conversation_id: string | null;
  package_name: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  guest_count: number | null;
  location: string | null;
  menu_details: string | null;
  included_items: string[] | null;
  base_price: number;
  travel_fee: number | null;
  total_price: number;
  deposit_amount: number | null;
  status: string;
  offer_expires_at: string | null;
  cancellation_policy: string | null;
}

const SERVICE_FEE = 0.129;

export default function PrivatePackageReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<PrivatePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('private_packages')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (active) {
        if (error || !data) {
          toast.error('Package not found');
          navigate(-1);
          return;
        }
        setPkg(data as PrivatePackage);
        setLoading(false);

        // Mark as viewed if customer is opening it for the first time
        if (
          user?.id &&
          data.customer_user_id === user.id &&
          data.status === 'sent'
        ) {
          await supabase
            .from('private_packages')
            .update({ status: 'viewed', viewed_at: new Date().toISOString() })
            .eq('id', id);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id, navigate, user?.id]);

  const isCustomer = !!user && pkg?.customer_user_id === user.id;
  const isVendor = !!user && pkg?.vendor_user_id === user.id;
  const isExpired =
    pkg?.offer_expires_at && new Date(pkg.offer_expires_at) < new Date();
  const canPay = isCustomer && pkg && !isExpired && ['sent', 'viewed', 'accepted'].includes(pkg.status);

  const serviceFee = pkg ? Number(pkg.deposit_amount || pkg.total_price) * SERVICE_FEE : 0;
  const customerPaysNow = pkg
    ? Number(pkg.deposit_amount || pkg.total_price) + serviceFee
    : 0;

  const handlePay = async () => {
    if (!pkg || !user) return;
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-private-package-checkout',
        { body: { private_package_id: pkg.id } }
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(msg);
      setPaying(false);
    }
  };

  if (loading || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-5 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wide">
                <Package className="w-4 h-4" />
                Private Package Offer
              </div>
              <Badge variant="secondary" className="capitalize">
                {pkg.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{pkg.package_name}</h1>
            {pkg.description && (
              <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {pkg.event_date && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </div>
                  <div className="font-medium">
                    {format(new Date(pkg.event_date), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
              {pkg.start_time && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </div>
                  <div className="font-medium">{pkg.start_time.slice(0, 5)}</div>
                </div>
              )}
              {pkg.guest_count && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Users className="w-3.5 h-3.5" /> Guests
                  </div>
                  <div className="font-medium">{pkg.guest_count}</div>
                </div>
              )}
              {pkg.location && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </div>
                  <div className="font-medium truncate">{pkg.location}</div>
                </div>
              )}
            </div>

            {pkg.menu_details && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-2">Menu / details</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {pkg.menu_details}
                  </p>
                </div>
              </>
            )}

            {pkg.included_items && pkg.included_items.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-3">What's included</h3>
                  <ul className="space-y-2">
                    {pkg.included_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base price</span>
                <span>${Number(pkg.base_price).toFixed(2)}</span>
              </div>
              {pkg.travel_fee ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Travel fee</span>
                  <span>${Number(pkg.travel_fee).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Total</span>
                <span>${Number(pkg.total_price).toFixed(2)}</span>
              </div>

              {pkg.deposit_amount ? (
                <div className="rounded-lg bg-muted p-3 mt-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit due now</span>
                    <span className="font-medium">
                      ${Number(pkg.deposit_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Service fee (12.9%)</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator className="my-1.5" />
                  <div className="flex justify-between font-semibold">
                    <span>You pay today</span>
                    <span>${customerPaysNow.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Remaining balance due at event.
                  </div>
                </div>
              ) : null}
            </div>

            {pkg.offer_expires_at && (
              <p className="text-xs text-muted-foreground">
                Offer expires {format(new Date(pkg.offer_expires_at), 'MMM d, yyyy h:mm a')}
              </p>
            )}

            {isCustomer && canPay && (
              <Button
                onClick={handlePay}
                disabled={paying}
                size="lg"
                className="w-full"
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Book & pay deposit
              </Button>
            )}

            {isCustomer && isExpired && (
              <div className="rounded-lg bg-muted p-3 text-sm text-center text-muted-foreground">
                This offer has expired. Message the Event Pro for a new one.
              </div>
            )}

            {isCustomer && pkg.status === 'paid' && (
              <div className="rounded-lg bg-emerald-500/10 text-emerald-700 p-3 text-sm text-center font-medium">
                Payment received — your booking is confirmed!
              </div>
            )}

            {isVendor && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                Event Pro view — the customer can book and pay from this page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
