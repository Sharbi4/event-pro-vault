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

  // Pick the best hero image across this vendor's previewed packages
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
    <Card className="group overflow-hidden rounded-2xl border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card">
      <CardContent className="p-0">
        {/* Hero image */}
        <Link to={profileHref} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary">
          {heroImage ? (
            <img
              src={heroImage}
              alt={`${group.vendor_name} – ${group.category ?? 'food'}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl select-none">
              {emoji}
            </div>
          )}

          {/* Top-right trust pills */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {group.is_verified && (
              <Badge className="bg-background/95 text-foreground border-border/50 backdrop-blur-sm shadow-sm gap-1 h-6">
                <ShieldCheck className="w-3 h-3 text-primary" /> Verified
              </Badge>
            )}
            {group.has_instant_book && (
              <Badge className="bg-primary text-primary-foreground border-0 shadow-sm gap-1 h-6">
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
          <div className="absolute -bottom-5 left-4">
            <Avatar className="h-14 w-14 ring-4 ring-background shadow-lg">
              <AvatarImage src={group.vendor_avatar ?? undefined} alt={group.vendor_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>

        {/* Header */}
        <div className="px-5 pt-7 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={profileHref}>
                <h3 className="font-display text-lg font-bold leading-tight truncate group-hover:text-primary transition-colors">
                  {group.vendor_name}
                </h3>
              </Link>
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
            </div>
            <div className="shrink-0 text-right">
              {group.review_count > 0 ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {group.avg_rating.toFixed(1)}
                  <span className="text-muted-foreground font-normal text-xs">
                    ({group.review_count})
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">New</span>
              )}
            </div>
          </div>
        </div>

        {/* Starting price */}
        {Number.isFinite(group.starting_price) && group.starting_price > 0 && (
          <div className="px-5 pb-2 text-xs text-muted-foreground">
            Starting at{' '}
            <span className="font-semibold text-foreground">
              ${Math.round(group.starting_price)}
            </span>
          </div>
        )}

        {/* Package previews */}
        <div className="px-3 pb-2 space-y-1">
          {group.packages.slice(0, 3).map((p, idx) => {
            const thumb = p.images?.[0];
            return (
              <Link
                key={p.id}
                to={`/package/${p.id}`}
                className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary/60 transition-colors ${
                  idx === 2 ? 'hidden sm:flex' : 'flex'
                }`}
              >
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center text-2xl">
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
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{subline(p)}</div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0 text-right">
                  from{' '}
                  <span className="font-semibold text-foreground">{formatPrice(p)}</span>
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
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {bookingBadges.map((b) => (
              <Badge key={b} variant="secondary" className="text-[10px] h-5 px-2 font-medium">
                {b}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-5 pt-1">
          <Button
            asChild
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground group/cta"
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
