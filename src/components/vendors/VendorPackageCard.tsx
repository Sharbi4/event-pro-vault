import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Zap, Clock, Package, Check, TrendingUp } from 'lucide-react';
import { VendorPackageData } from '@/hooks/useVendorProfile';

interface VendorPackageCardProps {
  pkg: VendorPackageData;
  vendorUserId: string;
  rank?: number;
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

export function VendorPackageCard({ pkg, vendorUserId, rank }: VendorPackageCardProps) {
  const gradient = categoryGradients[pkg.category?.toLowerCase() || 'default'] || categoryGradients.default;
  const hasImage = pkg.images && pkg.images.length > 0;
  const isTopRated = rank === 1 && (pkg.avgRating || 0) >= 4.5;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      {/* Image/Header Section */}
      <div className="relative h-48 overflow-hidden">
        {hasImage ? (
          <img
            src={pkg.images[0]}
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Package className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isTopRated && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <TrendingUp className="w-3 h-3" />
              Top Rated
            </Badge>
          )}
          {pkg.instant_book && (
            <Badge variant="gradient" className="gap-1">
              <Zap className="w-3 h-3" />
              Instant Book
            </Badge>
          )}
        </div>

        {/* Rating badge */}
        {(pkg.reviewCount || 0) > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-medium">
              {(pkg.avgRating || 0).toFixed(1)}
            </span>
            <span className="text-white/70 text-xs">
              ({pkg.reviewCount})
            </span>
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
            <span className="text-lg font-bold text-foreground">${pkg.price}</span>
            <span className="text-muted-foreground text-sm">
              /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Category & Title */}
        <div className="mb-3">
          {pkg.category && (
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {pkg.category.replace(/-/g, ' ')}
            </span>
          )}
          <h3 className="font-semibold text-lg text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
            {pkg.name}
          </h3>
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {pkg.description}
          </p>
        )}

        {/* Includes */}
        {pkg.includes && pkg.includes.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {pkg.includes.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
            {pkg.includes.length > 3 && (
              <span className="text-xs text-primary font-medium">
                +{pkg.includes.length - 3} more included
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Min {pkg.min_units} {pkg.type === 'HOURLY' ? 'hrs' : 'days'}</span>
          </div>
          <Link to={`/package/${pkg.id}`}>
            <Button size="sm" variant="gradient">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
