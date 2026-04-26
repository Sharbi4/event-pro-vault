import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vendor } from '@/types';
import { Star, MapPin, Clock, Zap, ShieldCheck } from 'lucide-react';

interface VendorListItemProps {
  vendor: Vendor;
  isSelected?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export function VendorListItem({ vendor, isSelected, onHover, onLeave }: VendorListItemProps) {
  return (
    <Link to={`/vendor/${vendor.id}`}>
      <Card 
        variant="glass"
        className={`p-3 hover-glow transition-all duration-300 cursor-pointer ${
          isSelected ? 'ring-2 ring-primary glow-gradient' : ''
        }`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div className="flex gap-3">
          {/* Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
            <img 
              src={vendor.gallery[0]} 
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {vendor.name}
              </h3>
              {vendor.instantBook && (
                <Zap className="w-4 h-4 text-primary shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{vendor.location}</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-trust fill-trust" />
                <span className="text-xs font-medium text-foreground">{vendor.avgRating}</span>
                <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {vendor.responseTime}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {vendor.verificationStatus === 'verified' && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-trust" />
                  Verified
                </Badge>
              )}
              {vendor.badges.slice(0, 2).map(badge => (
                <Badge key={badge} variant="secondary" className="text-[10px] py-0 px-1.5">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
