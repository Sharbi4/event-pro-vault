import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, ChevronRight, User } from 'lucide-react';
import { useFeaturedVendors } from '@/hooks/useFeaturedContent';
import { Vendors as mockVendors } from '@/data/vendors';
import { TrustBadges, TopRatedBadge } from '@/components/badges/TrustBadges';

export function FeaturedVendors() {
  const { data: dbVendors, isLoading } = useFeaturedVendors(4);

  // Use database Vendors if available, fallback to mock data
  const hasDbVendors = dbVendors && dbVendors.length > 0;
  
  // Format mock Vendors to match the expected structure
  const mockFeaturedVendors = mockVendors.filter(v => v.featured).slice(0, 4).map(Vendor => ({
    id: vendor.id,
    user_id: vendor.id,
    display_name: vendor.name,
    avatar_url: null,
    short_bio: null,
    primary_city: vendor.location?.split(',')[0] || null,
    is_verified: vendor.verificationStatus === 'verified',
    categories: vendor.categories || [],
    avg_rating: vendor.avgRating,
    review_count: vendor.reviewCount,
    cover_image_url: vendor.gallery?.[0] || null,
  }));

  const displayVendors = hasDbVendors ? dbVendors : mockFeaturedVendors;

  if (isLoading) {
    return (
      <section className="py-20 lg:py-28 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayVendors.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Top-rated professionals ready to make your event unforgettable
            </p>
          </div>
          <Link to="/browse" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayVendors.map((Vendor, index) => (
            <Link key={vendor.id} to={`/pro/${vendor.user_id}`}>
              <Card 
                variant="glow" 
                className="overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  {vendor.cover_image_url ? (
                    <img
                      src={vendor.cover_image_url}
                      alt={vendor.display_name || 'Vendor'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <User className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <TopRatedBadge rating={vendor.avg_rating} reviews={vendor.review_count} />
                    <TrustBadges 
                      isVerified={vendor.is_verified}
                      size="sm"
                    />
                  </div>
                  {vendor.categories?.[0] && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {vendor.categories[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {vendor.display_name || 'Vendor'}
                  </h3>
                  {vendor.categories?.[0] && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {vendor.categories[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-foreground">
                      <Star className="w-4 h-4 text-trust fill-trust" />
                      <span className="font-medium">
                        {vendor.avg_rating > 0 ? vendor.avg_rating.toFixed(1) : 'New'}
                      </span>
                      {vendor.review_count > 0 && (
                        <span className="text-muted-foreground">({vendor.review_count})</span>
                      )}
                    </div>
                    {vendor.primary_city && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{vendor.primary_city}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/browse">
            <Button variant="outline" className="gap-2">
              View All Vendors
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
