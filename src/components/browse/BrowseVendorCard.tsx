import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ShieldCheck, Zap, ChevronRight, Clock, Utensils } from 'lucide-react';
import { VendorGroup } from '@/lib/groupPackagesByVendor';
import { BrowsePackage } from '@/hooks/useBrowsePackages';
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

const categoryEmoji = (category?: string | null) => {
  const c = (category ?? '').toLowerCase();
  if (c.includes('taco') || c.includes('mexican')) return '🌮';
  if (c.includes('bar') || c.includes('cocktail') || c.includes('beverage')) return '🍸';
  if (c.includes('coffee') || c.includes('espresso')) return '☕';
  if (c.includes('cake') || c.includes('dessert') || c.includes('bake') || c.includes('sweet')) return '🧁';
  if (c.includes('pizza')) return '🍕';
  if (c.includes('bbq') || c.includes('barbecue') || c.includes('grill')) return '🍖';
  if (c.includes('burger')) return '🍔';
  if (c.includes('ice') || c.includes('cream')) return '🍦';
  if (c.includes('truck') || c.includes('catering') || c.includes('food')) return '🍽️';
  return '🍽️';
};

const formatPrice = (p: BrowsePackage) => {
  const price = Math.round(p.price);
  if (p.type === 'per_person' || (p as any).pricing_type === 'per_person') return `$${price}/pp`;
  return `$${price}`;
};

const subline = (p: BrowsePackage) => {
  // Best effort secondary line: duration / min units / type
  const min = (p as any).min_units;
  const t = p.type?.toLowerCase() ?? '';
  if (t.includes('hour') || t === 'hourly') return `${min ?? 1} hr min`;
  if (t.includes('person') || t === 'per_person') return min ? `${min}+ guests` : 'Per person';
  if (t.includes('day') || t === 'daily') return 'Daily';
  return min && min > 1 ? `${min} min` : 'Flat rate';
};

const bookingTypeBadges = (group: VendorGroup): string[] => {
  const labels = new Set<string>();
  for (const p of group.packages) {
    const t = (p.type ?? '').toLowerCase();
    if (t.includes('pull') || t === 'pullup') labels.add('Pull-Up');
    else if (t.includes('cater') || t.includes('person') || t === 'per_person') labels.add('Catering');
    else if (t.includes('private')) labels.add('Private');
  }
  // Heuristic fallback: at least one tag
  if (labels.size === 0) labels.add('Catering');
  return Array.from(labels).slice(0, 3);
};

export function BrowseVendorCard({ group, date, startTime }: BrowseVendorCardProps) {
  const initials = group.vendor_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cityLine = [group.vendor_city, group.vendor_state].filter(Boolean).join(', ');
  const profileHref = `/vendor/${group.vendor_user_id}`;

  // Pick the best hero image across this Event Pro's previewed packages
  const heroImage = group.packages
    .map((p) => p.images?.[0])
    .find((img): img is string => !!img);

  const emoji = categoryEmoji(group.category);
  const bookingBadges = bookingTypeBadges(group);

  const availabilityLabel = (() => {
    if (!date && !startTime) return null;
    const parts: string[] = ['Available'];
    if (date) parts.push(format(new Date(date + 'T00:00:00'), 'EEE, MMM d'));
    if (startTime) parts.push(`at ${formatTime(startTime)}`);
    return parts.join(' ');
  })();

  return (
    <Card className="group overflow-hidden rounded-[20px] border border-border/60 hover:border-foreground/20 shadow-sm hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] transition-all duration-500 bg-card">
      <CardContent className="p-0">
        {/* Hero image */}
        <Link to={profileHref} className="block relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary">
          {heroImage ? (
            <img
              src={heroImage}
              alt={`${group.vendor_name} – ${group.category ?? 'food'}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl select-none">
              {emoji}
            </div>
          )}

          {/* Subtle bottom gradient for legibility of overlays */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

          {/* Top-right trust pills */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {group.is_verified && (
              <Badge className="bg-background/90 text-foreground border border-border/40 backdrop-blur-md shadow-sm gap-1 h-6 px-2 font-medium">
                <ShieldCheck className="w-3 h-3 text-primary" /> Verified
              </Badge>
            )}
            {group.has_instant_book && (
              <Badge className="bg-foreground text-background border-0 shadow-sm gap-1 h-6 px-2 font-medium">
                <Zap className="w-3 h-3" /> Instant
              </Badge>
            )}
          </div>

          {/* Availability pill — bottom-right of hero */}
          {availabilityLabel && (
            <div className="absolute bottom-3 right-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md">
                <Clock className="w-3 h-3" />
                {availabilityLabel}
              </div>
            </div>
          )}

          {/* Logo overlay — bottom-left */}
          <div className="absolute -bottom-6 left-5">
            <Avatar className="h-14 w-14 ring-[3px] ring-background shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]">
              <AvatarImage src={group.vendor_avatar ?? undefined} alt={group.vendor_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>

        {/* Header */}
        <div className="px-5 pt-8 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={profileHref}>
                <h3 className="font-display text-[17px] font-semibold leading-tight tracking-tight truncate group-hover:text-primary transition-colors">
                  {group.vendor_name}
                </h3>
              </Link>
              <div className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                {group.category && <span className="capitalize">{group.category}</span>}
                {cityLine && (
                  <>
                    <span aria-hidden className="text-border">·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {cityLine}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {group.review_count > 0 ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {group.avg_rating.toFixed(1)}
                  <span className="text-muted-foreground font-normal text-[11px]">
                    ({group.review_count})
                  </span>
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">New</span>
              )}
            </div>
          </div>

          {/* Starting price */}
          {Number.isFinite(group.starting_price) && group.starting_price > 0 && (
            <div className="mt-2 text-[12px] text-muted-foreground">
              Starting at{' '}
              <span className="font-semibold text-foreground tabular-nums">
                ${Math.round(group.starting_price)}
              </span>
            </div>
          )}
        </div>

        {/* Hairline divider */}
        <div className="mx-5 h-px bg-border/60" />

        {/* Package previews */}
        <div className="px-3 py-2 divide-y divide-border/40">
          {group.packages.slice(0, 3).map((p, idx) => {
            const thumb = p.images?.[0];
            return (
              <Link
                key={p.id}
                to={`/package/${p.id}`}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors ${
                  idx === 2 ? 'hidden sm:flex' : 'flex'
                }`}
              >
                <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center text-xl">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>{categoryEmoji(p.category ?? group.category)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium truncate leading-snug">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">{subline(p)}</div>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 text-right tabular-nums">
                  from{' '}
                  <span className="font-semibold text-foreground text-[13px]">{formatPrice(p)}</span>
                </div>
              </Link>
            );
          })}
          {group.packages.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-3">
              <Utensils className="w-4 h-4" />
              View profile for full menu.
            </div>
          )}
        </div>

        {/* Booking type badges */}
        {bookingBadges.length > 0 && (
          <div className="px-5 pt-1 pb-3 flex flex-wrap gap-1.5">
            {bookingBadges.map((b) => (
              <Badge key={b} variant="secondary" className="text-[10px] h-5 px-2 font-medium rounded-full bg-secondary/70">
                {b}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-5 pt-1">
          <Button
            asChild
            className="w-full h-11 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium tracking-tight group/cta shadow-sm"
          >
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

