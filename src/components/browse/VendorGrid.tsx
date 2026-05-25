import { Link } from 'react-router-dom';
import { RatingDisplay } from '@/components/shared/RatingDisplay';
import { Heart, Zap, ShieldCheck, MapPin } from 'lucide-react';
import { Vendor } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VendorGridProps {
  vendors: Vendor[];
}

export function VendorGrid({ vendors }: VendorGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vendors.map((vendor, index) => (
        <Link
          key={vendor.id}
          to={`/vendor/${vendor.id}`}
          className="group animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <Card className="overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={vendor.gallery[0] || '/placeholder.svg'}
                alt={vendor.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-card rounded-full shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle favorite
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {vendor.verificationStatus === 'verified' && (
                  <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-0 gap-1 text-xs">
                    <ShieldCheck className="w-3 h-3 text-trust" />
                    Verified
                  </Badge>
                )}
                {vendor.instantBook && (
                  <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 gap-1 text-xs">
                    <Zap className="w-3 h-3" />
                    Instant
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Rating and Reviews */}
              <div className="flex items-center gap-1 mb-2">
                <RatingDisplay
                  avgRating={vendor.avgRating}
                  reviewCount={vendor.reviewCount}
                  size="sm"
                  variant="inline"
                />
              </div>

              {/* vendor Name */}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                {vendor.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                <span className="text-xs line-clamp-1">{vendor.location}</span>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1">
                {vendor.categories.slice(0, 2).map((cat) => (
                  <Badge 
                    key={cat} 
                    variant="secondary" 
                    className="text-xs capitalize px-2 py-0.5"
                  >
                    {cat.replace('-', ' ')}
                  </Badge>
                ))}
                {vendor.categories.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{vendor.categories.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
