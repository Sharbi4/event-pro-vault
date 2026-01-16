import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { categories } from '@/data/categories';
import { vendors, packages } from '@/data/vendors';
import { Vendor } from '@/types';
import { 
  Truck, UtensilsCrossed, ChefHat, Wine, 
  Music, Sparkles, Tent, Heart, Store, Leaf,
  Cake
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Music,
  Sparkles,
  Tent,
  Heart,
  Store,
  Leaf,
  Cake,
};

// Featured category groups with vendors
const categoryGroups = [
  {
    id: 'markets',
    title: 'Local Markets',
    subtitle: 'Find vendor spots at flea markets & farmers markets',
    categoryIds: ['flea-markets', 'farmers-markets'],
    icon: Store,
    link: '/markets',
  },
  {
    id: 'food',
    title: 'Food & Catering',
    subtitle: 'Food trucks, caterers, and private chefs',
    categoryIds: ['food-trucks', 'catering', 'private-chefs'],
    icon: UtensilsCrossed,
    link: '/browse?category=food-trucks',
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    subtitle: 'DJs, performers, and live entertainment',
    categoryIds: ['djs', 'performers'],
    icon: Music,
    link: '/browse?category=djs',
  },
  {
    id: 'services',
    title: 'Event Services',
    subtitle: 'Bartending, rentals, and wellness',
    categoryIds: ['bartending', 'rentals', 'wellness'],
    icon: Wine,
    link: '/browse?category=bartending',
  },
];

// Helper to get starting price for a vendor
const getVendorStartingPrice = (vendor: Vendor): number => {
  const vendorPackages = packages.filter(p => p.vendorId === vendor.id);
  if (vendorPackages.length === 0) return 99;
  return Math.min(...vendorPackages.map(p => p.price));
};

export function CategoryRows() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Quick Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon];
            return (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="flex-shrink-0"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full hover:border-primary/50 hover:bg-secondary/50 transition-all group">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {category.name}
                  </span>
                  {category.featured && (
                    <Badge variant="gradient" className="text-[10px] px-1.5 py-0">
                      New
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Category Rows */}
        {categoryGroups.map((group, groupIndex) => {
          const groupVendors = vendors.filter(v => 
            v.categories.some(c => group.categoryIds.includes(c))
          ).slice(0, 6);

          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="mb-10">
              {/* Row Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <GroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {group.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {group.subtitle}
                    </p>
                  </div>
                </div>
                <Link to={group.link}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    See all
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Horizontal Scroll Cards */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {groupVendors.map((vendor, index) => (
                  <Link
                    key={vendor.id}
                    to={`/vendor/${vendor.id}`}
                    className="flex-shrink-0 w-[280px] group"
                  >
                    <Card className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={vendor.gallery[0]}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {vendor.verificationStatus === 'verified' && (
                            <Badge className="bg-trust/90 text-white text-xs gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                          {vendor.instantBook && (
                            <Badge className="bg-primary/90 text-white text-xs gap-1">
                              <Zap className="w-3 h-3" />
                              Instant
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {vendor.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-4 h-4 text-trust fill-trust" />
                            <span className="text-sm font-medium">{vendor.avgRating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{vendor.location}</span>
                        </div>
                        <p className="text-sm text-primary font-medium">
                          From ${getVendorStartingPrice(vendor)}/hr
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}

                {/* See More Card */}
                <Link
                  to={group.link}
                  className="flex-shrink-0 w-[200px]"
                >
                  <Card className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 border-dashed border-2 hover:border-primary/50 hover:bg-secondary/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground mb-1">
                      View all
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {group.title.toLowerCase()}
                    </p>
                  </Card>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}