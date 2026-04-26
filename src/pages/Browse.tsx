import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCarousel } from '@/components/browse/CategoryCarousel';
import { BrowsePackageCard } from '@/components/browse/BrowsePackageCard';
import { BrowseVendorCard } from '@/components/browse/BrowseVendorCard';
import { BrowsePackageMap } from '@/components/browse/BrowsePackageMap';
import { SearchModal } from '@/components/browse/SearchModal';
import { InlineNewsletterCard } from '@/components/browse/InlineNewsletterCard';
import { Button } from '@/components/ui/button';
import { groupPackagesByVendor } from '@/lib/groupPackagesByVendor';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SlidersHorizontal, X, Star, Zap, 
  ShieldCheck, LayoutGrid, Search, MapPin,
  CalendarDays, Package, Map, Sparkles,
  Clock, MapPinOff, ChevronDown, CreditCard, ArrowUpDown
} from 'lucide-react';
import { serviceCategories } from '@/data/service-categories';
import { useBrowsePackages, SortOption } from '@/hooks/useBrowsePackages';
import { getSortOptions } from '@/lib/packageRanking';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { generatePageSEO, SEO_CONFIG } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function Browse() {
  const { packages, loading, filters, sortBy, setSortBy, updateFilter, clearFilters } = useBrowsePackages();
  
  // Dynamic SEO based on search filters
  const dynamicSeo = generatePageSEO('browse', {
    category: filters.category || '',
    city: filters.location || '',
  });
  
  const seoTitle = filters.category 
    ? `Book ${filters.category} Near ${filters.location || 'You'} | EventPro by Vendibook`
    : dynamicSeo.title;
  
  const seoDescription = filters.category
    ? `Find available ${filters.category.toLowerCase()} packages for your date and time. Compare pricing, travel range, and book online or pay in cash.`
    : dynamicSeo.description;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: SEO_CONFIG.baseUrl + '/browse',
    type: 'website',
    keywords: [
      'event Event Pros near me',
      'book catering',
      'hire DJ',
      'event photographer',
      'food truck booking',
      'wedding Event Pros',
      'party services',
      filters.category || 'event services',
      'book by availability',
    ].filter(Boolean),
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to collapse header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync URL search params -> filters (homepage hero passes them in)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const cat = searchParams.get('category');
    const loc = searchParams.get('location');
    const dt = searchParams.get('date');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    if (cat) updateFilter('category', cat);
    if (loc) updateFilter('location', loc);
    if (dt) updateFilter('date', dt);
    if (start) updateFilter('startTime', start);
    if (end) updateFilter('endTime', end);
    if (q) updateFilter('search', q);
    // If the hero/landing already resolved a Google Place, hydrate canonical
    // coords directly so radius search can use lat/lng without re-geocoding.
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
        updateFilter('locationCoords', {
          lat: latNum,
          lng: lngNum,
          formattedAddress: loc || '',
          city: city || undefined,
          state: state || undefined,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use time from hook filters
  const startTime = filters.startTime;
  const endTime = filters.endTime;

  const activeFiltersCount = [filters.category, filters.date, filters.instantBook, filters.verified, filters.onlinePaymentsOnly, filters.minRating, filters.startTime, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const hasSearched = !!(filters.search || filters.location || filters.date || filters.startTime);

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleApplyFilters = (newFilters: {
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
  }) => {
    updateFilter('search', newFilters.search);
    updateFilter('location', newFilters.location);
    updateFilter('date', newFilters.date);
    updateFilter('startTime', newFilters.startTime);
    updateFilter('endTime', newFilters.endTime);
    updateFilter('category', newFilters.category);
    updateFilter('instantBook', newFilters.instantBook);
    updateFilter('verified', newFilters.verified);
    updateFilter('minRating', newFilters.minRating);
    updateFilter('minPrice', newFilters.minPrice);
    updateFilter('maxPrice', newFilters.maxPrice);
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
        {/* Education strip */}
        <div className="border-b border-border/50 bg-secondary/40">
          <div className="container mx-auto px-4 py-2.5 text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span className="font-medium text-foreground">New to EventPro?</span>
            <span>Book a pull-up, choose a catering package, or message for a private package.</span>
            <Link to="/book-or-get-booked" className="font-medium text-foreground hover:underline">
              Learn how →
            </Link>
          </div>
        </div>
        {/* Search Modal */}
        <SearchModal
          open={searchModalOpen}
          onOpenChange={setSearchModalOpen}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Search Header - Click to open modal */}
        <div className={cn(
          "sticky top-20 lg:top-24 z-40 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300",
          showCompactHeader ? "py-2" : "py-4"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-3">
              {/* Mode Toggle */}
              <div className="inline-flex items-center p-0.5 bg-secondary/50 rounded-full shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Services</span>
                </div>
              </div>

              {/* Search Bar - Opens Modal */}
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full hover:border-primary/50 hover:shadow-md transition-all min-w-0"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 text-sm truncate">
                  {searchValue || locationValue || dateValue || startTime ? (
                    <>
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
                    </>
                  ) : (
                    <span className="text-muted-foreground">Search packages, location, date...</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>

              {/* Quick actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  className="h-9 gap-1.5"
                >
                  {viewMode === 'map' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{viewMode === 'map' ? 'List' : 'Map'}</span>
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9 gap-1.5 text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            </div>
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
                      <button onClick={() => updateFilter('date', null)}>
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
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[160px] h-9 gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions(!!filters.locationCoords).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Event Pros</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setViewMode('grid')}
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Packages</span>
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
              <Button 
                variant={filters.onlinePaymentsOnly ? 'default' : 'outline'} 
                size="sm" 
                className="gap-1.5 rounded-full"
                onClick={() => updateFilter('onlinePaymentsOnly', !filters.onlinePaymentsOnly)}
              >
                <CreditCard className={`w-3.5 h-3.5 ${filters.onlinePaymentsOnly ? '' : 'text-blue-500'}`} />
                Pay Online
              </Button>

              {filters.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <Select
                    value={String(filters.searchRadius ?? 25)}
                    onValueChange={(v) => updateFilter('searchRadius', Number(v))}
                  >
                    <SelectTrigger className="h-8 w-[120px] rounded-full text-xs">
                      <SelectValue placeholder="Radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Within 10 mi</SelectItem>
                      <SelectItem value="25">Within 25 mi</SelectItem>
                      <SelectItem value="50">Within 50 mi</SelectItem>
                      <SelectItem value="100">Within 100 mi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

          {/* Event Pro Grid (default — vendor-grouped, StyleSeat-style) */}
          {!loading && packages.length > 0 && viewMode === 'list' && (() => {
            const groups = groupPackagesByVendor(packages, 3);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, index) => (
                  <div
                    key={group.vendor_user_id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <BrowseVendorCard
                      group={group}
                      date={filters.date}
                      startTime={filters.startTime}
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Package Grid */}
          {!loading && packages.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {packages.map((pkg, index) => {
                // Insert newsletter card after the 4th item (index 3)
                const showNewsletter = index === 4;
                return (
                  <>
                    {showNewsletter && (
                      <div key="newsletter" className="animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                        <InlineNewsletterCard />
                      </div>
                    )}
                    <div 
                      key={pkg.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${(showNewsletter ? index + 1 : index) * 0.03}s` }}
                    >
                      <BrowsePackageCard pkg={pkg} />
                    </div>
                  </>
                );
              })}
              {/* Show newsletter at end if less than 5 packages */}
              {packages.length > 0 && packages.length < 5 && (
                <div className="animate-fade-in">
                  <InlineNewsletterCard />
                </div>
              )}
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
                  ? `No Event Pros available on ${format(new Date(filters.date), 'MMMM d')}, ${formatTimeDisplay(startTime)}–${formatTimeDisplay(endTime)}`
                  : filters.date 
                  ? `No Event Pros available on ${format(new Date(filters.date), 'MMMM d, yyyy')}. Try adjusting your search.`
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
                  <Button variant="outline" onClick={() => updateFilter('location', '')} className="gap-2">
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
                      updateFilter('date', null);
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
