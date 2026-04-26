import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MarketCard } from '@/components/markets/MarketCard';
import { MarketMap } from '@/components/markets/MarketMap';
import { markets } from '@/data/markets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Store, Leaf, Filter } from 'lucide-react';

type MarketFilter = 'all' | 'flea' | 'farmers';

export default function Markets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');

  const filteredMarkets = useMemo(() => {
    return markets.filter(market => {
      const matchesSearch = 
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        activeFilter === 'all' || market.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const stats = useMemo(() => ({
    total: markets.length,
    fleaMarkets: markets.filter(m => m.type === 'flea').length,
    farmersMarkets: markets.filter(m => m.type === 'farmers').length,
    totalSpots: markets.reduce((acc, m) => acc + m.availableSpots, 0),
  }), []);

  return (
    <Layout>
      <div className="min-h-screen pt-20 lg:pt-24">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-card/80 to-transparent py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
              <div>
                <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
                  <MapPin className="w-3 h-3 mr-1" />
                  Discover Local Markets
                </Badge>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Flea Markets & Farmers Markets
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Find the perfect spot to showcase your products. Browse available Vendor spaces at flea markets 
                  and farmers markets across the country.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 lg:gap-6">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Markets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-green-500">{stats.farmersMarkets}</p>
                  <p className="text-xs text-muted-foreground">Farmers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-500">{stats.fleaMarkets}</p>
                  <p className="text-xs text-muted-foreground">Flea</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-primary">{stats.totalSpots}</p>
                  <p className="text-xs text-muted-foreground">Open Spots</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search markets by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  All
                </Button>
                <Button
                  variant={activeFilter === 'flea' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('flea')}
                  className={`gap-2 ${activeFilter === 'flea' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                >
                  <Store className="w-4 h-4" />
                  Flea Markets
                </Button>
                <Button
                  variant={activeFilter === 'farmers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('farmers')}
                  className={`gap-2 ${activeFilter === 'farmers' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  <Leaf className="w-4 h-4" />
                  Farmers Markets
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Split View: List + Map */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[600px]">
            {/* Market List */}
            <div className="lg:w-1/2 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMarkets.map(market => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    isSelected={selectedMarketId === market.id}
                    onSelect={setSelectedMarketId}
                  />
                ))}
              </div>
              
              {filteredMarkets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No markets found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Try adjusting your search or filters to find markets in your area.
                  </p>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="lg:w-1/2 h-[400px] lg:h-full sticky top-24">
              <MarketMap
                markets={filteredMarkets}
                selectedMarketId={selectedMarketId}
                onMarketSelect={setSelectedMarketId}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
