import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Search, Zap, ShieldCheck, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { serviceCategories } from '@/data/service-categories';

interface QuickFilters {
  instantBook: boolean;
  verified: boolean;
  topRated: boolean;
}

interface Props {
  /** Element to observe — sticky bar appears after this scrolls out of view */
  revealAfterRef?: React.RefObject<HTMLElement>;
  /** Initial values from the hero search */
  initialDate?: string;
  initialLocation?: string;
  initialVendorType?: string;
}

/**
 * Sticky mini-search bar that mirrors the Browse filters (date, location,
 * Event Pro type, plus quick filters) and routes to /browse with the same
 * query-string contract Browse already understands.
 */
export function StickyMiniSearch({
  revealAfterRef,
  initialDate = '',
  initialLocation = '',
  initialVendorType = '',
}: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [location, setLocation] = useState(initialLocation);
  const [vendorType, setVendorType] = useState(initialVendorType);
  const [quick, setQuick] = useState<QuickFilters>({
    instantBook: false,
    verified: false,
    topRated: false,
  });
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reveal after the hero search scrolls past, hide when back at top
  useEffect(() => {
    const target = revealAfterRef?.current ?? sentinelRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [revealAfterRef]);

  const buildHref = () => {
    const params = new URLSearchParams();
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    if (location) params.set('location', location);
    if (vendorType) params.set('category', vendorType);
    if (quick.instantBook) params.set('instantBook', '1');
    if (quick.verified) params.set('verified', '1');
    if (quick.topRated) params.set('minRating', '4.5');
    const qs = params.toString();
    return qs ? `/browse?${qs}` : '/browse';
  };

  const handleSearch = () => navigate(buildHref());

  const clearAll = () => {
    setDate(undefined);
    setLocation('');
    setVendorType('');
    setQuick({ instantBook: false, verified: false, topRated: false });
  };

  const hasAny =
    !!date || !!location || !!vendorType || quick.instantBook || quick.verified || quick.topRated;

  return (
    <>
      {/* Sentinel placed below the hero — when it leaves the viewport we show the bar */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div
        className={cn(
          'fixed left-0 right-0 top-16 z-40 transition-all duration-300',
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-background/95 backdrop-blur border border-border rounded-2xl shadow-lg p-2 sm:p-2.5">
            <div className="flex items-center gap-2">
              {/* Event Pro type */}
              <div className="hidden md:block min-w-[160px]">
                <Select value={vendorType} onValueChange={setVendorType}>
                  <SelectTrigger className="h-10 border-0 bg-secondary/50 hover:bg-secondary rounded-xl focus:ring-0">
                    <SelectValue placeholder="Any Event Pro" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex-1 min-w-0 flex items-center gap-2 px-3 h-10 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <LocationAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="City or ZIP"
                  />
                </div>
              </div>

              {/* Date */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                    type="button"
                  >
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className={cn(date ? 'text-foreground' : 'text-muted-foreground')}>
                      {date ? format(date, 'MMM d') : 'Add date'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>

              {/* Search */}
              <Button
                onClick={handleSearch}
                className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4"
              >
                <Search className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            {/* Quick filters */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <QuickChip
                active={quick.instantBook}
                onClick={() => setQuick((q) => ({ ...q, instantBook: !q.instantBook }))}
                icon={<Zap className="w-3.5 h-3.5" />}
                label="Instant book"
              />
              <QuickChip
                active={quick.verified}
                onClick={() => setQuick((q) => ({ ...q, verified: !q.verified }))}
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                label="Verified"
              />
              <QuickChip
                active={quick.topRated}
                onClick={() => setQuick((q) => ({ ...q, topRated: !q.topRated }))}
                icon={<Star className="w-3.5 h-3.5" />}
                label="Top rated"
              />
              {/* Mobile-only date chip */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="sm:hidden inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs bg-secondary hover:bg-secondary/80"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {date ? format(date, 'MMM d') : 'Date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>

              {hasAny && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 h-7 rounded-full"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function QuickChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs whitespace-nowrap transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'bg-secondary text-foreground hover:bg-secondary/80'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
