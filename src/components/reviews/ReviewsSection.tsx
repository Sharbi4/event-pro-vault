import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle, ThumbsUp, ChevronDown, Filter, MessageSquare, Loader2 } from 'lucide-react';
import { VendorReviewData } from '@/hooks/useVendorProfile';
import { VerifiedBookingBadge } from '@/components/badges/TrustBadges';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewsSectionProps {
  reviews: VendorReviewData[];
  avgRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
  packages?: { id: string; name: string }[];
  className?: string;
}

type SortOption = 'recent' | 'highest' | 'lowest' | 'helpful';

export function ReviewsSection({
  reviews,
  avgRating,
  totalReviews,
  ratingBreakdown,
  packages,
  className,
}: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  // Filter reviews
  let filteredReviews = filterPackage === 'all'
    ? reviews
    : reviews.filter(r => r.package_id === filterPackage);

  // Sort reviews
  filteredReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);

  if (totalReviews === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Star className="w-6 h-6 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-foreground mb-1">No reviews yet</h4>
        <p className="text-sm text-muted-foreground">
          Be the first to leave a review after your event!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Rating Summary */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 pb-6 border-b border-border">
        {/* Overall Score */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= Math.round(avgRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 space-y-1.5 min-w-[180px]">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingBreakdown[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-muted-foreground">{rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="w-8 text-xs text-muted-foreground text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          {packages && packages.length > 1 && (
            <Select value={filterPackage} onValueChange={setFilterPackage}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="All Packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show More */}
      {filteredReviews.length > 5 && !showAll && (
        <Button
          variant="outline"
          onClick={() => setShowAll(true)}
          className="w-full mt-4 gap-2"
        >
          Show All {filteredReviews.length} Reviews
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: VendorReviewData }) {
  const initials = review.reviewer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={review.reviewer_avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {review.reviewer_name}
                  </span>
                  {review.is_verified_booking && (
                    <VerifiedBookingBadge />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {review.event_type && <span>{review.event_type}</span>}
                  {review.event_date && (
                    <span>
                      {new Date(review.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5 bg-primary/10 rounded-full px-2 py-1 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < review.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
            )}

            {/* Content */}
            {review.content && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.content}
              </p>
            )}

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {review.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            {/* Vendor reply (or inline reply form for the vendor) */}
            <VendorReplyArea review={review} />

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3 h-3" />
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

function VendorReplyArea({ review }: { review: VendorReviewData }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState(review.vendor_reply ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedReply, setSavedReply] = useState(review.vendor_reply ?? null);
  const [savedAt, setSavedAt] = useState(review.vendor_reply_at ?? null);

  const isVendor = !!user && !!review.vendor_user_id && user.id === review.vendor_user_id;

  if (savedReply) {
    return (
      <div className="mt-3 ml-2 border-l-2 border-primary/40 pl-3 py-2 bg-primary/5 rounded-r-md">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
          <MessageSquare className="w-3 h-3" />
          Response from vendor
          {savedAt && (
            <span className="text-muted-foreground font-normal">
              · {formatDistanceToNow(new Date(savedAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground">{savedReply}</p>
        {isVendor && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1"
          >
            Edit reply
          </button>
        )}
        {isVendor && editing && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Thank the customer or address feedback…"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={saving || !reply.trim()}
                onClick={async () => {
                  setSaving(true);
                  const now = new Date().toISOString();
                  const { error } = await supabase
                    .from('reviews')
                    .update({ vendor_reply: reply.trim(), vendor_reply_at: now })
                    .eq('id', review.id);
                  setSaving(false);
                  if (error) {
                    toast({ title: 'Could not save reply', description: error.message, variant: 'destructive' });
                    return;
                  }
                  setSavedReply(reply.trim());
                  setSavedAt(now);
                  setEditing(false);
                  toast({ title: 'Reply updated' });
                }}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setReply(savedReply ?? ''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isVendor) return null;

  return (
    <div className="mt-3 ml-2 border-l-2 border-border pl-3 py-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Reply publicly to this review…"
        className="text-sm"
      />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          disabled={saving || !reply.trim()}
          onClick={async () => {
            setSaving(true);
            const now = new Date().toISOString();
            const { error } = await supabase
              .from('reviews')
              .update({ vendor_reply: reply.trim(), vendor_reply_at: now })
              .eq('id', review.id);
            setSaving(false);
            if (error) {
              toast({ title: 'Could not post reply', description: error.message, variant: 'destructive' });
              return;
            }
            setSavedReply(reply.trim());
            setSavedAt(now);
            toast({ title: 'Reply posted' });
          }}
        >
          {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MessageSquare className="w-3 h-3 mr-1" />}
          Post reply
        </Button>
      </div>
    </div>
  );
}
