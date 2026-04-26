import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Zap, ShieldCheck } from 'lucide-react';
import { Vendor } from '@/types';
import { packages } from '@/data/vendors';

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const vendorPackages = packages.filter(p => p.vendorId === vendor.id);
  const lowestPrice = vendorPackages.length > 0 
    ? Math.min(...vendorPackages.map(p => p.price))
    : null;

  return (
    <Card variant="glow" className="overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden">
          <img
            src={vendor.gallery[0]}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 hidden md:block" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {vendor.verificationStatus === 'verified' && (
              <Badge variant="verified" className="gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
            {vendor.instantBook && (
              <Badge variant="gradient" className="gap-1">
                <Zap className="w-3 h-3" />
                Instant Book
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-5">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link to={`/vendor/${vendor.id}`}>
                    <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {vendor.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {vendor.categories.map(cat => (
                      <span key={cat} className="text-sm text-muted-foreground capitalize">
                        {cat.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-trust fill-trust" />
                  <span className="font-bold text-foreground">{vendor.avgRating}</span>
                  <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {vendor.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vendor.location} • {vendor.serviceRadius} mi radius
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Responds {vendor.responseTime}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.badges.slice(0, 3).map(badge => (
                  <Badge key={badge} variant="glass" className="text-xs">
                    {badge}
                  </Badge>
                ))}
                {vendor.insuranceStatus && (
                  <Badge variant="glass" className="text-xs">
                    Insured
                  </Badge>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                {lowestPrice && (
                  <>
                    <span className="text-sm text-muted-foreground">From </span>
                    <span className="text-xl font-bold gradient-text">${lowestPrice}</span>
                    <span className="text-sm text-muted-foreground">/hr</span>
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  {vendorPackages.length} package{vendorPackages.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <Link to={`/vendor/${vendor.id}`}>
                <Button variant="gradient">View Profile</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
