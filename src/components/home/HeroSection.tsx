import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Calendar as CalendarIcon, Sparkles, Users, MapPin, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { serviceCategories } from '@/data/service-categories';
import { AIConciergeDrawer } from './AIConciergeDrawer';
import heroEvent from '@/assets/home/hero-event.jpg';

const CUISINES = ['Tacos', 'BBQ', 'Burgers', 'Pizza', 'Brunch', 'Desserts', 'Coffee', 'Vegan', 'Latin', 'Wings', 'Seafood'];
const GUEST_RANGES = [
  { label: 'Up to 25', value: '25' },
  { label: '25–50', value: '50' },
  { label: '50–100', value: '100' },
  { label: '100–250', value: '250' },
  { label: '250+', value: '500' },
];

const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = [];
  for (let h = 8; h <= 23; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? 'AM' : 'PM';
      out.push({ value, label: `${hour12}:${String(m).padStart(2, '0')} ${ampm}` });
    }
  }
  return out;
})();

const addHours = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + hours * 60;
  const eh = Math.min(23, Math.floor(total / 60));
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
};

export function HeroSection() {
  const navigate = useNavigate();
  const [vendorType, setVendorType] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{
    lat: number; lng: number; city?: string; state?: string;
  } | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (vendorType) params.set('category', vendorType);
    if (location) params.set('location', location);
    // Forward canonical coords so /browse uses lat/lng radius search immediately.
    if (locationCoords) {
      params.set('lat', String(locationCoords.lat));
      params.set('lng', String(locationCoords.lng));
      if (locationCoords.city) params.set('city', locationCoords.city);
      if (locationCoords.state) params.set('state', locationCoords.state);
    }
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    if (time) {
      params.set('start', time);
      params.set('end', addHours(time, 3));
    }
    if (guests) params.set('guests', guests);
    if (cuisine) params.set('q', cuisine);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Cinematic full-bleed background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroEvent}
          alt=""
          className="w-full h-full object-cover scale-105"
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          {...({ fetchpriority: 'high' } as Record<string, string>)}
        />
        {/* Editorial gradient stack — deep, moody, focuses eye */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_transparent_0%,_hsl(var(--background))_85%)]" />
      </div>

      <div className="container mx-auto px-4 pt-20 md:pt-32 pb-16 md:pb-24 relative">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            EventPros · On-site catering & beverage
          </div>

          {/* Editorial headline */}
          <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-[-0.02em] mb-6">
            Unforgettable
            <br />
            events,{' '}
            <span className="italic font-light gradient-text">
              served.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground/90 max-w-md mb-10 leading-relaxed">
            Food trucks, mobile bars, private chefs, and dessert pros — booked in minutes.
          </p>

          {/* Refined search — pill, three primary fields, more behind a sheet */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl md:rounded-full p-2 shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.25)]">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-0">
              {/* Where */}
              <div className="flex-1 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Where</div>
                   <LocationAutocomplete
                     value={location}
                     onChange={(v) => {
                       setLocation(v);
                       // If user edits text manually, drop stale coords so radius
                       // search re-resolves the new place.
                       setLocationCoords(null);
                     }}
                     onPlaceSelect={(place) => {
                       setLocation(place.city ? (place.state ? `${place.city}, ${place.state}` : place.city) : place.formatted_address);
                       setLocationCoords({
                         lat: place.lat,
                         lng: place.lng,
                         city: place.city,
                         state: place.state,
                       });
                     }}
                     placeholder="Anywhere"
                   />
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-border/60" />

              {/* When */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-secondary/50 transition-colors text-left">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">When</div>
                      <div className={cn('text-sm truncate', date ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                        {date ? format(date, 'EEE, MMM d') : 'Any date'}
                      </div>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setCalendarOpen(false); }}
                    initialFocus
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden md:block w-px h-8 bg-border/60" />

              {/* Guests */}
              <div className="flex-1 px-1 md:px-2">
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="border-0 bg-transparent hover:bg-secondary/50 rounded-xl md:rounded-full px-3 py-2.5 md:py-2 h-auto focus:ring-0">
                    <div className="flex items-center gap-2 w-full text-left">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guests</div>
                        <SelectValue placeholder="Any size" />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {GUEST_RANGES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search button */}
              <Button
                variant="gradient"
                onClick={handleSearch}
                className="rounded-xl md:rounded-full h-12 md:h-12 px-6 font-semibold shrink-0 shadow-lg"
                aria-label="Search Event Pros"
              >
                <Search className="w-4 h-4 md:mr-2" />
                <span className="md:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Secondary actions — minimal, refined */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiOpen(true)}
              className="rounded-full h-9 px-4 bg-foreground/5 hover:bg-foreground/10 backdrop-blur"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
              <span className="text-sm">Help me choose</span>
            </Button>

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-9 px-4 bg-foreground/5 hover:bg-foreground/10 backdrop-blur"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                  <span className="text-sm">Refine</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="font-display text-2xl">Refine your search</SheetTitle>
                </SheetHeader>
                <div className="space-y-5 pb-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Event Pro type</label>
                    <Select value={vendorType} onValueChange={setVendorType}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Any Event Pro" /></SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Cuisine</label>
                    <Select value={cuisine} onValueChange={setCuisine}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Any cuisine" /></SelectTrigger>
                      <SelectContent>
                        {CUISINES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Start time</label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Any time" /></SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="gradient"
                    onClick={() => { setMoreOpen(false); handleSearch(); }}
                    className="w-full h-12 rounded-xl font-semibold mt-2"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Apply & search
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AIConciergeDrawer open={aiOpen} onOpenChange={setAiOpen} />
    </section>
  );
}
