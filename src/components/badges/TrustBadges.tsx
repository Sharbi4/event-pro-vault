import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Zap, 
  ShieldCheck, 
  Star, 
  Clock, 
  Sparkles,
  CreditCard,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesProps {
  isVerified?: boolean;
  instantBook?: boolean;
  avgRating?: number;
  reviewCount?: number;
  respondsQuickly?: boolean;
  paymentOptions?: 'ONLINE' | 'CASH' | 'BOTH';
  isFeatured?: boolean;
  size?: 'sm' | 'md';
  showAll?: boolean;
  className?: string;
}

// Thresholds for "Top Rated" badge
const TOP_RATED_MIN_RATING = 4.8;
const TOP_RATED_MIN_REVIEWS = 10;

export function TrustBadges({
  isVerified,
  instantBook,
  avgRating,
  reviewCount,
  respondsQuickly,
  paymentOptions,
  isFeatured,
  size = 'sm',
  showAll = false,
  className,
}: TrustBadgesProps) {
  const isTopRated = (avgRating || 0) >= TOP_RATED_MIN_RATING && (reviewCount || 0) >= TOP_RATED_MIN_REVIEWS;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  const badges = [];

  // Featured badge (highest priority)
  if (isFeatured) {
    badges.push(
      <TooltipProvider key="featured" delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                'gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                textSize
              )}
            >
              <Sparkles className={iconSize} />
              Featured
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Featured package with boosted visibility</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Top Rated badge
  if (isTopRated) {
    badges.push(
      <TooltipProvider key="top-rated" delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                'gap-1 border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
                textSize
              )}
            >
              <Star className={cn(iconSize, 'fill-current')} />
              Top Rated
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Rating {avgRating?.toFixed(1)} with {reviewCount}+ verified reviews</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Verified badge
  if (isVerified) {
    badges.push(
      <TooltipProvider key="verified" delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="verified"
              className={cn('gap-1', textSize)}
            >
              <ShieldCheck className={iconSize} />
              {size === 'md' ? 'Verified' : null}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-[220px]">
              This Vendor completed optional identity verification through EventPro.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Instant Book badge
  if (instantBook) {
    badges.push(
      <TooltipProvider key="instant" delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="gradient"
              className={cn('gap-1', textSize)}
            >
              <Zap className={iconSize} />
              Instant
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Book immediately without approval wait</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Responds quickly badge
  if (respondsQuickly && showAll) {
    badges.push(
      <TooltipProvider key="responds" delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="trust"
              className={cn('gap-1', textSize)}
            >
              <Clock className={iconSize} />
              Fast Response
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Typically responds within 1 hour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Payment options badges (show only if requested or showing all)
  if (paymentOptions && showAll) {
    if (paymentOptions === 'ONLINE' || paymentOptions === 'BOTH') {
      badges.push(
        <Badge 
          key="online-pay"
          variant="outline"
          className={cn('gap-1 border-primary/30 text-primary', textSize)}
        >
          <CreditCard className={iconSize} />
          Pay Online
        </Badge>
      );
    }
    if (paymentOptions === 'CASH' || paymentOptions === 'BOTH') {
      badges.push(
        <Badge 
          key="cash-pay"
          variant="outline"
          className={cn('gap-1 border-emerald-500/30 text-emerald-600', textSize)}
        >
          <Banknote className={iconSize} />
          Cash OK
        </Badge>
      );
    }
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges}
    </div>
  );
}

// Simplified badge for inline use (e.g., in cards)
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="verified"
      className={cn('gap-1 text-[10px]', className)}
    >
      <ShieldCheck className="w-3 h-3" />
      Verified
    </Badge>
  );
}

export function InstantBookBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="gradient"
      className={cn('gap-1 text-[10px]', className)}
    >
      <Zap className="w-3 h-3" />
      Instant
    </Badge>
  );
}

export function TopRatedBadge({ rating, reviews, className }: { rating: number; reviews: number; className?: string }) {
  if (rating < TOP_RATED_MIN_RATING || reviews < TOP_RATED_MIN_REVIEWS) return null;
  
  return (
    <Badge 
      className={cn(
        'gap-1 text-[10px] border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
        className
      )}
    >
      <Star className="w-3 h-3 fill-current" />
      Top Rated
    </Badge>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <Badge 
      className={cn(
        'gap-1 text-[10px] border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      Featured
    </Badge>
  );
}

export function VerifiedBookingBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="outline"
      className={cn('gap-1 text-[10px] border-primary/30 text-primary', className)}
    >
      <CheckCircle className="w-3 h-3" />
      Verified Booking
    </Badge>
  );
}
