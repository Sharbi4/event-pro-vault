import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrowsePackage {
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
  // Vendor info
  vendor_user_id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_location: string | null;
  is_verified: boolean;
  // Rating info
  avg_rating: number;
  review_count: number;
}

export interface BrowseFilters {
  search: string;
  category: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string;
  instantBook: boolean;
  verified: boolean;
  minRating: number | null;
  maxPrice: number | null;
  minPrice: number | null;
}

// Helper to convert time string to minutes for comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Check if two time ranges overlap
const timeRangesOverlap = (
  requestStart: string,
  requestEnd: string,
  availStart: string,
  availEnd: string
): boolean => {
  const reqStartMins = timeToMinutes(requestStart);
  const reqEndMins = timeToMinutes(requestEnd);
  const availStartMins = timeToMinutes(availStart);
  const availEndMins = timeToMinutes(availEnd);
  
  // Request must be fully contained within availability window
  return reqStartMins >= availStartMins && reqEndMins <= availEndMins;
};

export function useBrowsePackages() {
  const [packages, setPackages] = useState<BrowsePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BrowseFilters>({
    search: '',
    category: null,
    date: null,
    startTime: null,
    endTime: null,
    location: '',
    instantBook: false,
    verified: false,
    minRating: null,
    maxPrice: null,
    minPrice: null,
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch active packages from verified vendors
      let packagesQuery = supabase
        .from('vendor_packages')
        .select(`
          id,
          name,
          description,
          category,
          type,
          price,
          min_units,
          travel_radius,
          travel_fee_per_mile,
          includes,
          images,
          instant_book,
          is_active,
          user_id
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      // Apply category filter
      if (filters.category) {
        packagesQuery = packagesQuery.eq('category', filters.category);
      }

      // Apply instant book filter
      if (filters.instantBook) {
        packagesQuery = packagesQuery.eq('instant_book', true);
      }

      // Apply price filters
      if (filters.minPrice !== null) {
        packagesQuery = packagesQuery.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== null) {
        packagesQuery = packagesQuery.lte('price', filters.maxPrice);
      }

      const { data: packagesData, error: packagesError } = await packagesQuery;

      if (packagesError) throw packagesError;

      if (!packagesData || packagesData.length === 0) {
        setPackages([]);
        setLoading(false);
        return;
      }

      // Get unique vendor IDs
      const vendorIds = [...new Set(packagesData.map(p => p.user_id))];

      // Get unique package IDs
      const packageIds = packagesData.map(p => p.id);

      // Fetch vendor details, profiles, reviews, and PACKAGE-level availability in parallel
      const [vendorDetailsResult, profilesResult, reviewsResult, packageAvailabilityResult, packageWeeklyResult] = await Promise.all([
        supabase
          .from('vendor_details')
          .select('user_id, business_name, service_area')
          .in('user_id', vendorIds),
        supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, stripe_account_status, identity_verification_status')
          .in('user_id', vendorIds)
          .eq('is_vendor', true)
          .eq('stripe_account_status', 'active'),
        supabase
          .from('reviews')
          .select('vendor_user_id, package_id, rating')
          .in('vendor_user_id', vendorIds),
        // Fetch package-level blocked dates if date filter is applied
        filters.date ? supabase
          .from('package_availability')
          .select('package_id, date, is_blocked')
          .in('package_id', packageIds)
          .eq('date', filters.date)
          .eq('is_blocked', true) : Promise.resolve({ data: [] }),
        // Fetch package weekly availability with time ranges
        supabase
          .from('package_weekly_availability')
          .select('package_id, day_of_week, is_enabled, start_time, end_time')
          .in('package_id', packageIds)
      ]);

      if (vendorDetailsResult.error) throw vendorDetailsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (reviewsResult.error) throw reviewsResult.error;

      // Create lookup maps
      const vendorDetailsMap = new Map(
        (vendorDetailsResult.data || []).map(v => [v.user_id, v])
      );
      const profilesMap = new Map(
        (profilesResult.data || []).map(p => [p.user_id, p])
      );

      // Get blocked package IDs for the selected date
      const blockedPackageIds = new Set(
        (packageAvailabilityResult.data || []).map((a: any) => a.package_id)
      );

      // Build package weekly availability map with time ranges
      // Map structure: package_id -> day_of_week -> { is_enabled, start_time, end_time }
      const packageWeeklyMap = new Map<string, Map<number, { is_enabled: boolean; start_time: string; end_time: string }>>();
      (packageWeeklyResult.data || []).forEach((w: any) => {
        if (!packageWeeklyMap.has(w.package_id)) {
          packageWeeklyMap.set(w.package_id, new Map());
        }
        packageWeeklyMap.get(w.package_id)!.set(w.day_of_week, {
          is_enabled: w.is_enabled,
          start_time: w.start_time,
          end_time: w.end_time
        });
      });

      // Check if package is available on selected day of week
      let selectedDayOfWeek: number | null = null;
      if (filters.date) {
        const selectedDate = new Date(filters.date);
        selectedDayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
      }

      // Calculate ratings per package
      const reviewsByPackage = new Map<string, { total: number; count: number }>();
      const reviewsByVendor = new Map<string, { total: number; count: number }>();
      
      (reviewsResult.data || []).forEach((review: any) => {
        // By package
        if (review.package_id) {
          const existing = reviewsByPackage.get(review.package_id) || { total: 0, count: 0 };
          reviewsByPackage.set(review.package_id, {
            total: existing.total + review.rating,
            count: existing.count + 1
          });
        }
        // By vendor
        const vendorExisting = reviewsByVendor.get(review.vendor_user_id) || { total: 0, count: 0 };
        reviewsByVendor.set(review.vendor_user_id, {
          total: vendorExisting.total + review.rating,
          count: vendorExisting.count + 1
        });
      });

      // Build enriched packages
      const enrichedPackages: BrowsePackage[] = packagesData
        .map(pkg => {
          const vendorDetails = vendorDetailsMap.get(pkg.user_id);
          const profile = profilesMap.get(pkg.user_id);
          
          // Skip if vendor is not active
          if (!profile) return null;

          // Skip if this specific package is blocked on selected date
          if (filters.date && blockedPackageIds.has(pkg.id)) {
            return null;
          }

          // Skip if this package is not available on the selected day of week
          if (selectedDayOfWeek !== null) {
            const packageWeekly = packageWeeklyMap.get(pkg.id);
            
            if (packageWeekly && packageWeekly.has(selectedDayOfWeek)) {
              const dayAvailability = packageWeekly.get(selectedDayOfWeek)!;
              
              // If day is disabled, skip this package
              if (!dayAvailability.is_enabled) {
                return null;
              }

              // If time range filter is applied, check if requested time fits within availability
              if (filters.startTime && filters.endTime && dayAvailability.start_time && dayAvailability.end_time) {
                const isTimeAvailable = timeRangesOverlap(
                  filters.startTime,
                  filters.endTime,
                  dayAvailability.start_time,
                  dayAvailability.end_time
                );
                
                if (!isTimeAvailable) {
                  return null;
                }
              }
            }
          } else if (filters.startTime && filters.endTime) {
            // If no date selected but time range is set, we can't filter by time
            // Just show all packages (time filtering requires a date to determine day of week)
          }

          const packageReviews = reviewsByPackage.get(pkg.id);
          const vendorReviews = reviewsByVendor.get(pkg.user_id);

          // Use package rating if available, otherwise vendor rating
          const avgRating = packageReviews 
            ? packageReviews.total / packageReviews.count
            : vendorReviews 
              ? vendorReviews.total / vendorReviews.count
              : 0;
          const reviewCount = packageReviews?.count || vendorReviews?.count || 0;

          return {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            category: pkg.category,
            type: pkg.type,
            price: pkg.price,
            min_units: pkg.min_units,
            travel_radius: pkg.travel_radius,
            travel_fee_per_mile: pkg.travel_fee_per_mile,
            includes: pkg.includes || [],
            images: pkg.images || [],
            instant_book: pkg.instant_book || false,
            is_active: pkg.is_active,
            vendor_user_id: pkg.user_id,
            vendor_name: vendorDetails?.business_name || profile?.full_name || 'Unknown Vendor',
            vendor_avatar: profile?.avatar_url,
            vendor_location: vendorDetails?.service_area,
            is_verified: profile?.stripe_account_status === 'active' && 
                        profile?.identity_verification_status === 'verified',
            avg_rating: avgRating,
            review_count: reviewCount
          };
        })
        .filter((pkg): pkg is BrowsePackage => pkg !== null);

      // Apply search filter
      let filteredPackages = enrichedPackages;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.name.toLowerCase().includes(searchLower) ||
          pkg.description?.toLowerCase().includes(searchLower) ||
          pkg.vendor_name.toLowerCase().includes(searchLower) ||
          pkg.category?.toLowerCase().includes(searchLower)
        );
      }

      // Apply location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.vendor_location?.toLowerCase().includes(locationLower)
        );
      }

      // Apply verified filter
      if (filters.verified) {
        filteredPackages = filteredPackages.filter(pkg => pkg.is_verified);
      }

      // Apply rating filter
      if (filters.minRating !== null) {
        filteredPackages = filteredPackages.filter(pkg => pkg.avg_rating >= filters.minRating!);
      }

      // Sort by rating (top rated first), then by review count
      filteredPackages.sort((a, b) => {
        if (b.avg_rating !== a.avg_rating) {
          return b.avg_rating - a.avg_rating;
        }
        return b.review_count - a.review_count;
      });

      setPackages(filteredPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const updateFilter = (key: keyof BrowseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: null,
      date: null,
      startTime: null,
      endTime: null,
      location: '',
      instantBook: false,
      verified: false,
      minRating: null,
      maxPrice: null,
      minPrice: null,
    });
  };

  return {
    packages,
    loading,
    filters,
    updateFilter,
    clearFilters,
    refetch: fetchPackages
  };
}
