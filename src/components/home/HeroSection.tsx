import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (selectedDate) params.set('date', selectedDate.toISOString());
    navigate(`/browse?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-white text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Don't just plan.
          <br />
          <span className="gradient-blurple-text">Experience.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          Book premium event professionals in minutes
        </motion.p>

        {/* Capsule Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="capsule-search max-w-3xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-stretch">
            {/* What's the occasion */}
            <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-border/30">
              <Search className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="What's the occasion?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Where */}
            <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-border/30">
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Where?"
                className="flex-1"
              />
            </div>

            {/* When */}
            <div className="flex items-center px-6 py-4">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center text-left flex-1 md:flex-none">
                    <Calendar className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                    <span className={`text-sm font-medium ${selectedDate ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {selectedDate ? format(selectedDate, 'MMM d') : 'When?'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-elevated" align="center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="ml-4 rounded-full w-12 h-12 p-0 shimmer-button flex-shrink-0"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
