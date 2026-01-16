import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { VendorListItem } from '@/components/browse/VendorListItem';
import { VendorMap } from '@/components/browse/VendorMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, MapPin, Calendar, SlidersHorizontal, 
  X, Star, Clock, Zap, ShieldCheck, Map, List 
} from 'lucide-react';
import { vendors } from '@/data/vendors';
import { categories } from '@/data/categories';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || vendor.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex flex-col">
        {/* Search Header */}
        <div className="bg-secondary/30 border-b border-border shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 border border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search vendors, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 border border-border lg:w-56">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 border border-border lg:w-44">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Date"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
              </div>

              {/* Filters & Map Toggle */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>
                <Button
                  variant={showMap ? 'gradient' : 'outline'}
                  size="sm"
                  className="gap-2 lg:hidden"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                  {showMap ? 'List' : 'Map'}
                </Button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'gradient-primary text-white'
                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'gradient-primary text-white'
                      : cat.featured 
                        ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-foreground hover:bg-secondary'
                        : 'bg-card border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {cat.featured && <Star className="w-3 h-3 fill-trust text-trust" />}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 border-r border-border bg-card/50 p-4 overflow-y-auto hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm">Filters</h3>
                <button className="text-xs text-primary hover:underline">
                  Clear all
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h4 className="text-xs font-medium text-foreground mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 bg-secondary rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 bg-secondary rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-5">
                <h4 className="text-xs font-medium text-foreground mb-2">Min Rating</h4>
                <div className="flex gap-1.5">
                  {[4.5, 4.0, 3.5].map(rating => (
                    <button
                      key={rating}
                      className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition-colors"
                    >
                      <Star className="w-3 h-3 text-trust fill-trust" />
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-5">
                <h4 className="text-xs font-medium text-foreground mb-2">Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border bg-secondary w-3.5 h-3.5" />
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-foreground">Instant Book</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border bg-secondary w-3.5 h-3.5" />
                    <ShieldCheck className="w-3.5 h-3.5 text-trust" />
                    <span className="text-xs text-foreground">Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border bg-secondary w-3.5 h-3.5" />
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-foreground">Fast Response</span>
                  </label>
                </div>
              </div>

              <Button variant="gradient" size="sm" className="w-full">
                Apply Filters
              </Button>
            </aside>
          )}

          {/* Results List */}
          <div className={`flex-1 overflow-y-auto p-4 ${showMap ? 'hidden lg:block lg:w-1/2' : ''}`}>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">
                  {filteredVendors.length} Vendors
                </h1>
                {selectedCategory && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="gradient" className="gap-1 text-xs">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </div>
                )}
              </div>
              <Button
                variant={showMap ? 'gradient' : 'outline'}
                size="sm"
                className="gap-2 hidden lg:flex"
                onClick={() => setShowMap(!showMap)}
              >
                <Map className="w-4 h-4" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>

            {/* Vendor List */}
            <div className="space-y-3">
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

            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No vendors found matching your criteria
                </p>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Map View */}
          <div className={`flex-1 p-4 ${showMap ? 'lg:w-1/2' : 'hidden'}`}>
            <VendorMap 
              vendors={filteredVendors}
              selectedVendorId={selectedVendorId}
              onVendorSelect={setSelectedVendorId}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
