import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ShieldCheck, ThumbsUp, Calendar } from 'lucide-react';
import { VendorReviewData } from '@/hooks/useVendorProfile';
import { formatDistanceToNow } from 'date-fns';

interface VendorReviewCardProps {
  review: VendorReviewData;
}

export function VendorReviewCard({ review }: VendorReviewCardProps) {
  const initials = review.reviewer_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarImage src={review.reviewer_avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {review.reviewer_name}
                  </span>
                  {review.is_verified_booking && (
                    <Badge variant="outline" className="gap-1 text-xs border-primary/30 text-primary">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  {review.event_type && (
                    <span>{review.event_type}</span>
                  )}
                  {review.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.event_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-medium text-foreground mb-1">
                {review.title}
              </h4>
            )}

            {/* Content */}
            {review.content && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.content}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{review.helpful_count} found helpful</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
