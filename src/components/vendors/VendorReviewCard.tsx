import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ShieldCheck, ThumbsUp, Calendar, Quote } from 'lucide-react';
import { VendorReviewData } from '@/hooks/useVendorProfile';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

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
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card variant="glass" className="overflow-hidden group">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="w-12 h-12 border-2 border-border/60 shadow-sm flex-shrink-0">
              <AvatarImage src={review.reviewer_avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground tracking-tight">
                      {review.reviewer_name}
                    </span>
                    {review.is_verified_booking && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-xs border-primary/30 text-primary bg-primary/5 backdrop-blur-sm"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Verified Booking
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {review.event_type && (
                      <span className="font-mono text-xs uppercase tracking-wide">
                        {review.event_type}
                      </span>
                    )}
                    {review.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Pill */}
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Title */}
              {review.title && (
                <h4 className="font-display font-medium text-foreground mb-2 tracking-tight">
                  {review.title}
                </h4>
              )}

              {/* Content */}
              {review.content && (
                <div className="relative">
                  <Quote className="absolute -left-1 -top-1 w-4 h-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground text-sm leading-relaxed pl-4">
                    {review.content}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="font-mono text-xs text-muted-foreground tracking-wide uppercase">
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
    </motion.div>
  );
}
