import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  min_units: number;
  includes: string[];
  cover_image_url: string | null;
  category: string | null;
  vendor_user_id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_city: string | null;
}

interface FeaturedVendor {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  primary_city: string | null;
  is_verified: boolean;
  categories: string[];
  avg_rating: number;
  review_count: number;
  cover_image_url: string | null;
}

export function useFeaturedPackages(limit = 6) {
  return useQuery({
    queryKey: ['featured-packages', limit],
    queryFn: async (): Promise<FeaturedPackage[]> => {
      // Fetch active packages from verified Event Pros
      const { data: packages, error } = await supabase
        .from('vendor_packages')
        .select(`
          id,
          name,
          description,
          price,
          type,
          min_units,
          includes,
          cover_image_url,
          category,
          user_id
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Fetch more to filter by verified Event Pros

      if (error) throw error;
      if (!packages?.length) return [];

      // Get Event Pro details for these packages
      const vendorIds = [...new Set(packages.map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, primary_city, stripe_account_status')
        .in('user_id', vendorIds)
        .eq('stripe_account_status', 'active');

      const { data: vendorDetails } = await supabase
        .from('vendor_details')
        .select('user_id, cover_image_url')
        .in('user_id', vendorIds);

      if (!profiles?.length) return [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));
      const detailsMap = new Map(vendorDetails?.map(d => [d.user_id, d]) || []);

      // Filter packages to only verified Event Pros and enrich with Event Pro data
      const enrichedPackages = packages
        .filter(pkg => profileMap.has(pkg.user_id))
        .map(pkg => {
          const profile = profileMap.get(pkg.user_id);
          const details = detailsMap.get(pkg.user_id);
          return {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            type: pkg.type,
            min_units: pkg.min_units,
            includes: pkg.includes || [],
            cover_image_url: pkg.cover_image_url || details?.cover_image_url || null,
            category: pkg.category,
            vendor_user_id: pkg.user_id,
            vendor_name: profile?.display_name || 'Event Pro',
            vendor_avatar: profile?.avatar_url || null,
            vendor_city: profile?.primary_city || null,
          };
        })
        .slice(0, limit);

      return enrichedPackages;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedVendors(limit = 4) {
  return useQuery({
    queryKey: ['featured-vendors', limit],
    queryFn: async (): Promise<FeaturedVendor[]> => {
      // Fetch verified Event Pro profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          short_bio,
          primary_city,
          stripe_account_status,
          identity_verification_status
        `)
        .eq('is_vendor', true)
        .eq('stripe_account_status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;
      if (!profiles?.length) return [];

      const userIds = profiles.map(p => p.user_id);

      // Get Event Pro details for categories and cover images
      const { data: vendorDetails } = await supabase
        .from('vendor_details')
        .select('user_id, service_categories, cover_image_url')
        .in('user_id', userIds);

      // Get review stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('vendor_user_id, rating')
        .in('vendor_user_id', userIds);

      const detailsMap = new Map(vendorDetails?.map(d => [d.user_id, d]) || []);
      
      // Calculate review stats per Event Pro
      const reviewStats = new Map<string, { total: number; count: number }>();
      reviews?.forEach(r => {
        const existing = reviewStats.get(r.vendor_user_id) || { total: 0, count: 0 };
        reviewStats.set(r.vendor_user_id, {
          total: existing.total + r.rating,
          count: existing.count + 1,
        });
      });

      const enrichedVendors = profiles
        .map(profile => {
          const details = detailsMap.get(profile.user_id);
          const stats = reviewStats.get(profile.user_id) || { total: 0, count: 0 };
          const avgRating = stats.count > 0 ? stats.total / stats.count : 0;

          return {
            id: profile.id,
            user_id: profile.user_id,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            short_bio: profile.short_bio,
            primary_city: profile.primary_city,
            is_verified: profile.identity_verification_status === 'verified',
            categories: details?.service_categories || [],
            avg_rating: Math.round(avgRating * 10) / 10,
            review_count: stats.count,
            cover_image_url: details?.cover_image_url || null,
          };
        })
        .slice(0, limit);

      return enrichedVendors;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentReviews(limit = 3) {
  return useQuery({
    queryKey: ['recent-reviews', limit],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          content,
          reviewer_name,
          reviewer_avatar,
          event_type,
          is_verified_booking,
          created_at,
          vendor_user_id
        `)
        .eq('is_verified_booking', true)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!reviews?.length) return [];

      // Get Event Pro names
      const vendorIds = [...new Set(reviews.map(r => r.vendor_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', vendorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      return reviews.map(r => ({
        ...r,
        vendor_name: profileMap.get(r.vendor_user_id) || 'Event Pro',
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

interface CategoryCount {
  category: string;
  count: number;
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['category-counts'],
    queryFn: async (): Promise<Map<string, number>> => {
      // Fetch all active packages with their categories
      const { data: packages, error } = await supabase
        .from('vendor_packages')
        .select('category, user_id')
        .eq('is_active', true)
        .eq('is_published', true);

      if (error) throw error;

      // Also check that Event Pros are verified (have active Stripe)
      const userIds = [...new Set(packages?.map(p => p.user_id) || [])];
      
      if (userIds.length === 0) return new Map();
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('stripe_account_status', 'active');

      const activeUserIds = new Set(profiles?.map(p => p.user_id) || []);

      // Count packages per category from verified Event Pros only
      const counts = new Map<string, number>();
      
      packages?.forEach(pkg => {
        if (pkg.category && activeUserIds.has(pkg.user_id)) {
          counts.set(pkg.category, (counts.get(pkg.category) || 0) + 1);
        }
      });

      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface CategoryPackage {
  id: string;
  name: string;
  price: number;
  type: string;
  cover_image_url: string | null;
  category: string | null;
  vendor_user_id: string;
  vendor_name: string;
  vendor_city: string | null;
  avg_rating: number;
  is_verified: boolean;
  instant_book: boolean;
}

export function useCategoryPackages(categoryIds: string[], limit = 6) {
  return useQuery({
    queryKey: ['category-packages', categoryIds, limit],
    queryFn: async (): Promise<CategoryPackage[]> => {
      if (!categoryIds.length) return [];

      // Fetch active packages for specified categories
      const { data: packages, error } = await supabase
        .from('vendor_packages')
        .select(`
          id,
          name,
          price,
          type,
          cover_image_url,
          category,
          user_id,
          instant_book
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .in('category', categoryIds)
        .order('created_at', { ascending: false })
        .limit(limit * 3); // Fetch more to filter

      if (error) throw error;
      if (!packages?.length) return [];

      // Get Event Pro details
      const vendorIds = [...new Set(packages.map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, primary_city, stripe_account_status, identity_verification_status')
        .in('user_id', vendorIds);

      const { data: vendorDetails } = await supabase
        .from('vendor_details')
        .select('user_id, cover_image_url')
        .in('user_id', vendorIds);

      // Get review stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('vendor_user_id, rating')
        .in('vendor_user_id', vendorIds);

      if (!profiles?.length) return [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));
      const detailsMap = new Map(vendorDetails?.map(d => [d.user_id, d]) || []);
      
      // Calculate review stats per Event Pro
      const reviewStats = new Map<string, { total: number; count: number }>();
      reviews?.forEach(r => {
        const existing = reviewStats.get(r.vendor_user_id) || { total: 0, count: 0 };
        reviewStats.set(r.vendor_user_id, {
          total: existing.total + r.rating,
          count: existing.count + 1,
        });
      });

      // Filter and enrich packages
      const enrichedPackages = packages
        .filter(pkg => profileMap.has(pkg.user_id))
        .map(pkg => {
          const profile = profileMap.get(pkg.user_id);
          const details = detailsMap.get(pkg.user_id);
          const stats = reviewStats.get(pkg.user_id) || { total: 0, count: 0 };
          const avgRating = stats.count > 0 ? stats.total / stats.count : 0;

          return {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            type: pkg.type,
            cover_image_url: pkg.cover_image_url || details?.cover_image_url || null,
            category: pkg.category,
            vendor_user_id: pkg.user_id,
            vendor_name: profile?.display_name || 'Event Pro',
            vendor_city: profile?.primary_city || null,
            avg_rating: Math.round(avgRating * 10) / 10,
            is_verified: profile?.identity_verification_status === 'verified',
            instant_book: pkg.instant_book || false,
          };
        })
        .slice(0, limit);

      return enrichedPackages;
    },
    staleTime: 5 * 60 * 1000,
    enabled: categoryIds.length > 0,
  });
}
