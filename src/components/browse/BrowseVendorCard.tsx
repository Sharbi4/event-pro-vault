import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingDisplay } from '@/components/shared/RatingDisplay';
import { MapPin, ShieldCheck, Zap, ChevronRight, Clock, Utensils } from 'lucide-react';
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
    <Card className="group relative overflow-hidden rounded-[20px] border border-border/60 bg-card shadow-sm transition-all duration-500 ease-out hover:shadow-[0_12px_48px_-12px_hsl(var(--primary)/0.14)] hover:border-primary/20">
      {/* Ambient hover glow — pseudo-element so it never shifts layout */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
      </div>

      <CardContent className="relative p-0">
        {/* Hero image */}
        <Link
          to={profileHref}
          className="block relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset rounded-t-[20px]"
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={`${group.vendor_name} – ${group.category ?? 'food'}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl select-none">
              {emoji}
            </div>
          )}

          {/* Bottom gradient — intensifies on hover */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none transition-opacity duration-500 group-hover:from-black/40" />

          {/* Top-right trust pills */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {group.is_verified && (
              <Badge className="bg-background/90 text-foreground border border-border/40 backdrop-blur-md shadow-sm gap-1 h-6 px-2 font-medium transition-transform duration-300 group-hover:scale-[1.02]">
                <ShieldCheck className="w-3 h-3 text-primary" /> Verified
              </Badge>
            )}
            {group.has_instant_book && (
              <Badge className="bg-foreground text-background border-0 shadow-sm gap-1 h-6 px-2 font-medium transition-transform duration-300 group-hover:scale-[1.02]">
                <Zap className="w-3 h-3" /> Instant
              </Badge>
            )}
          </div>

          {/* Availability pill */}
          {availabilityLabel && (
            <div className="absolute bottom-3 right-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                <Clock className="w-3 h-3" />
                {availabilityLabel}
              </div>
            </div>
          )}

          {/* Logo overlay */}
          <div className="absolute -bottom-6 left-5">
            <Avatar className="h-14 w-14 ring-[3px] ring-background shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:scale-[1.03]">
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
              <Link to={profileHref} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded">
                <h3 className="font-display text-[17px] font-semibold leading-tight tracking-tight truncate transition-colors duration-300 group-hover:text-primary">
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
              <RatingDisplay
                avgRating={group.avg_rating}
                reviewCount={group.review_count}
                size="sm"
                variant="inline"
              />
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
                className={`relative flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-300 ease-out hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset ${
                  idx === 2 ? 'hidden sm:flex' : 'flex'
                }`}
              >
                {/* Subtle left accent on hover */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 rounded-r-full bg-primary/60 transition-all duration-300 group-hover/row:h-6 opacity-0 group-hover/row:opacity-100" />
                <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center text-xl shadow-sm">
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
              <Badge key={b} variant="secondary" className="text-[10px] h-5 px-2 font-medium rounded-full bg-secondary/70 transition-colors duration-300 hover:bg-secondary">
                {b}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-5 pt-1">
          <Button
            asChild
            className="w-full h-11 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium tracking-tight group/cta shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-foreground/10"
          >
            <Link to={profileHref} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              View availability
              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
