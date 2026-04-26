import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Loader2, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PrivatePackageCardProps {
  packageId: string;
  isVendor: boolean;
}

interface PrivatePackage {
  id: string;
  package_name: string;
  description: string | null;
  total_price: number;
  deposit_amount: number | null;
  status: string;
  event_date: string | null;
  start_time: string | null;
  guest_count: number | null;
  location: string | null;
  offer_expires_at: string | null;
}

const statusVariant: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', tone: 'bg-primary/10 text-primary' },
  viewed: { label: 'Viewed', tone: 'bg-primary/10 text-primary' },
  accepted: { label: 'Accepted', tone: 'bg-emerald-500/10 text-emerald-700' },
  paid: { label: 'Paid', tone: 'bg-emerald-500/10 text-emerald-700' },
  booked: { label: 'Booked', tone: 'bg-emerald-500/10 text-emerald-700' },
  expired: { label: 'Expired', tone: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', tone: 'bg-destructive/10 text-destructive' },
};

export function PrivatePackageCard({ packageId, isVendor }: PrivatePackageCardProps) {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PrivatePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('private_packages')
        .select('id,package_name,description,total_price,deposit_amount,status,event_date,start_time,guest_count,location,offer_expires_at')
        .eq('id', packageId)
        .maybeSingle();
      if (active) {
        setPkg(data as PrivatePackage | null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [packageId]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 max-w-sm flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading package…
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="rounded-xl border bg-card p-4 max-w-sm text-sm text-muted-foreground">
        Package unavailable
      </div>
    );
  }

  const status = statusVariant[pkg.status] ?? statusVariant.sent;
  const isActionable = ['sent', 'viewed', 'accepted'].includes(pkg.status);

  return (
    <div className="rounded-xl border bg-card overflow-hidden max-w-sm shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-muted/40">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Package className="w-3.5 h-3.5" />
          PRIVATE PACKAGE
        </div>
        <Badge variant="secondary" className={cn('text-[10px] uppercase tracking-wide', status.tone)}>
          {status.label}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-sm leading-tight">{pkg.package_name}</h4>
          {pkg.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pkg.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
          {pkg.event_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(pkg.event_date), 'MMM d, yyyy')}
            </div>
          )}
          {pkg.start_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {pkg.start_time.slice(0, 5)}
            </div>
          )}
          {pkg.guest_count && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {pkg.guest_count} guests
            </div>
          )}
          {pkg.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{pkg.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-2 border-t">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</div>
            <div className="text-lg font-bold">${Number(pkg.total_price).toFixed(2)}</div>
            {pkg.deposit_amount ? (
              <div className="text-[11px] text-muted-foreground">
                ${Number(pkg.deposit_amount).toFixed(2)} deposit
              </div>
            ) : null}
          </div>

          <Button
            size="sm"
            variant={isActionable && !isVendor ? 'default' : 'outline'}
            onClick={() => navigate(`/private-package/${pkg.id}`)}
            className="gap-1"
          >
            {isVendor ? 'View' : isActionable ? 'Review & book' : 'View'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
