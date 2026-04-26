import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    navigate(`/browse?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setCalendarOpen(false);
  };

  return (
    <section className="relative pt-8 pb-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="hero-gradient-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Compact headline */}
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Book food trucks & mobile food pros <span className="gradient-text">near you</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Food trucks, caterers, mobile bartenders, bakers and more — booked by date, time, and location.
            </p>
          </div>

          {/* Turo-style Search Bar */}
          <div className="bg-card border border-border rounded-full p-1.5 shadow-xl max-w-3xl mx-auto">
            <div className="flex items-center gap-1">
              {/* Search Query */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-transparent rounded-full hover:bg-secondary/30 transition-colors">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Food trucks, caterers, bartenders…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                />
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-border hidden sm:block" />

              {/* Location */}
              <div className="hidden sm:flex items-center px-4 py-3 rounded-full hover:bg-secondary/30 transition-colors min-w-[160px]">
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Where"
                />
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-border hidden md:block" />

              {/* Date Picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="hidden md:flex items-center gap-3 px-4 py-3 rounded-full hover:bg-secondary/30 transition-colors">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className={cn(
                      "text-sm whitespace-nowrap",
                      date ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {date ? format(date, "MMM d, yyyy") : "When"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(d) => d < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button 
                variant="gradient" 
                size="icon"
                onClick={handleSearch}
                className="rounded-full h-12 w-12 shrink-0"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}