import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SearchHeader } from '@/components/browse/SearchHeader';
import { CategoryCarousel } from '@/components/browse/CategoryCarousel';
import { VendorGrid } from '@/components/browse/VendorGrid';
import { VendorListItem } from '@/components/browse/VendorListItem';
import { VendorMap } from '@/components/browse/VendorMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SlidersHorizontal, X, Star, Clock, Zap, 
  ShieldCheck, Map, LayoutGrid, List 
} from 'lucide-react';
import { vendors } from '@/data/vendors';
import { categories } from '@/data/categories';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || vendor.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Turo-style Search Header */}
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          location={location}
          setLocation={setLocation}
          date={date}
          setDate={setDate}
        />

        {/* Category Carousel */}
        <CategoryCarousel
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {filteredVendors.length} {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Vendors'}
              </h1>
              {selectedCategory && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="gradient" className="gap-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-card rounded-xl border border-border animate-fade-in">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm font-medium text-foreground">Quick filters:</span>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Instant Book
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-trust" />
                Verified
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 text-trust fill-trust" />
                4.5+ Rating
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-accent" />
                Fast Response
              </Button>
            </div>
          )}

          {/* View Content */}
          {viewMode === 'grid' && (
            <VendorGrid vendors={filteredVendors} />
          )}

          {viewMode === 'list' && (
            <div className="space-y-3 max-w-3xl">
              {filteredVendors.map((vendor, index) => (
                <div 
                  key={vendor.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <VendorListItem 
                    vendor={vendor} 
                    isSelected={selectedVendorId === vendor.id}
                    onHover={() => setSelectedVendorId(vendor.id)}
                    onLeave={() => setSelectedVendorId(null)}
                  />
                </div>
              ))}
            </div>
          )}

          {viewMode === 'map' && (
            <div className="h-[calc(100vh-20rem)] rounded-xl overflow-hidden border border-border">
              <VendorMap 
                vendors={filteredVendors}
                selectedVendorId={selectedVendorId}
                onVendorSelect={setSelectedVendorId}
              />
            </div>
          )}

          {/* Empty State */}
          {filteredVendors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No vendors found matching your criteria
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
