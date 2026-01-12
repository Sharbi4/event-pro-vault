import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { VendorCard } from '@/components/vendors/VendorCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, MapPin, Calendar, SlidersHorizontal, 
  X, Star, Clock, Zap, ShieldCheck, Grid, List 
} from 'lucide-react';
import { vendors } from '@/data/vendors';
import { categories } from '@/data/categories';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || vendor.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Search Header */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search vendors, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border lg:w-64">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border lg:w-48">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Date"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Filters Toggle */}
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  !selectedCategory
                    ? 'gradient-primary text-white'
                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'gradient-primary text-white'
                      : 'bg-card border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="lg:w-72 shrink-0">
                <Card variant="glass" className="p-5 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">Filters</h3>
                    <button className="text-sm text-primary hover:underline">
                      Clear all
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Price Range</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Minimum Rating</h4>
                    <div className="flex gap-2">
                      {[4.5, 4.0, 3.5].map(rating => (
                        <button
                          key={rating}
                          className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                        >
                          <Star className="w-4 h-4 text-trust fill-trust" />
                          {rating}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Features</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded border-border bg-secondary" />
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">Instant Book</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded border-border bg-secondary" />
                        <ShieldCheck className="w-4 h-4 text-trust" />
                        <span className="text-sm text-foreground">Verified</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded border-border bg-secondary" />
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-sm text-foreground">Fast Response</span>
                      </label>
                    </div>
                  </div>

                  {/* Booking Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Booking Type</h4>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                        Hourly
                      </button>
                      <button className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                        Daily
                      </button>
                    </div>
                  </div>

                  <Button variant="gradient" className="w-full">
                    Apply Filters
                  </Button>
                </Card>
              </aside>
            )}

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {filteredVendors.length} Vendors Found
                  </h1>
                  {selectedCategory && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Filtered by:</span>
                      <Badge variant="gradient" className="gap-1">
                        {categories.find(c => c.id === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory(null)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Vendor List */}
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2' : ''}`}>
                {filteredVendors.map((vendor, index) => (
                  <div 
                    key={vendor.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>

              {filteredVendors.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
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
        </div>
      </div>
    </Layout>
  );
}
