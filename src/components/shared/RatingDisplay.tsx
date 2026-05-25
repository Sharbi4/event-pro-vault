import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type RatingVariant = 'inline' | 'pill' | 'minimal' | 'hero';

interface RatingDisplayProps {
  avgRating?: number | null;
  reviewCount?: number | null;
  size?: RatingSize;
  variant?: RatingVariant;
  showCount?: boolean;
  className?: string;
  starClassName?: string;
}

const sizeMap: Record<RatingSize, { star: string; text: string; count: string }> = {
  xs:   { star: 'w-3 h-3',   text: 'text-xs',   count: 'text-[10px]' },
  sm:   { star: 'w-3.5 h-3.5', text: 'text-sm', count: 'text-[11px]' },
  md:   { star: 'w-4 h-4',   text: 'text-base', count: 'text-xs' },
  lg:   { star: 'w-5 h-5',   text: 'text-lg',  count: 'text-sm' },
  xl:   { star: 'w-6 h-6',   text: 'text-2xl', count: 'text-sm' },
};

function isValidRating(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function RatingDisplay({
  avgRating,
  reviewCount,
  size = 'sm',
  variant = 'inline',
  showCount = true,
  className,
  starClassName,
}: RatingDisplayProps) {
  const hasRating = isValidRating(avgRating);
  const hasCount = isValidCount(reviewCount);

  const { star: starSize, text: textSize, count: countSize } = sizeMap[size];

  // ── Minimal: just the number, no star ──
  if (variant === 'minimal') {
    if (!hasRating) {
      return (
        <span className={cn('text-muted-foreground/70 uppercase tracking-[0.12em] font-medium', countSize, className)}>
          New
        </span>
      );
    }
    return (
      <span className={cn('font-semibold tabular-nums', textSize, className)}>
        {avgRating.toFixed(1)}
      </span>
    );
  }

  // ── Hero: big score with star row ──
  if (variant === 'hero') {
    if (!hasRating) return null;
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <div className="relative">
          <span className="font-display text-6xl md:text-7xl font-bold text-foreground tracking-tight">
            {avgRating.toFixed(1)}
          </span>
          <span className="font-mono text-sm text-muted-foreground absolute -right-5 top-2">/5</span>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'transition-all duration-300',
                starSize,
                i < Math.round(avgRating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/20'
              )}
            />
          ))}
        </div>
        {hasCount && showCount && (
          <p className="font-mono text-xs text-muted-foreground tracking-wide uppercase mt-2">
            {reviewCount} verified review{reviewCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }

  // ── Pill: dark bg badge for overlays ──
  if (variant === 'pill') {
    if (!hasRating) return null;
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1',
          className
        )}
      >
        <Star className={cn('text-amber-400 fill-amber-400', starSize, starClassName)} />
        <span className="text-white font-medium tabular-nums">{avgRating.toFixed(1)}</span>
        {hasCount && showCount && (
          <span className="text-white/70">({reviewCount})</span>
        )}
      </div>
    );
  }

  // ── Inline (default): star + number + optional count ──
  if (!hasRating) {
    return (
      <span className={cn('text-muted-foreground/70 uppercase tracking-[0.12em] font-medium', countSize, className)}>
        New
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star className={cn('text-amber-400 fill-amber-400 shrink-0', starSize, starClassName)} />
      <span className={cn('font-semibold tabular-nums', textSize)}>
        {avgRating.toFixed(1)}
      </span>
      {hasCount && showCount && (
        <span className={cn('text-muted-foreground', countSize)}>
          ({reviewCount})
        </span>
      )}
    </span>
  );
}

/**
 * StarRatingBar — renders 5 stars for a given rating value.
 * Used in review breakdowns and summary blocks.
 */
interface StarRatingBarProps {
  rating: number;
  size?: RatingSize;
  className?: string;
}

export function StarRatingBar({ rating, size = 'sm', className }: StarRatingBarProps) {
  const { star: starSize } = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'transition-all duration-300',
            starSize,
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground/20'
          )}
        />
      ))}
    </div>
  );
}
