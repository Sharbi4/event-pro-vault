import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PackageVariation {
  id: string;
  name: string;
  description: string | null;
  price: number;
  min_guests: number | null;
  max_guests: number | null;
  duration_minutes: number | null;
  includes: string[];
  is_default: boolean;
  sort_order: number;
}

export interface MenuItem {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
}

export interface PackageDetailData {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  type: string;
  pricing_type: string | null;
  price: number;
  starting_at: number | null;
  min_units: number;
  min_hours: number | null;
  min_guests: number | null;
  min_days: number | null;
  duration_minutes: number | null;
  setup_time_minutes: number | null;
  breakdown_time_minutes: number | null;
  travel_radius: number | null;
  travel_fee_per_mile: number | null;
  price_per_mile: number | null;
  included_travel_miles: number | null;
  pickup_only: boolean | null;
  includes: string[];
  add_ons: { id: string; name: string; price: number }[];
  requirements: string[];
  images: string[];
  cover_image_url: string | null;
  instant_book: boolean;
  is_active: boolean;
  booking_mode: 'INSTANT' | 'REQUEST';
  payment_options: 'ONLINE' | 'CASH' | 'BOTH';
  cancellation_policy: string | null;
  customer_requirements: string | null;
  deposit: number | null;
  // Daily booking defaults
  default_start_time: string | null;
  // NEW: variations / fulfillment / menu / questions
  package_kind: string | null;
  variations: PackageVariation[];
  fulfillment_options: string[];
  fulfillment_pricing: Record<string, number>;
  menu_items: MenuItem[];
  customer_questions: string[];
  // Event Pro info
  vendor_user_id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_display_name: string | null;
  vendor_short_bio: string | null;
  vendor_location: string | null;
  vendor_categories: string[];
  vendor_stripe_status: string | null;
  vendor_base_lat: number | null;
  vendor_base_lng: number | null;
  vendor_travel_radius: number | null;
  is_verified: boolean;
  // Rating info
  avg_rating: number;
  review_count: number;
}

export interface PackageReview {
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
}

