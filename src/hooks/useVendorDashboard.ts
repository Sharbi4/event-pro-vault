import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AdditionalFee {
  id: string;
  name: string;
  amount: number;
}

export interface VendorPackage {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: 'HOURLY' | 'DAILY';
  pricing_type: string | null;
  price: number;
  starting_at: number | null;
  min_units: number;
  min_hours: number | null;
  min_guests: number | null;
  min_quantity: number | null;
  min_spend: number | null;
  overtime_rate: number | null;
  deposit: number | null;
  additional_fees: AdditionalFee[] | null;
  includes: string[];
  add_ons: { id: string; name: string; price: number }[];
  requirements: string[];
  instant_book: boolean;
  is_active: boolean;
  sort_order: number;
  category: string | null;
  images: string[];
  travel_radius: number;
  travel_fee_per_mile: number;
  max_travel_miles: number | null;
  included_miles: number | null;
  fee_per_mile: number | null;
  pickup_only: boolean | null;
  cancellation_policy: string;
  created_at: string;
  updated_at: string;
}

export interface VendorBooking {
  id: string;
  user_id: string;
  vendor_user_id: string | null;
  vendor_id: string;
  package_id: string;
  event_date: string;
  event_location: string;
  units: number;
  add_ons: string[];
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  display_name: string | null;
  short_bio: string | null;
  is_vendor: boolean | null;
  is_published: boolean | null;
  stripe_account_status: string | null;
}

export interface VendorDetails {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  business_description: string | null;
  service_categories: string[] | null;
  service_area: string | null;
  website_url: string | null;
}

export function useVendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [user]);

  const fetchVendorData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Fetch all data in parallel
    const [packagesRes, bookingsRes, profileRes, detailsRes] = await Promise.all([
      supabase
        .from('vendor_packages')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('bookings')
        .select('*')
        .eq('vendor_user_id', user.id)
        .order('event_date', { ascending: true }),
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('vendor_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    if (packagesRes.data) setPackages(packagesRes.data as unknown as VendorPackage[]);
    if (bookingsRes.data) setBookings(bookingsRes.data as VendorBooking[]);
    if (profileRes.data) setProfile(profileRes.data as VendorProfile);
    if (detailsRes.data) setVendorDetails(detailsRes.data as VendorDetails);
    
    setLoading(false);
  };

  const createPackage = async (packageData: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> => {
    if (!user) return null;

    // Check max 20 packages limit
    if (packages.length >= 20) {
      toast({
        title: "Package limit reached",
        description: "You can have a maximum of 20 packages",
        variant: "destructive"
      });
      return null;
    }

    // Serialize JSON fields for Supabase
    const { add_ons, additional_fees, ...rest } = packageData;
    const insertData = {
      ...rest,
      user_id: user.id,
      add_ons: add_ons ? JSON.parse(JSON.stringify(add_ons)) : [],
      additional_fees: additional_fees ? JSON.parse(JSON.stringify(additional_fees)) : [],
      sort_order: packages.length
    };

    const { data, error } = await supabase
      .from('vendor_packages')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create package",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Package created!",
      description: "Your new listing is now live"
    });

    setPackages(prev => [...prev, data as unknown as VendorPackage]);
    return { id: data.id };
  };

  const updatePackage = async (id: string, updates: Partial<VendorPackage>) => {
    // Serialize JSON fields for Supabase
    const { add_ons, additional_fees, ...rest } = updates;
    const updateData: Record<string, any> = { ...rest };
    if (add_ons !== undefined) {
      updateData.add_ons = JSON.parse(JSON.stringify(add_ons));
    }
    if (additional_fees !== undefined) {
      updateData.additional_fees = JSON.parse(JSON.stringify(additional_fees));
    }

    const { data, error } = await supabase
      .from('vendor_packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to update package",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Package updated!",
    });

    setPackages(prev => prev.map(p => p.id === id ? (data as unknown as VendorPackage) : p));
    return data;
  };

  const deletePackage = async (id: string) => {
    const { error } = await supabase
      .from('vendor_packages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Failed to delete package",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Package deleted",
    });

    setPackages(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const duplicatePackage = async (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return null;

    const { id: _, user_id, created_at, updated_at, ...rest } = pkg;
    return createPackage({
      ...rest,
      name: `${pkg.name} (Copy)`,
      sort_order: packages.length
    });
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to update booking",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: `Booking ${status}`,
    });

    setBookings(prev => prev.map(b => b.id === bookingId ? (data as VendorBooking) : b));
    return data;
  };

  // Calculate earnings
  const totalEarnings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  const pendingEarnings = bookings
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + b.total_price, 0);

  const upcomingBookings = bookings.filter(b => 
    new Date(b.event_date) >= new Date() && 
    (b.status === 'confirmed' || b.status === 'pending')
  );

  const reorderPackages = async (reorderedPackages: VendorPackage[]) => {
    // Update local state immediately for responsive UI
    setPackages(reorderedPackages);

    // Update sort_order in database
    const updates = reorderedPackages.map((pkg, index) => ({
      id: pkg.id,
      sort_order: index
    }));

    // Update each package's sort_order
    const results = await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase
          .from('vendor_packages')
          .update({ sort_order })
          .eq('id', id)
      )
    );

    const hasError = results.some(r => r.error);
    if (hasError) {
      toast({
        title: "Failed to save order",
        description: "Please try again",
        variant: "destructive"
      });
      // Refetch to restore correct order
      fetchVendorData();
    }
  };

  return {
    packages,
    bookings,
    profile,
    vendorDetails,
    loading,
    totalEarnings,
    pendingEarnings,
    upcomingBookings,
    createPackage,
    updatePackage,
    deletePackage,
    duplicatePackage,
    reorderPackages,
    updateBookingStatus,
    refetch: fetchVendorData
  };
}
