import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Search, MapPin, CalendarDays, Clock, X, 
  Zap, ShieldCheck, Star, DollarSign
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { serviceCategories } from '@/data/service-categories';
import { TimeRangePicker } from './TimeRangePicker';
import { LocationAutocomplete } from './LocationAutocomplete';

interface PlaceCoords {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  formattedAddress?: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    search: string;
    location: string;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    category: string | null;
    instantBook: boolean;
    verified: boolean;
    minRating: number | null;
    minPrice: number | null;
    maxPrice: number | null;
  };
  onApplyFilters: (filters: {
    search: string;
    location: string;
    locationCoords: PlaceCoords | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    category: string | null;
    instantBook: boolean;
    verified: boolean;
    minRating: number | null;
    minPrice: number | null;
    maxPrice: number | null;
  }) => void;
  onClearFilters: () => void;
}

export function SearchModal({ 
  open, 
  onOpenChange, 
  filters: initialFilters,
  onApplyFilters,
  onClearFilters 
}: SearchModalProps) {
  // Local state for the modal
  const [search, setSearch] = useState(initialFilters.search);
  const [location, setLocation] = useState(initialFilters.location);
  const [locationCoords, setLocationCoords] = useState<PlaceCoords | null>(null);
  const [date, setDate] = useState<string | null>(initialFilters.date);
  const [startTime, setStartTime] = useState<string | null>(initialFilters.startTime);
  const [endTime, setEndTime] = useState<string | null>(initialFilters.endTime);
  const [category, setCategory] = useState<string | null>(initialFilters.category);
  const [instantBook, setInstantBook] = useState(initialFilters.instantBook);
  const [verified, setVerified] = useState(initialFilters.verified);
  const [minRating, setMinRating] = useState<number | null>(initialFilters.minRating);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 5000
  ]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Sync local state when modal opens
  useEffect(() => {
    if (open) {
      setSearch(initialFilters.search);
      setLocation(initialFilters.location);
      setLocationCoords(null);
      setDate(initialFilters.date);
      setStartTime(initialFilters.startTime);
      setEndTime(initialFilters.endTime);
      setCategory(initialFilters.category);
      setInstantBook(initialFilters.instantBook);
      setVerified(initialFilters.verified);
      setMinRating(initialFilters.minRating);
      setPriceRange([
        initialFilters.minPrice || 0,
        initialFilters.maxPrice || 5000
      ]);
    }
  }, [open, initialFilters]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null);
    setDatePickerOpen(false);
  };

  const handleStartTimeChange = (time: string | null) => {
    if (time === 'clear') {
      setStartTime(null);
      setEndTime(null);
    } else {
      setStartTime(time);
    }
  };

  const handleEndTimeChange = (time: string | null) => {
    if (time === 'clear') {
      setEndTime(null);
    } else {
      setEndTime(time);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      search,
      location,
      locationCoords,
      date,
      startTime,
      endTime,
      category,
      instantBook,
      verified,
      minRating,
      minPrice: priceRange[0] > 0 ? priceRange[0] : null,
      maxPrice: priceRange[1] < 5000 ? priceRange[1] : null,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    setLocationCoords(null);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setCategory(null);
    setInstantBook(false);
    setVerified(false);
    setMinRating(null);
    setPriceRange([0, 5000]);
    onClearFilters();
  };

  const activeFiltersCount = [
    search, location, date, startTime, category, 
    instantBook, verified, minRating,
    priceRange[0] > 0, priceRange[1] < 5000
  ].filter(Boolean).length;

  const formatPrice = (value: number) => {
    if (value >= 5000) return '$5,000+';
    return `$${value.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] max-h-[800px] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-display">Search & Filters</DialogTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                Clear all
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Search & Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Search</h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="What are you looking for?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                  />
                </div>
                
                <div className="relative flex items-center gap-2 pl-3 h-12 bg-card border border-border rounded-md">
                  <LocationAutocomplete
                    value={location}
                    onChange={(v) => {
                      setLocation(v);
                      setLocationCoords(null);
                    }}
                    onPlaceSelect={(place) => {
                      setLocation(
                        place.city
                          ? place.state ? `${place.city}, ${place.state}` : place.city
                          : place.formatted_address
                      );
                      setLocationCoords({
                        lat: place.lat,
                        lng: place.lng,
                        city: place.city,
                        state: place.state,
                        formattedAddress: place.formatted_address,
                      });
                    }}
                    placeholder="Location (city, state)"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Date & Time</h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "h-12 flex-1 justify-start gap-2",
                        date ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <CalendarDays className="w-4 h-4" />
                      {date ? format(new Date(date), 'MMMM d, yyyy') : 'Select event date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ? new Date(date) : undefined}
                      onSelect={handleDateChange}
                      disabled={(d) => d < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                    {date && (
                      <div className="p-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setDate(null);
                            setDatePickerOpen(false);
                          }}
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <Label className="text-sm text-muted-foreground shrink-0">Time range:</Label>
              </div>
              <TimeRangePicker
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
              />
            </div>

            {/* Category */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Category</h3>
              
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={category === cat.id ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "rounded-full gap-1.5",
                      category === cat.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                  >
                    {cat.name}
                    {category === cat.id && <X className="w-3 h-3" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Price Range</h3>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                </span>
              </div>
              
              <div className="px-2 py-4">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={5000}
                  step={50}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$5,000+</span>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Quick Filters</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={instantBook ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => setInstantBook(!instantBook)}
                >
                  <Zap className={cn("w-3.5 h-3.5", !instantBook && "text-primary")} />
                  Instant Book
                </Button>
                
                <Button
                  variant={verified ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => setVerified(!verified)}
                >
                  <ShieldCheck className={cn("w-3.5 h-3.5", !verified && "text-emerald-500")} />
                  Verified
                </Button>
                
                <Button
                  variant={minRating === 4.5 ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
                >
                  <Star className={cn("w-3.5 h-3.5", minRating !== 4.5 && "text-amber-400 fill-amber-400")} />
                  4.5+ Rating
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              className="flex-1 gap-2"
              onClick={handleApply}
            >
              <Search className="w-4 h-4" />
              Show Results
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs bg-white/20">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
