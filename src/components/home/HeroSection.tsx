import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar as CalendarIcon, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { serviceCategories } from '@/data/service-categories';
import { AIConciergeDrawer } from './AIConciergeDrawer';
import heroFood from '@/assets/home/hero-food.jpg';

const CUISINES = ['Tacos', 'BBQ', 'Burgers', 'Pizza', 'Brunch', 'Desserts', 'Coffee', 'Vegan', 'Latin', 'Wings', 'Seafood'];
const GUEST_RANGES = [
  { label: 'Up to 25', value: '25' },
  { label: '25–50', value: '50' },
  { label: '50–100', value: '100' },
  { label: '100–250', value: '250' },
  { label: '250+', value: '500' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [vendorType, setVendorType] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('');
  const [guests, setGuests] = useState<string>('');
  const [aiOpen, setAiOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (vendorType) params.set('category', vendorType);
    if (cuisine) params.set('q', cuisine);
    if (location) params.set('location', location);
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    if (guests) params.set('guests', guests);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero image with warm overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroFood}
          alt="Premium food experiences"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="container mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-16 relative">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
            Book food trucks, mobile bars, and dessert vendors{' '}
            <span className="gradient-text">for your next event.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8">
            Search by date, location, cuisine, and vendor type. Compare packages, message vendors, and book confidently through EventPro.
          </p>

          {/* Premium search card */}
          <div className="bg-card/95 backdrop-blur border border-border rounded-3xl p-3 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* Date */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="md:col-span-3 flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-secondary/50 transition-colors text-left">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">When</div>
                      <div className={cn('text-sm truncate', date ? 'text-foreground' : 'text-muted-foreground')}>
                        {date ? format(date, 'MMM d, yyyy') : 'Add date'}
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
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>

              {/* Location */}
              <div className="md:col-span-3 px-4 py-2 rounded-2xl hover:bg-secondary/50 transition-colors">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Where</div>
                <LocationAutocomplete value={location} onChange={setLocation} placeholder="City or ZIP" />
              </div>

              {/* Vendor Type */}
              <div className="md:col-span-2">
                <Select value={vendorType} onValueChange={setVendorType}>
                  <SelectTrigger className="h-full border-0 bg-transparent hover:bg-secondary/50 rounded-2xl px-4 py-3 focus:ring-0">
                    <div className="text-left min-w-0 w-full">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor</div>
                      <SelectValue placeholder="Any type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cuisine */}
              <div className="md:col-span-2">
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger className="h-full border-0 bg-transparent hover:bg-secondary/50 rounded-2xl px-4 py-3 focus:ring-0">
                    <div className="text-left min-w-0 w-full">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cuisine</div>
                      <SelectValue placeholder="Any" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Guests + Search */}
              <div className="md:col-span-2 flex gap-2 items-center">
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="h-full flex-1 border-0 bg-transparent hover:bg-secondary/50 rounded-2xl px-3 py-3 focus:ring-0">
                    <div className="text-left min-w-0 w-full flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guests</div>
                        <SelectValue placeholder="Any" />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {GUEST_RANGES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="gradient" size="icon" onClick={handleSearch} className="rounded-2xl h-12 w-12 shrink-0" aria-label="Search vendors">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* AI assist CTA */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => setAiOpen(true)}
              className="rounded-full pl-3 pr-4 h-10 bg-secondary/60 hover:bg-secondary border border-border/60"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Let AI help me choose</span>
            </Button>
            <span className="text-xs text-muted-foreground">Not sure what you need? EventPro Assistant will guide you.</span>
          </div>
        </div>
      </div>

      <AIConciergeDrawer open={aiOpen} onOpenChange={setAiOpen} />
    </section>
  );
}
