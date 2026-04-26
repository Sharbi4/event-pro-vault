import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Calendar,
  ChevronRight,
  Check,
  Package,
  MapPin,
  Zap,
} from 'lucide-react';
import { useFeaturedPackages } from '@/hooks/useFeaturedContent';
import { packages as mockPackages, vendors as mockVendors } from '@/data/vendors';

const CATEGORY_LABEL: Record<string, string> = {
  bartending: 'Bartending',
  catering: 'Catering',
  'coffee-beverage': 'Coffee & Beverage',
  desserts: 'Desserts',
  'food-trucks': 'Food Trucks',
  'private-chef': 'Private Chef',
};

export function FeaturedPackages() {
  const { data: dbPackages, isLoading } = useFeaturedPackages(8);

  const hasDbPackages = dbPackages && dbPackages.length > 0;

  // Mock fallback (keeps homepage alive without DB content)
  const mockFeaturedPackages = mockPackages
    .filter((p) => p.featured)
    .slice(0, 8)
    .map((pkg) => {
      const vendor = mockVendors.find((v) => v.id === pkg.vendorId);
      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        type: pkg.type,
        min_units: pkg.minUnits,
        includes: pkg.includes || [],
        cover_image_url: vendor?.gallery?.[0] || null,
        category: null,
        package_kind: null,
        vendor_user_id: pkg.vendorId,
        vendor_name: vendor?.name || 'vendor',
        vendor_avatar: null,
        vendor_city: vendor?.location?.split(',')[0] || null,
      };
    });

  const displayPackages = hasDbPackages ? dbPackages : mockFeaturedPackages;

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-9 w-56 mb-3" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 w-44 shrink-0 md:w-auto">
                <Skeleton className="h-32 md:h-40 w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayPackages.length === 0) {
    return null;
  }

  // Split: pull-up packages get their own lane below
  const pullUpPackages = displayPackages.filter(
    (p) => p.package_kind === 'PULL_UP',
  );
  const cateringPackages = displayPackages.filter(
    (p) => p.package_kind !== 'PULL_UP',
  );

  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-1 md:mb-3">
              Popular packages
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Ready-to-book experiences for every kind of event
            </p>
          </div>
          <Link to="/browse" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              Browse all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* MOBILE: horizontal snap lane | DESKTOP: 3-col grid */}
        <div
          className="
            -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2
            scrollbar-hide
            md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0
          "
        >
          {cateringPackages.slice(0, 8).map((pkg, index) => (
            <Link
              key={pkg.id}
              to={`/package/${pkg.id}`}
              className="snap-start shrink-0 w-[68%] xs:w-[60%] sm:w-[44%] md:w-auto"
            >
              <Card
                variant="gradient"
                className="overflow-hidden group h-full animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-32 md:h-44 overflow-hidden">
                  {pkg.cover_image_url ? (
                    <img
                      src={pkg.cover_image_url}
                      alt={pkg.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                  {pkg.category && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-[10px] md:text-xs px-2 py-0.5 backdrop-blur-sm bg-background/70"
                    >
                      {CATEGORY_LABEL[pkg.category] ?? pkg.category}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3 md:p-5">
                  <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mb-1">
                    <span className="truncate">by {pkg.vendor_name}</span>
                    {pkg.vendor_city && (
                      <>
                        <span>•</span>
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{pkg.vendor_city}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-sm md:text-lg font-semibold text-foreground mb-1 md:mb-2 line-clamp-1 md:line-clamp-2 group-hover:text-primary transition-colors">
                    {pkg.name}
                  </h3>

                  {/* Includes — desktop only to keep mobile compact */}
                  {pkg.includes && pkg.includes.length > 0 && (
                    <ul className="hidden md:block space-y-1 mb-4">
                      {pkg.includes.slice(0, 3).map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-3 h-3 text-trust" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-end justify-between md:pt-4 md:border-t md:border-border">
                    <div>
                      <span className="text-base md:text-2xl font-bold gradient-text">
                        ${pkg.price}
                      </span>
                      <span className="text-[11px] md:text-sm text-muted-foreground">
                        /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                      </span>
                    </div>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="hidden md:inline-flex"
                    >
                      Book now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* PULL-UP / ON-DEMAND LANE */}
        {pullUpPackages.length > 0 && (
          <div className="mt-10 md:mt-16">
            <div className="flex items-end justify-between mb-4 md:mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Pull up to you
                </div>
                <h3 className="font-display text-xl md:text-3xl font-bold">
                  On-demand near you
                </h3>
              </div>
              <Link
                to="/browse?kind=pull-up"
                className="hidden md:inline-flex text-sm text-primary hover:underline items-center gap-1"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div
              className="
                -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2
                scrollbar-hide
                md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0
              "
            >
              {pullUpPackages.slice(0, 8).map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/package/${pkg.id}`}
                  className="snap-start shrink-0 w-[44%] sm:w-[34%] md:w-auto"
                >
                  <div className="group">
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                      {pkg.cover_image_url ? (
                        <img
                          src={pkg.cover_image_url}
                          alt={pkg.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        variant="gradient"
                        className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5"
                      >
                        <Zap className="w-2.5 h-2.5 mr-0.5" /> Pull-up
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {pkg.name}
                    </p>
                    <p className="text-[11px] md:text-xs text-muted-foreground">
                      ${pkg.price}/{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                      {pkg.vendor_city && (
                        <>
                          {' '}
                          · <span className="truncate">{pkg.vendor_city}</span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-6 text-center md:hidden">
          <Link to="/browse">
            <Button variant="outline" size="sm" className="gap-2">
              Browse all packages
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
