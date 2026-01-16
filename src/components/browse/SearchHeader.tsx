import { Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from './LocationAutocomplete';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  location: string;
  setLocation: (location: string) => void;
  date: string;
  setDate: (date: string) => void;
}

export function SearchHeader({
  searchQuery,
  setSearchQuery,
  location,
  setLocation,
  date,
  setDate,
}: SearchHeaderProps) {
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    // Could store coordinates for map centering
    console.log('Selected place:', place);
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        {/* Turo-style compact search bar */}
        <div className="flex items-center gap-2 bg-secondary/50 rounded-full p-1.5 max-w-3xl mx-auto shadow-lg border border-border/50">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-transparent hover:border-border transition-colors">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm min-w-0"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border hidden sm:block" />

          {/* Location with Autocomplete */}
          <div className="hidden sm:flex items-center px-4 py-2 bg-card rounded-full border border-transparent hover:border-border transition-colors min-w-[140px]">
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Where"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border hidden md:block" />

          {/* Date */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-transparent hover:border-border transition-colors cursor-pointer">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="When"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm w-20"
            />
          </div>

          {/* Search Button */}
          <Button variant="gradient" size="icon" className="rounded-full shrink-0 h-10 w-10">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
