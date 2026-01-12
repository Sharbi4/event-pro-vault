import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    navigate('/browse');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-trust rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-medium">10,000+</span> event hosts
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Book premium event pros{' '}
            <span className="gradient-text">in minutes.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Hourly or daily. Packages built for your vibe. Reviews you can trust.
          </p>

          {/* Search Bar */}
          <div className="glass-card p-3 rounded-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Location */}
              <div className="flex-1 flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="City or zip code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Date */}
              <div className="flex-1 flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Event date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Category Select */}
              <div className="flex-1 flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <select className="flex-1 bg-transparent text-muted-foreground focus:outline-none cursor-pointer">
                  <option value="">Any category</option>
                  <option value="food-trucks">Food Trucks</option>
                  <option value="catering">Catering</option>
                  <option value="djs">DJs</option>
                  <option value="bartending">Bartending</option>
                  <option value="rentals">Rentals</option>
                </select>
              </div>

              {/* Search Button */}
              <Button 
                variant="gradient" 
                size="xl"
                onClick={handleSearch}
                className="lg:w-auto w-full"
              >
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="text-sm text-muted-foreground">Popular:</span>
            <button className="px-4 py-2 text-sm text-foreground bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
              DJs
            </button>
            <button className="px-4 py-2 text-sm text-foreground bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
              Food Trucks
            </button>
            <button className="px-4 py-2 text-sm text-foreground bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
              Bartending
            </button>
            <button className="px-4 py-2 text-sm text-foreground bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
              Photo Booths
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
