import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Package, Calendar, MapPin, Loader2, ArrowRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PrivatePackageRow {
  id: string;
  package_name: string;
  status: string;
  total_price: number;
  deposit_amount: number | null;
  event_date: string | null;
  location: string | null;
  customer_email: string | null;
  customer_user_id: string | null;
  vendor_user_id: string;
  offer_expires_at: string | null;
  created_at: string;
  sent_at: string | null;
  paid_at: string | null;
}

interface PrivatePackagesListProps {
  role: 'Event Pro' | 'customer';
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  viewed: 'bg-primary/10 text-primary',
  accepted: 'bg-amber-500/10 text-amber-700',
  paid: 'bg-emerald-500/10 text-emerald-700',
  booked: 'bg-emerald-500/10 text-emerald-700',
  expired: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const FILTERS: { key: string; label: string; statuses: string[] }[] = [
  { key: 'active', label: 'Active', statuses: ['sent', 'viewed', 'accepted'] },
  { key: 'paid', label: 'Paid', statuses: ['paid', 'booked'] },
  { key: 'closed', label: 'Closed', statuses: ['expired', 'cancelled'] },
  { key: 'all', label: 'All', statuses: [] },
];

export function PrivatePackagesList({ role }: PrivatePackagesListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PrivatePackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      setLoading(true);
      const column = role === 'Event Pro' ? 'vendor_user_id' : 'customer_user_id';
      const { data } = await supabase
        .from('private_packages')
        .select(
          'id,package_name,status,total_price,deposit_amount,event_date,location,customer_email,customer_user_id,vendor_user_id,offer_expires_at,created_at,sent_at,paid_at'
        )
        .eq(column, user.id)
        .order('created_at', { ascending: false });
      if (active) {
        setItems((data ?? []) as PrivatePackageRow[]);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id, role]);

  const filterDef = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible =
    filterDef.statuses.length === 0
      ? items
      : items.filter((i) => filterDef.statuses.includes(i.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.statuses.length === 0
              ? items.length
              : items.filter((i) => f.statuses.includes(i.status)).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                filter === f.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {f.label} <span className="opacity-60">· {count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
          <Inbox className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">No private packages here</p>
          <p className="text-xs text-muted-foreground mt-1">
            {role === 'Event Pro'
              ? 'Create one from inside any message thread to send a custom offer.'
              : 'When a Event Pro sends you a custom offer, it will show up here.'}
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-2">
            {visible.map((p) => {
              const expired =
                p.offer_expires_at && isPast(new Date(p.offer_expires_at)) && !['paid', 'booked'].includes(p.status);
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/private-package/${p.id}`)}
                  className="w-full text-left rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <h4 className="font-semibold text-sm truncate">{p.package_name}</h4>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-[10px] uppercase shrink-0', STATUS_TONE[p.status] ?? STATUS_TONE.sent)}
                    >
                      {expired && p.status !== 'expired' ? 'Expired' : p.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                    {p.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(p.event_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {p.location && (
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3" />
                        {p.location}
                      </span>
                    )}
                    {role === 'Event Pro' && p.customer_email && (
                      <span className="truncate max-w-[200px]">to {p.customer_email}</span>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-base font-bold">${Number(p.total_price).toFixed(2)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(p.sent_at ?? p.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
