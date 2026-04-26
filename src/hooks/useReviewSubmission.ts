import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  tags?: string[];
}

export interface ReviewSubmissionParams {
  bookingId: string;
  vendorUserId: string;
  packageId?: string;
  eventDate?: string;
  reviewerName: string;
  reviewerAvatar?: string;
}

export function useReviewSubmission() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<string | null>(null);

  const checkExistingReview = async (bookingId: string): Promise<boolean> => {
    if (!user) return false;

    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('reviewer_user_id', user.id)
      .maybeSingle();

    if (data) {
      setExistingReview(data.id);
      return true;
    }
    return false;
  };

  const submitReview = async (
    formData: ReviewFormData,
    params: ReviewSubmissionParams
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to leave a review',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return false;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        reviewer_user_id: user.id,
        vendor_user_id: params.vendorUserId,
        booking_id: params.bookingId,
        package_id: params.packageId || null,
        rating: formData.rating,
        title: formData.title.trim() || null,
        content: formData.content.trim() || null,
        reviewer_name: params.reviewerName,
        reviewer_avatar: params.reviewerAvatar || null,
        event_date: params.eventDate || null,
        is_verified_booking: true,
        helpful_count: 0,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Review already submitted',
            description: 'You have already reviewed this booking',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: 'Review submitted!',
        description: 'Thank you for sharing your experience',
      });

      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Failed to submit review',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    existingReview,
    checkExistingReview,
    submitReview,
  };
}
