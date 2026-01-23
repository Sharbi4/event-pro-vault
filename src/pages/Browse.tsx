import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CategoryCarousel } from '@/components/browse/CategoryCarousel';
import { BrowsePackageCard } from '@/components/browse/BrowsePackageCard';
import { BrowsePackageMap } from '@/components/browse/BrowsePackageMap';
import { TimeRangePicker } from '@/components/browse/TimeRangePicker';
import { SearchSummaryPill } from '@/components/browse/SearchSummaryPill';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  SlidersHorizontal, X, Star, Zap, 
  ShieldCheck, LayoutGrid, Search, MapPin,
  CalendarDays, Package, Map, Sparkles,
  Clock, MapPinOff, ChevronDown
} from 'lucide-react';
import { serviceCategories } from '@/data/service-categories';
import { useBrowsePackages } from '@/hooks/useBrowsePackages';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Browse() {
  const { packages, loading, filters, updateFilter, clearFilters } = useBrowsePackages();
  
  const [showFilters, setShowFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to collapse header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use time from hook filters
  const startTime = filters.startTime;
  const endTime = filters.endTime;

  const activeFiltersCount = [filters.category, filters.date, filters.instantBook, filters.verified, filters.minRating, filters.startTime].filter(Boolean).length;

  const hasSearched = !!(filters.search || filters.location || filters.date || filters.startTime);

  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
  };

  const handleLocationChange = (value: string) => {
    updateFilter('location', value);
  };

  const handleDateChange = (date: Date | undefined) => {
    const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
    updateFilter('date', dateStr);
    setDatePickerOpen(false);
  };

  const handleStartTimeChange = (time: string | null) => {
    if (time === 'clear') {
      updateFilter('startTime', null);
      updateFilter('endTime', null);
    } else {
      updateFilter('startTime', time);
    }
  };

  const handleEndTimeChange = (time: string | null) => {
    if (time === 'clear') {
      updateFilter('endTime', null);
    } else {
      updateFilter('endTime', time);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setIsSearchCollapsed(false);
  };

  const handleExpandTime = () => {
    if (startTime && endTime) {
      const [startHours] = startTime.split(':').map(Number);
      const [endHours] = endTime.split(':').map(Number);
      const newStart = Math.max(6, startHours - 2);
      const newEnd = Math.min(23, endHours + 2);
      updateFilter('startTime', `${String(newStart).padStart(2, '0')}:00`);
      updateFilter('endTime', `${String(newEnd).padStart(2, '0')}:00`);
    }
  };

  const searchValue = filters.search;
  const locationValue = filters.location;
  const dateValue = filters.date;

  const formatTimeDisplay = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${ampm}`;
  };

  const getResultsMessage = () => {
    if (loading) return 'Searching...';
    
    const count = packages.length;
    
    if (!hasSearched) {
      return 'Pick a date and time to see real availability';
    }

    let message = `${count} package${count !== 1 ? 's' : ''} available`;
    if (dateValue) {
      message += ` on ${format(new Date(dateValue), 'MMM d')}`;
    }
    if (startTime && endTime) {
      message += `, ${formatTimeDisplay(startTime)}–${formatTimeDisplay(endTime)}`;
    }
    if (locationValue) {
      message += ` near ${locationValue}`;
    }
    return message;
  };

  // Determine if we should show compact header
  const showCompactHeader = isScrolled && hasSearched;

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-16 lg:pt-20">
        {/* Search Header */}
        <div className={cn(
          "sticky top-20 lg:top-24 z-40 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300",
          showCompactHeader ? "py-2" : ""
        )}>
          <div className="container mx-auto px-4">
            {/* Compact Header - Shows when scrolled */}
            {showCompactHeader ? (
              <div className="flex items-center justify-between gap-3 py-1">
                {/* Mode Toggle - Compact */}
                <div className="inline-flex items-center p-0.5 bg-secondary/50 rounded-full shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">Services</span>
                  </div>
                </div>

                {/* Search Summary - Compact inline */}
                <button 
                  onClick={() => setIsScrolled(false)}
                  className="flex-1 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full hover:border-primary/50 transition-colors min-w-0"
                >
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 text-sm truncate">
                    {searchValue && <span className="text-foreground truncate">{searchValue}</span>}
                    {locationValue && (
                      <>
                        {searchValue && <span className="text-muted-foreground">•</span>}
                        <span className="text-muted-foreground truncate">{locationValue}</span>
                      </>
                    )}
                    {dateValue && (
                      <>
                        {(searchValue || locationValue) && <span className="text-muted-foreground">•</span>}
                        <span className="text-muted-foreground">{format(new Date(dateValue), 'MMM d')}</span>
                      </>
                    )}
                    {startTime && endTime && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{formatTimeDisplay(startTime)}–{formatTimeDisplay(endTime)}</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>

                {/* Quick actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                    className="h-8 gap-1.5"
                  >
                    {viewMode === 'grid' ? <Map className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{viewMode === 'grid' ? 'Map' : 'Grid'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Full Header - Shows when not scrolled */
              <div className="py-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center p-1 bg-secondary/50 rounded-full">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="w-4 h-4" />
                      Event Services
                    </div>
                  </div>
                </div>

                {/* Mobile: Collapsed Search Summary */}
                {isSearchCollapsed && hasSearched && (
                  <div className="md:hidden mb-3">
                    <SearchSummaryPill
                      searchQuery={searchValue}
                      location={locationValue}
                      date={dateValue}
                      startTime={startTime}
                      endTime={endTime}
                      onEdit={() => setIsSearchCollapsed(false)}
                      onClear={handleClearFilters}
                    />
                  </div>
                )}

                {/* Search Fields */}
                {(!isSearchCollapsed || !hasSearched) && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* What are you booking? */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="What are you booking?"
                          value={searchValue}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10 h-11 bg-card border-border"
                        />
                      </div>

                      {/* Location */}
                      <div className="relative md:w-44">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Location"
                          value={locationValue}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          className="pl-10 h-11 bg-card border-border"
                        />
                      </div>

                      {/* Event Date */}
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`h-11 md:w-40 justify-start gap-2 ${dateValue ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            <CalendarDays className="w-4 h-4" />
                            {dateValue ? format(new Date(dateValue), 'MMM d, yyyy') : 'Event Date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={dateValue ? new Date(dateValue) : undefined}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                          {dateValue && (
                            <div className="p-3 border-t">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleDateChange(undefined)}
                              >
                                Clear date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>

                      {/* Time Range */}
                      <div className="hidden lg:block">
                        <TimeRangePicker
                          startTime={startTime}
                          endTime={endTime}
                          onStartTimeChange={handleStartTimeChange}
                          onEndTimeChange={handleEndTimeChange}
                        />
                      </div>

                      {/* Search Button */}
                      <Button 
                        variant="gradient" 
                        className="h-11 gap-2"
                        onClick={() => setIsSearchCollapsed(true)}
                      >
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">Search packages</span>
                      </Button>
                    </div>

                    {/* Time Range - Mobile */}
                    <div className="lg:hidden">
                      <TimeRangePicker
                        startTime={startTime}
                        endTime={endTime}
                        onStartTimeChange={handleStartTimeChange}
                        onEndTimeChange={handleEndTimeChange}
                      />
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-muted-foreground text-center">
                      Results update based on availability for your selected time
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Carousel */}
        <CategoryCarousel
          categories={serviceCategories}
          selectedCategory={filters.category}
          onSelectCategory={(cat) => updateFilter('category', cat)}
        />

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Packages available for your event
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {getResultsMessage()}
              </p>
              
              {/* Active filter badges */}
              {(filters.category || filters.date || startTime) && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {filters.category && (
                    <Badge variant="gradient" className="gap-1">
                      {serviceCategories.find(c => c.id === filters.category)?.name}
                      <button onClick={() => updateFilter('category', null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {dateValue && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {format(new Date(dateValue), 'MMM d')}
                      <button onClick={() => handleDateChange(undefined)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {startTime && endTime && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeDisplay(startTime)}–{formatTimeDisplay(endTime)}
                      <button onClick={() => { updateFilter('startTime', null); updateFilter('endTime', null); }}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button 
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </Button>
              </div>
              
              <Button 
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-card rounded-xl border border-border animate-fade-in">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm font-medium text-foreground">Quick filters:</span>
              </div>
              <Button 
                variant={filters.instantBook ? 'default' : 'outline'} 
                size="sm" 
                className="gap-1.5 rounded-full"
                onClick={() => updateFilter('instantBook', !filters.instantBook)}
              >
                <Zap className={`w-3.5 h-3.5 ${filters.instantBook ? '' : 'text-primary'}`} />
                Instant Book
              </Button>
              <Button 
                variant={filters.verified ? 'default' : 'outline'} 
                size="sm" 
                className="gap-1.5 rounded-full"
                onClick={() => updateFilter('verified', !filters.verified)}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${filters.verified ? '' : 'text-emerald-500'}`} />
                Verified
              </Button>
              <Button 
                variant={filters.minRating === 4.5 ? 'default' : 'outline'} 
                size="sm" 
                className="gap-1.5 rounded-full"
                onClick={() => updateFilter('minRating', filters.minRating === 4.5 ? null : 4.5)}
              >
                <Star className={`w-3.5 h-3.5 ${filters.minRating === 4.5 ? 'fill-current' : 'text-amber-400 fill-amber-400'}`} />
                4.5+ Rating
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 rounded-full text-muted-foreground"
                  onClick={handleClearFilters}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Package Grid */}
          {!loading && packages.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {packages.map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <BrowsePackageCard pkg={pkg} />
                </div>
              ))}
            </div>
          )}

          {/* Map View */}
          {!loading && packages.length > 0 && viewMode === 'map' && (
            <div className="h-[600px] lg:h-[700px] rounded-xl overflow-hidden">
              <BrowsePackageMap 
                packages={packages}
                selectedPackageId={selectedPackageId}
                onPackageSelect={setSelectedPackageId}
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && packages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No packages found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {filters.date && startTime && endTime
                  ? `No vendors available on ${format(new Date(filters.date), 'MMMM d')}, ${formatTimeDisplay(startTime)}–${formatTimeDisplay(endTime)}`
                  : filters.date 
                  ? `No vendors available on ${format(new Date(filters.date), 'MMMM d, yyyy')}. Try adjusting your search.`
                  : 'Try adjusting your search or filters to find what you\'re looking for.'
                }
              </p>
              
              {/* Conversion actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {startTime && endTime && (
                  <Button variant="outline" onClick={handleExpandTime} className="gap-2">
                    <Clock className="w-4 h-4" />
                    Expand time ±2 hours
                  </Button>
                )}
                {locationValue && (
                  <Button variant="outline" onClick={() => handleLocationChange('')} className="gap-2">
                    <MapPinOff className="w-4 h-4" />
                    Try nearby areas
                  </Button>
                )}
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
                {(filters.date || startTime) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleDateChange(undefined);
                      updateFilter('startTime', null);
                      updateFilter('endTime', null);
                    }}
                    className="text-muted-foreground"
                  >
                    Browse without time filter
                    <span className="text-xs ml-1">(availability may vary)</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
