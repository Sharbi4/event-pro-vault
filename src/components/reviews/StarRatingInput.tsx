import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRatingInput({ 
  value, 
  onChange, 
  disabled = false,
  size = 'md' 
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };

  const displayRating = hoverRating || value;

  return (
    <div className={cn('flex items-center', gapClasses[size])}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => !disabled && onChange(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150',
                isFilled 
                  ? 'text-amber-400 fill-amber-400' 
                  : 'text-muted-foreground/30'
              )}
            />
          </button>
        );
      })}
      
      {displayRating > 0 && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {displayRating === 1 && 'Poor'}
          {displayRating === 2 && 'Fair'}
          {displayRating === 3 && 'Good'}
          {displayRating === 4 && 'Very Good'}
          {displayRating === 5 && 'Excellent'}
        </span>
      )}
    </div>
  );
}
