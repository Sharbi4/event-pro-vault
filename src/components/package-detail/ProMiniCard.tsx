import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingDisplay } from '@/components/shared/RatingDisplay';
import { ShieldCheck, ChevronRight, Package } from 'lucide-react';

interface ProMiniCardProps {
  vendorUserId: string;
  vendorName: string;
  vendorAvatar: string | null;
  vendorDisplayName: string | null;
  vendorLocation: string | null;
  vendorCategories: string[];
  isVerified: boolean;
  avgRating: number;
  reviewCount: number;
}

export function ProMiniCard({
  vendorUserId,
  vendorName,
  vendorAvatar,
  vendorDisplayName,
  vendorLocation,
  vendorCategories,
  isVerified,
  avgRating,
  reviewCount
}: ProMiniCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-center gap-3">
        <Link to={`/pro/${vendorUserId}`}>
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={vendorAvatar || undefined} alt={vendorName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(vendorDisplayName || vendorName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to={`/pro/${vendorUserId}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {vendorDisplayName || vendorName}
            </Link>
            {isVerified && (
              <Badge variant="outline" className="gap-1 text-xs border-emerald-500/30 text-emerald-600">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <RatingDisplay
              avgRating={avgRating}
              reviewCount={reviewCount}
              size="xs"
              variant="inline"
            />
            {vendorLocation && (
              <span className="text-xs text-muted-foreground">• {vendorLocation}</span>
            )}
          </div>
          
          {vendorCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {vendorCategories.slice(0, 3).map((cat, i) => (
                <Badge key={i} variant="secondary" className="text-xs capitalize">
                  {cat.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link to={`/pro/${vendorUserId}`}>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          <Package className="w-4 h-4" />
          See all packages
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
