import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { useRecentReviews } from '@/hooks/useFeaturedContent';
import { formatDistanceToNow } from 'date-fns';

export function Testimonials() {
  const { data: reviews, isLoading } = useRecentReviews(3);

  if (isLoading) {
    return (
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real experiences from verified bookings on our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((review, index) => (
            <Card 
              key={review.id}
              className="relative overflow-hidden animate-fade-in bg-card/50 backdrop-blur-sm border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-trust fill-trust'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>

                {/* Review title */}
                {review.title && (
                  <h4 className="font-semibold text-foreground mb-2">
                    "{review.title}"
                  </h4>
                )}

                {/* Review content */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-4">
                  {review.content || 'Great experience with this vendor!'}
                </p>

                {/* Reviewer info */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    {review.reviewer_avatar ? (
                      <img
                        src={review.reviewer_avatar}
                        alt={review.reviewer_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {review.reviewer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.reviewer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.event_type && `${review.event_type} • `}
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {review.is_verified_booking && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Vendor attribution */}
                <p className="text-xs text-muted-foreground mt-3">
                  Booked {review.vendor_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
