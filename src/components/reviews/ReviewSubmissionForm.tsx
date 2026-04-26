import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StarRatingInput } from './StarRatingInput';
import { useReviewSubmission, ReviewFormData, ReviewSubmissionParams } from '@/hooks/useReviewSubmission';

interface ReviewSubmissionFormProps {
  bookingId: string;
  vendorUserId: string;
  vendorName: string;
  packageId?: string;
  packageName?: string;
  eventDate?: string;
  reviewerName: string;
  reviewerAvatar?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewSubmissionForm({
  bookingId,
  vendorUserId,
  vendorName,
  packageId,
  packageName,
  eventDate,
  reviewerName,
  reviewerAvatar,
  onSuccess,
  onCancel,
}: ReviewSubmissionFormProps) {
  const { submitting, submitReview } = useReviewSubmission();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: '',
    tags: [],
  });

  const REVIEW_TAGS = [
    'On time', 'Professional', 'Great communication', 'Setup was smooth',
    'Quality service', 'Above and beyond', 'Would book again', 'Easy to work with',
  ];

  const toggleTag = (tag: string) => {
    setFormData((p) => {
      const current = p.tags ?? [];
      return {
        ...p,
        tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const params: ReviewSubmissionParams = {
      bookingId,
      vendorUserId,
      packageId,
      eventDate,
      reviewerName,
      reviewerAvatar,
    };

    const success = await submitReview(formData, params);
    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-verified/20 flex items-center justify-center mb-4"
        >
          <CheckCircle className="w-8 h-8 text-verified" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
        <p className="text-muted-foreground text-sm">
          Your review helps others find great vendors
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center pb-2">
        <h3 className="text-lg font-semibold mb-1">
          How was your experience with {vendorName}?
        </h3>
        {packageName && (
          <p className="text-sm text-muted-foreground">{packageName}</p>
        )}
        <Badge variant="verified" className="mt-2 gap-1">
          <BadgeCheck className="w-3 h-3" />
          Verified Booking
        </Badge>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col items-center gap-2">
        <Label className="text-sm text-muted-foreground">
          Tap to rate
        </Label>
        <StarRatingInput
          value={formData.rating}
          onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
          size="lg"
        />
      </div>

      <AnimatePresence>
        {formData.rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="review-title">
                Title <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="review-title"
                placeholder="Summarize your experience"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="review-content">
                Your Review <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="review-content"
                placeholder="Share details about your event and the vendor's service..."
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.content.length}/1000
              </p>
            </div>

            {/* Quick tags */}
            <div className="space-y-2">
              <Label>What stood out? <span className="text-muted-foreground">(optional)</span></Label>
              <div className="flex flex-wrap gap-2">
                {REVIEW_TAGS.map((tag) => {
                  const active = (formData.tags ?? []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            Maybe Later
          </Button>
        )}
        <Button
          type="submit"
          disabled={formData.rating === 0 || submitting}
          className="flex-1"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
}
