import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CategoryCarousel } from '@/components/browse/CategoryCarousel';
import { BrowsePackageCard } from '@/components/browse/BrowsePackageCard';
import { BrowseMarketCard } from '@/components/browse/BrowseMarketCard';
import { BrowsePackageMap } from '@/components/browse/BrowsePackageMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  SlidersHorizontal, X, Star, Zap, 
  ShieldCheck, LayoutGrid, Search, MapPin,
  CalendarDays, Package, Map, Tent, Sparkles
} from 'lucide-react';
import { categories } from '@/data/categories';
import { useBrowsePackages } from '@/hooks/useBrowsePackages';
import { useBrowseMarkets } from '@/hooks/useBrowseMarkets';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type BrowseMode = 'services' | 'markets';

export default function Browse() {
  const { packages, loading: packagesLoading, filters, updateFilter, clearFilters } = useBrowsePackages();
  const { 
    markets, 
    loading: marketsLoading, 
    filters: marketFilters, 
    updateFilter: updateMarketFilter, 
    clearFilters: clearMarketFilters,
    marketTypes 
  } = useBrowseMarkets();
  
  const [browseMode, setBrowseMode] = useState<BrowseMode>('services');
  const [showFilters, setShowFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const loading = browseMode === 'services' ? packagesLoading : marketsLoading;
  const currentFilters = browseMode === 'services' ? filters : marketFilters;

  const activeFiltersCount = browseMode === 'services' 
    ? [filters.category, filters.date, filters.instantBook, filters.verified, filters.minRating].filter(Boolean).length
    : [marketFilters.marketType, marketFilters.date, marketFilters.category].filter(Boolean).length;

  // Handle filter updates based on mode
  const handleSearchChange = (value: string) => {
    if (browseMode === 'services') {
      updateFilter('search', value);
    } else {
      updateMarketFilter('search', value);
    }
  };

  const handleLocationChange = (value: string) => {
    if (browseMode === 'services') {
      updateFilter('location', value);
    } else {
      updateMarketFilter('location', value);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
    if (browseMode === 'services') {
      updateFilter('date', dateStr);
    } else {
      updateMarketFilter('date', dateStr);
    }
    setDatePickerOpen(false);
  };

  const handleClearFilters = () => {
    if (browseMode === 'services') {
      clearFilters();
    } else {
      clearMarketFilters();
    }
  };

  const searchValue = browseMode === 'services' ? filters.search : marketFilters.search;
  const locationValue = browseMode === 'services' ? filters.location : marketFilters.location;
  const dateValue = browseMode === 'services' ? filters.date : marketFilters.date;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center p-1 bg-secondary/50 rounded-full">
                <button
                  onClick={() => setBrowseMode('services')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    browseMode === 'services'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Event Services
                </button>
                <button
                  onClick={() => setBrowseMode('markets')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    browseMode === 'markets'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Tent className="w-4 h-4" />
                  Market Spaces
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={browseMode === 'services' 
                    ? "Search packages, vendors, categories..." 
                    : "Search markets, locations..."
                  }
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-11 bg-card border-border"
                />
              </div>

              {/* Location */}
              <div className="relative md:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationValue}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10 h-11 bg-card border-border"
                />
              </div>

              {/* Date Picker */}
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`h-11 md:w-48 justify-start gap-2 ${dateValue ? 'text-foreground' : 'text-muted-foreground'}`}
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
            </div>
          </div>
        </div>

        {/* Category Carousel - Only for Services */}
        {browseMode === 'services' && (
          <CategoryCarousel
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={(cat) => updateFilter('category', cat)}
          />
        )}

        {/* Market Type Filter - Only for Markets */}
        {browseMode === 'markets' && (
          <div className="border-b border-border bg-background">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={!marketFilters.marketType ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full whitespace-nowrap"
                  onClick={() => updateMarketFilter('marketType', null)}
                >
                  All Markets
                </Button>
                {marketTypes.map(type => (
                  <Button
                    key={type}
                    variant={marketFilters.marketType === type ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full whitespace-nowrap"
                    onClick={() => updateMarketFilter('marketType', type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {loading ? 'Searching...' : browseMode === 'services' 
                  ? `${packages.length} ${filters.category ? categories.find(c => c.id === filters.category)?.name || 'Packages' : 'Packages'}`
                  : `${markets.length} Markets`
                }
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {dateValue 
                  ? `Available on ${format(new Date(dateValue), 'MMMM d, yyyy')}`
                  : browseMode === 'services'
                    ? 'Find the perfect vendor for your event'
                    : 'Find market spaces for your business'
                }
              </p>
              
              {/* Active filter badges */}
              {((browseMode === 'services' && (filters.category || filters.date)) || 
                (browseMode === 'markets' && (marketFilters.marketType || marketFilters.date))) && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {browseMode === 'services' && filters.category && (
                    <Badge variant="gradient" className="gap-1">
                      {categories.find(c => c.id === filters.category)?.name}
                      <button onClick={() => updateFilter('category', null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {browseMode === 'markets' && marketFilters.marketType && (
                    <Badge variant="gradient" className="gap-1">
                      {marketFilters.marketType}
                      <button onClick={() => updateMarketFilter('marketType', null)}>
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
              
              {browseMode === 'services' && (
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
              )}
            </div>
          </div>

          {/* Filter Pills - Only for Services */}
          {browseMode === 'services' && showFilters && (
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
          {!loading && browseMode === 'services' && packages.length > 0 && viewMode === 'grid' && (
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

          {/* Market Grid */}
          {!loading && browseMode === 'markets' && markets.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {markets.map((market, index) => (
                <div 
                  key={market.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <BrowseMarketCard market={market} />
                </div>
              ))}
            </div>
          )}

          {/* Map View - Services */}
          {!loading && browseMode === 'services' && packages.length > 0 && viewMode === 'map' && (
            <div className="h-[600px] lg:h-[700px] rounded-xl overflow-hidden">
              <BrowsePackageMap 
                packages={packages}
                selectedPackageId={selectedPackageId}
                onPackageSelect={setSelectedPackageId}
              />
            </div>
          )}

          {/* Map View - Markets (placeholder for now) */}
          {!loading && browseMode === 'markets' && markets.length > 0 && viewMode === 'map' && (
            <div className="h-[600px] lg:h-[700px] rounded-xl overflow-hidden bg-muted flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Market map view coming soon</p>
              </div>
            </div>
          )}

          {/* Empty State - Services */}
          {!loading && browseMode === 'services' && packages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No packages found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {filters.date 
                  ? `No vendors are available on ${format(new Date(filters.date), 'MMMM d, yyyy')}. Try a different date.`
                  : 'Try adjusting your search or filters to find what you\'re looking for.'
                }
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Empty State - Markets */}
          {!loading && browseMode === 'markets' && markets.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Tent className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No markets found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {marketFilters.date 
                  ? `No markets have availability on ${format(new Date(marketFilters.date), 'MMMM d, yyyy')}. Try a different date.`
                  : 'Try adjusting your search or filters to find markets in your area.'
                }
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