export function usePackageDetail(packageId: string | undefined) {
  const [packageData, setPackageData] = useState<PackageDetailData | null>(null);
  const [reviews, setReviews] = useState<PackageReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      setError('Package not found');
      return;
    }

    async function fetchPackageData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch package with Event Pro info
        const { data: pkg, error: pkgError } = await supabase
          .from('vendor_packages')
          .select('*')
          .eq('id', packageId)
          .maybeSingle();

        if (pkgError) throw pkgError;
        if (!pkg) {
          setError('Package not found');
          setLoading(false);
          return;
        }

        // Fetch Event Pro details, profile, reviews, and variations in parallel
        const [detailsResult, profileResult, reviewsResult, variationsResult] = await Promise.all([
          supabase
            .from('vendor_details')
            .select('*')
            .eq('user_id', pkg.user_id)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', pkg.user_id)
            .maybeSingle(),
          supabase
            .from('reviews')
            .select('*')
            .eq('package_id', packageId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('package_variations' as any)
            .select('*')
            .eq('package_id', packageId)
            .order('sort_order', { ascending: true })
        ]);

        if (!detailsResult.data || !profileResult.data) {
          setError('Event Pro not found');
          setLoading(false);
          return;
        }

        // Calculate average rating
        const allReviews = reviewsResult.data || [];
        const avgRating = allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

        // Parse add-ons safely
        let addOns: { id: string; name: string; price: number }[] = [];
        if (pkg.add_ons) {
          if (Array.isArray(pkg.add_ons)) {
            addOns = (pkg.add_ons as any[]).map((a, i) => ({
              id: String(a?.id || `addon-${i}`),
              name: String(a?.name || ''),
              price: Number(a?.price || 0)
            }));
          } else if (typeof pkg.add_ons === 'string') {
            try {
              const parsed = JSON.parse(pkg.add_ons);
              addOns = Array.isArray(parsed)
                ? parsed.map((a: any, i: number) => ({
                    id: String(a?.id || `addon-${i}`),
                    name: String(a?.name || ''),
                    price: Number(a?.price || 0)
                  }))
                : [];
            } catch (e) {
              addOns = [];
            }
          }
        }

        // Parse menu_items
        let menuItems: MenuItem[] = [];
        const rawMenu = (pkg as any).menu_items;
        if (Array.isArray(rawMenu)) {
          menuItems = rawMenu.map((m: any, i: number) => ({
            id: String(m?.id || `menu-${i}`),
            name: String(m?.name || ''),
            description: m?.description ?? null,
            price: Number(m?.price || 0),
            category: m?.category ?? null,
            min_quantity: m?.min_quantity ?? null,
            max_quantity: m?.max_quantity ?? null,
          }));
        }

        // Variations
        const variations: PackageVariation[] = (variationsResult.data as any[] | null || []).map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          price: Number(v.price || 0),
          min_guests: v.min_guests,
          max_guests: v.max_guests,
          duration_minutes: v.duration_minutes,
          includes: v.includes || [],
          is_default: !!v.is_default,
          sort_order: v.sort_order ?? 0,
        }));

        // Fulfillment options
        const fulfillmentOptions: string[] = Array.isArray((pkg as any).fulfillment_options)
          ? (pkg as any).fulfillment_options
          : [];
        const fulfillmentPricingRaw = (pkg as any).fulfillment_pricing;
        const fulfillmentPricing: Record<string, number> =
          fulfillmentPricingRaw && typeof fulfillmentPricingRaw === 'object' && !Array.isArray(fulfillmentPricingRaw)
            ? Object.fromEntries(
                Object.entries(fulfillmentPricingRaw).map(([k, v]) => [k, Number(v) || 0])
              )
            : {};

        const customerQuestions: string[] = Array.isArray((pkg as any).customer_questions)
          ? (pkg as any).customer_questions.filter((q: any) => typeof q === 'string' && q.trim())
          : [];

        setPackageData({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          category: pkg.category,
          type: pkg.type,
          pricing_type: pkg.pricing_type,
          price: Number(pkg.price),
          starting_at: pkg.starting_at ? Number(pkg.starting_at) : null,
          min_units: pkg.min_units,
          min_hours: pkg.min_hours,
          min_guests: pkg.min_guests,
          min_days: (pkg as any).min_days || null,
          duration_minutes: pkg.duration_minutes,
          setup_time_minutes: pkg.setup_time_minutes,
          breakdown_time_minutes: pkg.breakdown_time_minutes,
          travel_radius: pkg.travel_radius,
          travel_fee_per_mile: pkg.travel_fee_per_mile ? Number(pkg.travel_fee_per_mile) : null,
          price_per_mile: pkg.price_per_mile ? Number(pkg.price_per_mile) : null,
          included_travel_miles: pkg.included_travel_miles,
          pickup_only: pkg.pickup_only,
          includes: pkg.includes || [],
          add_ons: addOns,
          requirements: pkg.requirements || [],
          images: pkg.images || [],
          cover_image_url: pkg.cover_image_url,
          instant_book: pkg.instant_book ?? false,
          is_active: pkg.is_active ?? true,
          booking_mode: (pkg.booking_mode as 'INSTANT' | 'REQUEST') || 'INSTANT',
          payment_options: (pkg.payment_options as 'ONLINE' | 'CASH' | 'BOTH') || 'ONLINE',
          cancellation_policy: pkg.cancellation_policy,
          customer_requirements: pkg.customer_requirements,
          deposit: (pkg as any).deposit_percentage != null
            ? Number((pkg as any).deposit_percentage)
            : (pkg.deposit != null ? Number(pkg.deposit) : null),
          default_start_time: (pkg as any).default_start_time || null,
          package_kind: (pkg as any).package_kind || null,
          variations,
          fulfillment_options: fulfillmentOptions,
          fulfillment_pricing: fulfillmentPricing,
          menu_items: menuItems,
          customer_questions: customerQuestions,
          // Event Pro info
          vendor_user_id: pkg.user_id,
          vendor_name: detailsResult.data.business_name || 'Unknown Event Pro',
          vendor_avatar: profileResult.data.avatar_url,
          vendor_display_name: profileResult.data.display_name,
          vendor_short_bio: profileResult.data.short_bio,
          vendor_location: detailsResult.data.city && detailsResult.data.state
            ? `${detailsResult.data.city}, ${detailsResult.data.state}`
            : detailsResult.data.service_area,
          vendor_categories: detailsResult.data.service_categories || [],
          vendor_stripe_status: profileResult.data.stripe_account_status,
          vendor_base_lat: detailsResult.data.base_location_lat ? Number(detailsResult.data.base_location_lat) : null,
          vendor_base_lng: detailsResult.data.base_location_lng ? Number(detailsResult.data.base_location_lng) : null,
          vendor_travel_radius: detailsResult.data.travel_radius_miles,
          is_verified: profileResult.data.stripe_account_status === 'active',
          avg_rating: avgRating,
          review_count: allReviews.length
        });

        setReviews(allReviews);
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    }

    fetchPackageData();
  }, [packageId]);

  return { packageData, reviews, loading, error };
}
