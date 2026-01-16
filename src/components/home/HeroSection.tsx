import { Button } from '@/components/ui/button';
import { Search, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    navigate(`/browse?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative pt-8 pb-4 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 left-1/4 w-1/2 h-48 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Compact headline */}
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Find event pros <span className="gradient-text">near you</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Book food trucks, DJs, caterers, and more for your next event
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
                  placeholder="What do you need?"
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

              {/* Date */}
              <div className="hidden md:flex items-center gap-3 px-4 py-3 rounded-full hover:bg-secondary/30 transition-colors">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="When"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none w-24"
                />
              </div>

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