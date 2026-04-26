import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ShieldCheck, Zap, ChevronRight, Clock } from 'lucide-react';
import { VendorGroup } from '@/lib/groupPackagesByVendor';
import { format } from 'date-fns';

interface BrowseVendorCardProps {
  group: VendorGroup;
  /** Selected event date (yyyy-MM-dd) when the user has searched availability */
  date?: string | null;
  /** Selected start time HH:mm */
  startTime?: string | null;
}

const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const hr12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hr12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export function BrowseVendorCard({ group, date, startTime }: BrowseVendorCardProps) {
  const initials = group.vendor_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cityLine = [group.vendor_city, group.vendor_state].filter(Boolean).join(', ');

  // Public profile route — vendor profiles use /eventpro/{username} OR /vendor/{id}.
  // We fall back to /vendor/<user_id> which the existing router handles.
  const profileHref = `/vendor/${group.vendor_user_id}`;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5 pb-3 flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-border/50">
            <AvatarImage src={group.vendor_avatar ?? undefined} alt={group.vendor_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg font-semibold leading-tight truncate">
                {group.vendor_name}
              </h3>
              {group.is_verified && (
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-label="Verified" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
              {group.category && <span className="capitalize">{group.category}</span>}
              {cityLine && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {cityLine}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs mt-1 flex items-center gap-2 flex-wrap">
              {group.review_count > 0 ? (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {group.avg_rating.toFixed(1)}
                  <span className="text-muted-foreground font-normal">
                    ({group.review_count})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">New</span>
              )}
              {group.has_instant_book && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1">
                  <Zap className="w-3 h-3" /> Instant
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Availability pill */}
        {(date || startTime) && (
          <div className="px-5 pb-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Clock className="w-3 h-3" />
              Available
              {date && ` ${format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}`}
              {startTime && ` at ${formatTime(startTime)}`}
            </div>
          </div>
        )}

        {/* Package previews */}
        <div className="px-5 pt-2 pb-3 space-y-1.5">
          {group.packages.map((p) => (
            <Link
              key={p.id}
              to={`/package/${p.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2 -mx-1 rounded-xl hover:bg-secondary/60 transition-colors group/pkg"
            >
              <span className="text-sm font-medium truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                from <span className="font-semibold text-foreground">${Math.round(p.price)}</span>
              </span>
            </Link>
          ))}
          {group.packages.length === 0 && (
            <div className="text-xs text-muted-foreground px-3 py-2">
              No matching packages — view profile for full menu.
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-1">
          <Button asChild variant="outline" className="w-full rounded-xl group/cta">
            <Link to={profileHref}>
              View availability
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
