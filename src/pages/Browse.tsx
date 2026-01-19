import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CategoryCarousel } from '@/components/browse/CategoryCarousel';
import { BrowsePackageCard } from '@/components/browse/BrowsePackageCard';
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
  CalendarDays, Package, Map
} from 'lucide-react';
import { categories } from '@/data/categories';
import { useBrowsePackages } from '@/hooks/useBrowsePackages';
import { format } from 'date-fns';

export default function Browse() {
  const { packages, loading, filters, updateFilter, clearFilters } = useBrowsePackages();
  const [showFilters, setShowFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const activeFiltersCount = [
    filters.category,
    filters.date,
    filters.instantBook,
    filters.verified,
    filters.minRating,
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages, vendors, categories..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10 h-11 bg-card border-border"
                />
              </div>

              {/* Location */}
              <div className="relative md:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="pl-10 h-11 bg-card border-border"
                />
              </div>

              {/* Date Picker */}
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`h-11 md:w-48 justify-start gap-2 ${filters.date ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    {filters.date ? format(new Date(filters.date), 'MMM d, yyyy') : 'Event Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={filters.date ? new Date(filters.date) : undefined}
                    onSelect={(date) => {
                      updateFilter('date', date ? format(date, 'yyyy-MM-dd') : null);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {filters.date && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          updateFilter('date', null);
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
          </div>
        </div>

        {/* Category Carousel */}
        <CategoryCarousel
          categories={categories}
          selectedCategory={filters.category}
          onSelectCategory={(cat) => updateFilter('category', cat)}
        />

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {loading ? 'Searching...' : `${packages.length} ${filters.category ? categories.find(c => c.id === filters.category)?.name || 'Packages' : 'Packages'}`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filters.date 
                  ? `Available on ${format(new Date(filters.date), 'MMMM d, yyyy')}`
                  : 'Find the perfect vendor for your event'
                }
              </p>
              
              {/* Active filter badges */}
              {(filters.category || filters.date) && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {filters.category && (
                    <Badge variant="gradient" className="gap-1">
                      {categories.find(c => c.id === filters.category)?.name}
                      <button onClick={() => updateFilter('category', null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.date && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {format(new Date(filters.date), 'MMM d')}
                      <button onClick={() => updateFilter('date', null)}>
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
                  onClick={clearFilters}
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
                {filters.date 
                  ? `No vendors are available on ${format(new Date(filters.date), 'MMMM d, yyyy')}. Try a different date.`
                  : 'Try adjusting your search or filters to find what you\'re looking for.'
                }
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
