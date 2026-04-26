import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Star, MapPin, Zap, ShieldCheck, Package } from 'lucide-react';
import { categories } from '@/data/categories';
import { vendors as mockVendors, packages as mockPackages } from '@/data/vendors';
import { Vendor } from '@/types';
import { useCategoryCounts, useCategoryPackages } from '@/hooks/useFeaturedContent';
import {
  Truck, UtensilsCrossed, ChefHat, Wine, Coffee, IceCream, Store, Cake
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Coffee,
  IceCream,
  Store,
  Cake,
};

// Food-first category groups
const categoryGroups = [
  {
    id: 'food-trucks',
    title: 'Food Trucks',
    subtitle: 'Mobile kitchens for any event, big or small',
    categoryIds: ['food-trucks'],
    icon: Truck,
    link: '/browse?category=food-trucks',
  },
  {
    id: 'catering',
    title: 'Catering & Private Chefs',
    subtitle: 'Full-service catering and personalized chef experiences',
    categoryIds: ['catering', 'private-chefs', 'food-popup'],
    icon: UtensilsCrossed,
    link: '/browse?category=catering',
  },
  {
    id: 'bar',
    title: 'Mobile Bars & Beverage',
    subtitle: 'Bartenders, bar carts, and mobile coffee',
    categoryIds: ['bartending', 'coffee-beverage'],
    icon: Wine,
    link: '/browse?category=bartending',
  },
  {
    id: 'sweets',
    title: 'Desserts, Bakers & Treats',
    subtitle: 'Cottage bakers, cake artists, and ice cream',
    categoryIds: ['desserts', 'ice-cream'],
    icon: Cake,
    link: '/browse?category=desserts',
  },
];

// Helper to get starting price for a vendor
const getVendorStartingPrice = (vendor: Vendor): number => {
  const vendorPackages = mockPackages.filter(p => p.vendorId === vendor.id);
  if (vendorPackages.length === 0) return 99;
  return Math.min(...vendorPackages.map(p => p.price));
};

function CategoryPill({ 
  category, 
  count, 
  isLoading 
}: { 
  category: typeof categories[0]; 
  count: number | undefined;
  isLoading: boolean;
}) {
  const IconComponent = iconMap[category.icon];
  const displayCount = count ?? category.count;
  
  return (
    <Link
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
        {isLoading ? (
          <Skeleton className="h-4 w-6 rounded-full" />
        ) : displayCount > 0 ? (
          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
            {displayCount}
          </span>
        ) : null}
        {category.featured && (
          <Badge variant="gradient" className="text-[10px] px-1.5 py-0">
            New
          </Badge>
        )}
      </div>
    </Link>
  );
}

interface CategoryRowProps {
  group: typeof categoryGroups[0];
}

function CategoryRow({ group }: CategoryRowProps) {
  const { data: dbPackages, isLoading } = useCategoryPackages(group.categoryIds, 6);
  
  // Fallback to mock data if no DB packages
  const hasDbPackages = dbPackages && dbPackages.length > 0;
  
  const mockGroupVendors = mockVendors.filter(v => 
    v.categories.some(c => group.categoryIds.includes(c))
  ).slice(0, 6);

  const GroupIcon = group.icon;

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GroupIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px]">
              <Skeleton className="aspect-[4/3] rounded-t-lg" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render database packages if available
  if (hasDbPackages) {
    return (
      <div className="mb-10">
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

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {dbPackages.map((pkg) => (
            <Link
              key={pkg.id}
              to={`/package/${pkg.id}`}
              className="flex-shrink-0 w-[280px] group"
            >
              <Card className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {pkg.cover_image_url ? (
                    <img
                      src={pkg.cover_image_url}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {pkg.is_verified && (
                      <Badge className="bg-trust/90 text-white text-xs gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    {pkg.instant_book && (
                      <Badge className="bg-primary/90 text-white text-xs gap-1">
                        <Zap className="w-3 h-3" />
                        Instant
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>
                    {pkg.avg_rating > 0 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-4 h-4 text-trust fill-trust" />
                        <span className="text-sm font-medium">{pkg.avg_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    by {pkg.vendor_name}
                    {pkg.vendor_city && <span> • {pkg.vendor_city}</span>}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    From ${pkg.price}/{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}

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
  }

  // Fallback to mock vendors
  return (
    <div className="mb-10">
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

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {mockGroupVendors.map((vendor) => (
          <Link
            key={vendor.id}
            to={`/vendor/${vendor.id}`}
            className="flex-shrink-0 w-[280px] group"
          >
            <Card className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={vendor.gallery[0]}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
}

export function CategoryRows() {
  const { data: categoryCounts, isLoading: isCountsLoading } = useCategoryCounts();

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Quick Category Pills with Live Counts */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {categories.map((category) => (
            <CategoryPill 
              key={category.id}
              category={category}
              count={categoryCounts?.get(category.id)}
              isLoading={isCountsLoading}
            />
          ))}
        </div>

        {/* Category Rows with Live Data */}
        {categoryGroups.map((group) => (
          <CategoryRow key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}