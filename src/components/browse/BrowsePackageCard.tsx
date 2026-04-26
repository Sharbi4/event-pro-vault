import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Package, Check, MapPin } from 'lucide-react';
import { BrowsePackage } from '@/hooks/useBrowsePackages';
import { TrustBadges, FeaturedBadge, TopRatedBadge } from '@/components/badges/TrustBadges';

interface BrowsePackageCardProps {
  pkg: BrowsePackage & { is_featured?: boolean };
}

const categoryGradients: Record<string, string> = {
  'dj': 'from-purple-500 to-pink-500',
  'photography': 'from-amber-500 to-orange-500',
  'videography': 'from-blue-500 to-cyan-500',
  'catering': 'from-green-500 to-emerald-500',
  'florist': 'from-pink-500 to-rose-500',
  'venue': 'from-indigo-500 to-violet-500',
  'entertainment': 'from-red-500 to-orange-500',
  'planner': 'from-teal-500 to-cyan-500',
  'default': 'from-primary to-primary/70'
};

export function BrowsePackageCard({ pkg }: BrowsePackageCardProps) {
  const gradient = categoryGradients[pkg.category?.toLowerCase() || 'default'] || categoryGradients.default;
  const hasImage = pkg.images && pkg.images.length > 0;
  const vendorInitials = pkg.vendor_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to={`/package/${pkg.id}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full">
        {/* Image Section */}
        <div className="relative h-44 overflow-hidden">
          {hasImage ? (
            <img
              src={pkg.images[0]}
              alt={pkg.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Package className="w-14 h-14 text-white/30" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {pkg.is_featured && <FeaturedBadge />}
            <TopRatedBadge rating={pkg.avg_rating} reviews={pkg.review_count} />
            <TrustBadges
              isVerified={pkg.is_verified}
              instantBook={pkg.instant_book}
              size="sm"
            />
          </div>

          {/* Rating - Top Right */}
          {pkg.review_count > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-white text-xs font-medium">
                {pkg.avg_rating.toFixed(1)}
              </span>
              <span className="text-white/70 text-xs">
                ({pkg.review_count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-lg">
              <span className="text-base font-bold text-foreground">${pkg.price}</span>
              <span className="text-muted-foreground text-xs">
                /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {pkg.category && (
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {pkg.category.replace(/-/g, ' ')}
            </span>
          )}

          {/* Title */}
          <h3 className="font-semibold text-base text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
            {pkg.name}
          </h3>

          {/* Vendor Info */}
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="w-6 h-6 border border-border">
              <AvatarImage src={pkg.vendor_avatar || undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {vendorInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground line-clamp-1">
              {pkg.vendor_name}
            </span>
          </div>

          {/* Location */}
          {pkg.vendor_location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{pkg.vendor_location}</span>
              {pkg.distance_miles !== null && (
                <span className="text-primary ml-1">
                  ({pkg.distance_miles.toFixed(1)} mi)
                </span>
              )}
            </div>
          )}

          {/* Includes preview */}
          {pkg.includes && pkg.includes.length > 0 && (
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-primary" />
              <span className="line-clamp-1">
                {pkg.includes[0]}
                {pkg.includes.length > 1 && ` +${pkg.includes.length - 1} more`}
              </span>
            </div>
          )}

          {/* Min hours */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Min {pkg.min_units} {pkg.type === 'HOURLY' ? 'hrs' : 'days'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
