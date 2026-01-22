import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VendorProfileData {
  userId: string;
  businessName: string;
  businessDescription: string;
  businessType: string;
  serviceArea: string;
  serviceCategories: string[];
  websiteUrl: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  displayName: string | null;
  shortBio: string | null;
  isVerified: boolean;
  stripeAccountStatus: string;
  identityVerificationStatus: string;
}

export interface VendorPackageData {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  type: string;
  price: number;
  min_units: number;
  travel_radius: number | null;
  travel_fee_per_mile: number | null;
  includes: string[];
  images: string[];
  instant_book: boolean;
  is_active: boolean;
  sort_order: number;
  cancellation_policy: string | null;
  avgRating?: number;
  reviewCount?: number;
}

export interface VendorReviewData {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  event_type: string | null;
  event_date: string | null;
  is_verified_booking: boolean;
  helpful_count: number;
  created_at: string;
  package_id: string | null;
}

export function useVendorProfile(vendorUserId: string | undefined) {
  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [packages, setPackages] = useState<VendorPackageData[]>([]);
  const [reviews, setReviews] = useState<VendorReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorUserId) {
      setLoading(false);
      return;
    }

    async function fetchVendorData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch vendor details and profile in parallel
        const [detailsResult, profileResult, packagesResult, reviewsResult] = await Promise.all([
          supabase
            .from('vendor_details')
            .select('*')
            .eq('user_id', vendorUserId)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', vendorUserId)
            .maybeSingle(),
          supabase
            .from('vendor_packages')
            .select('*')
            .eq('user_id', vendorUserId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('reviews')
            .select('*')
            .eq('vendor_user_id', vendorUserId)
            .order('created_at', { ascending: false })
        ]);

        if (detailsResult.error) throw detailsResult.error;
        if (profileResult.error) throw profileResult.error;
        if (packagesResult.error) throw packagesResult.error;
        if (reviewsResult.error) throw reviewsResult.error;

        if (!detailsResult.data || !profileResult.data) {
          setError('Vendor not found');
          setLoading(false);
          return;
        }

        // Calculate ratings per package
        const reviewsByPackage = new Map<string, { total: number; count: number }>();
        reviewsResult.data?.forEach((review: VendorReviewData) => {
          if (review.package_id) {
            const existing = reviewsByPackage.get(review.package_id) || { total: 0, count: 0 };
            reviewsByPackage.set(review.package_id, {
              total: existing.total + review.rating,
              count: existing.count + 1
            });
          }
        });

        // Enrich packages with rating data
        const enrichedPackages = (packagesResult.data || []).map((pkg: any) => {
          const packageReviews = reviewsByPackage.get(pkg.id);
          return {
            ...pkg,
            includes: pkg.includes || [],
            images: pkg.images || [],
            avgRating: packageReviews ? packageReviews.total / packageReviews.count : 0,
            reviewCount: packageReviews?.count || 0
          };
        });

        setProfile({
          userId: vendorUserId,
          businessName: detailsResult.data.business_name || 'Unknown Business',
          businessDescription: detailsResult.data.business_description || '',
          businessType: detailsResult.data.business_type || '',
          serviceArea: detailsResult.data.service_area || '',
          serviceCategories: detailsResult.data.service_categories || [],
          websiteUrl: detailsResult.data.website_url,
          fullName: profileResult.data.full_name,
          avatarUrl: profileResult.data.avatar_url,
          coverImageUrl: detailsResult.data.cover_image_url,
          displayName: profileResult.data.display_name,
          shortBio: profileResult.data.short_bio,
          isVerified: profileResult.data.stripe_account_status === 'active' && 
                      profileResult.data.identity_verification_status === 'verified',
          stripeAccountStatus: profileResult.data.stripe_account_status || 'not_started',
          identityVerificationStatus: profileResult.data.identity_verification_status || 'not_started'
        });

        setPackages(enrichedPackages);
        setReviews(reviewsResult.data || []);

      } catch (err: any) {
        console.error('Error fetching vendor profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVendorData();
  }, [vendorUserId]);

  // Calculate overall stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;

  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  // Sort packages by rating (top rated first)
  const sortedPackages = [...packages].sort((a, b) => {
    // First by rating (descending)
    if ((b.avgRating || 0) !== (a.avgRating || 0)) {
      return (b.avgRating || 0) - (a.avgRating || 0);
    }
    // Then by review count (descending)
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  return {
    profile,
    packages: sortedPackages,
    reviews,
    loading,
    error,
    avgRating,
    totalReviews,
    ratingBreakdown
  };
}
