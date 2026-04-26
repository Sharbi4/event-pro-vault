import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { geocodeLocation, isWithinServiceRadius, getDistanceToVendor, GeocodedLocation } from '@/lib/geocoding';
import { sortPackages as sortPackagesArray, SortOption as RankingSortOption } from '@/lib/packageRanking';

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
  // Event Pro info
  vendor_user_id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_location: string | null;
  vendor_city: string | null;
  vendor_state: string | null;
  vendor_formatted_address: string | null;
  vendor_email: string | null;
  vendor_base_lat: number | null;
  vendor_base_lng: number | null;
  vendor_travel_radius: number | null;
  is_verified: boolean;
  // Rating info
  avg_rating: number;
  review_count: number;
  // Distance from search location (if geocoded)
  distance_miles: number | null;
}

export interface BrowseFilters {
  search: string;
  category: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string;
  locationCoords: GeocodedLocation | null; // Geocoded coordinates
  instantBook: boolean;
  verified: boolean;
  onlinePaymentsOnly: boolean;
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

export type SortOption = 'recommended' | 'price_low' | 'price_high' | 'top_rated' | 'nearest';

export function useBrowsePackages() {
  const [packages, setPackages] = useState<BrowsePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<BrowseFilters>({
    search: '',
    category: null,
    date: null,
    startTime: null,
    endTime: null,
    location: '',
    locationCoords: null,
    instantBook: false,
    verified: false,
    onlinePaymentsOnly: false,
    minRating: null,
    maxPrice: null,
    minPrice: null,
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch active packages from verified Event Pros
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

      // Apply category filter - use ilike for case-insensitive partial match
      if (filters.category) {
        packagesQuery = packagesQuery.ilike('category', `%${filters.category}%`);
      }

      // Apply instant book filter
      if (filters.instantBook) {
        packagesQuery = packagesQuery.eq('instant_book', true);
      }

      // Apply online payments filter
      if (filters.onlinePaymentsOnly) {
        packagesQuery = packagesQuery.in('payment_options', ['ONLINE', 'BOTH']);
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

      // Get unique Event Pro IDs
      const vendorIds = [...new Set(packagesData.map(p => p.user_id))];

      // Get unique package IDs
      const packageIds = packagesData.map(p => p.id);

      // Fetch Event Pro details, profiles, reviews, and PACKAGE-level availability in parallel
      const [vendorDetailsResult, profilesResult, reviewsResult, packageAvailabilityResult, packageWeeklyResult] = await Promise.all([
        supabase
          .from('vendor_details')
          .select('user_id, business_name, service_area, city, state, formatted_address, base_location_lat, base_location_lng, travel_radius_miles')
          .in('user_id', vendorIds),
        supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, stripe_account_status, identity_verification_status, email')
          .in('user_id', vendorIds)
          .eq('is_vendor', true),
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
      const profilesMap = new Map<string, {
        user_id: string;
        full_name: string | null;
        avatar_url: string | null;
        stripe_account_status: string | null;
        identity_verification_status: string | null;
        email: string | null;
      }>(
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
        // By Event Pro
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
          
          // Skip if Event Pro is not active
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

          // Use package rating if available, otherwise Event Pro rating
          const avgRating = packageReviews 
            ? packageReviews.total / packageReviews.count
            : vendorReviews 
              ? vendorReviews.total / vendorReviews.count
              : 0;
          const reviewCount = packageReviews?.count || vendorReviews?.count || 0;

          // Build location string from available fields
          const locationParts = [
            vendorDetails?.city,
            vendorDetails?.state
          ].filter(Boolean);
          const vendorLocationDisplay = locationParts.length > 0 
            ? locationParts.join(', ')
            : vendorDetails?.service_area || vendorDetails?.formatted_address || null;

          // Get Event Pro coordinates and travel radius
          const vendorBaseLat = vendorDetails?.base_location_lat ? Number(vendorDetails.base_location_lat) : null;
          const vendorBaseLng = vendorDetails?.base_location_lng ? Number(vendorDetails.base_location_lng) : null;
          // Use package travel_radius if set, otherwise fall back to Event Pro's travel_radius_miles
          const vendorTravelRadius = pkg.travel_radius || vendorDetails?.travel_radius_miles || 50;

          // Calculate distance if we have geocoded search location and Event Pro coordinates
          let distanceMiles: number | null = null;
          if (filters.locationCoords && vendorBaseLat !== null && vendorBaseLng !== null) {
            distanceMiles = getDistanceToVendor(
              vendorBaseLat,
              vendorBaseLng,
              filters.locationCoords.lat,
              filters.locationCoords.lng
            );
          }

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
            vendor_name: vendorDetails?.business_name || profile?.full_name || 'Unknown Event Pro',
            vendor_avatar: profile?.avatar_url,
            vendor_location: vendorLocationDisplay,
            vendor_city: vendorDetails?.city || null,
            vendor_state: vendorDetails?.state || null,
            vendor_formatted_address: vendorDetails?.formatted_address || null,
            vendor_email: profile?.email || null,
            vendor_base_lat: vendorBaseLat,
            vendor_base_lng: vendorBaseLng,
            vendor_travel_radius: vendorTravelRadius,
            is_verified: profile?.identity_verification_status === 'verified',
            avg_rating: avgRating,
            review_count: reviewCount,
            distance_miles: distanceMiles
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

      // Apply location filter using geocoding + service radius when available
      if (filters.location) {
        if (filters.locationCoords) {
          // Geocoded search: filter by service radius
          filteredPackages = filteredPackages.filter(pkg => {
            // If Event Pro doesn't have coordinates, fall back to text matching
            if (pkg.vendor_base_lat === null || pkg.vendor_base_lng === null) {
              const locationLower = filters.location.toLowerCase();
              return pkg.vendor_location?.toLowerCase().includes(locationLower) ||
                     pkg.vendor_city?.toLowerCase().includes(locationLower) ||
                     pkg.vendor_state?.toLowerCase().includes(locationLower) ||
                     pkg.vendor_formatted_address?.toLowerCase().includes(locationLower);
            }
            
            // Check if search location is within Event Pro's service radius
            return isWithinServiceRadius(
              pkg.vendor_base_lat,
              pkg.vendor_base_lng,
              pkg.vendor_travel_radius || 50, // Default 50 mile radius
              filters.locationCoords!.lat,
              filters.locationCoords!.lng
            );
          });
        } else {
          // No geocoding available, fall back to text matching
          const locationLower = filters.location.toLowerCase();
          filteredPackages = filteredPackages.filter(pkg => 
            pkg.vendor_location?.toLowerCase().includes(locationLower) ||
            pkg.vendor_city?.toLowerCase().includes(locationLower) ||
            pkg.vendor_state?.toLowerCase().includes(locationLower) ||
            pkg.vendor_formatted_address?.toLowerCase().includes(locationLower)
          );
        }
      }

      // Apply verified filter
      if (filters.verified) {
        filteredPackages = filteredPackages.filter(pkg => pkg.is_verified);
      }

      // Apply rating filter
      if (filters.minRating !== null) {
        filteredPackages = filteredPackages.filter(pkg => pkg.avg_rating >= filters.minRating!);
      }

      // Apply sorting based on sortBy state
      filteredPackages = sortPackagesArray(filteredPackages, sortBy, !!filters.locationCoords);

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

  // Track if we've shown the realtime toast to avoid spamming
  const hasShownRealtimeToast = useRef(false);

  // Real-time subscription for booking changes (affects availability)
  useEffect(() => {
    // Only subscribe if a date filter is applied (availability matters)
    if (!filters.date) return;

    const channel = supabase
      .channel('browse-availability-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          // Refetch packages when a new booking is made
          fetchPackages();
          
          // Show a subtle notification only once per session
          if (!hasShownRealtimeToast.current) {
            toast.info('Availability updated', { 
              description: 'Results refreshed with latest bookings',
              duration: 2000 
            });
            hasShownRealtimeToast.current = true;
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const updatedBooking = payload.new as { status: string };
          // Refetch if booking status changed (cancelled, confirmed, etc.)
          if (['cancelled', 'confirmed'].includes(updatedBooking.status)) {
            fetchPackages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.date, fetchPackages]);

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
      locationCoords: null,
      instantBook: false,
      verified: false,
      onlinePaymentsOnly: false,
      minRating: null,
      maxPrice: null,
      minPrice: null,
    });
  };

  // Geocode location when it changes
  const geocodeSearchLocation = useCallback(async (locationString: string) => {
    if (!locationString.trim()) {
      setFilters(prev => ({ ...prev, locationCoords: null }));
      return;
    }

    const coords = await geocodeLocation(locationString);
    if (coords) {
      setFilters(prev => ({ ...prev, locationCoords: coords }));
    }
  }, []);

  return {
    packages,
    loading,
    filters,
    sortBy,
    setSortBy,
    updateFilter,
    clearFilters,
    refetch: fetchPackages,
    geocodeSearchLocation
  };
}
