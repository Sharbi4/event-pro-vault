import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { vendors } from '@/data/vendors';

export function FeaturedVendors() {
  const featuredVendors = vendors.filter(v => v.featured).slice(0, 4);

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
          {featuredVendors.map((vendor, index) => (
            <Link key={vendor.id} to={`/vendor/${vendor.id}`}>
              <Card 
                variant="glow" 
                className="overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={vendor.gallery[0]}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {vendor.verificationStatus === 'verified' && (
                      <Badge variant="verified">Verified</Badge>
                    )}
                    {vendor.badges[0] && (
                      <Badge variant="glass">{vendor.badges[0]}</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {vendor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {vendor.categories[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-foreground">
                      <Star className="w-4 h-4 text-trust fill-trust" />
                      <span className="font-medium">{vendor.avgRating}</span>
                      <span className="text-muted-foreground">({vendor.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{vendor.location.split(',')[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Responds {vendor.responseTime}</span>
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
