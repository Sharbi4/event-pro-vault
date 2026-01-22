import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

export interface PendingEventPro {
  id: string;
  userId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  shortBio: string | null;
  primaryCity: string | null;
  instagramHandle: string | null;
  phone: string | null;
  createdAt: string;
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  stripeAccountStatus: string | null;
  // Vendor details
  businessName: string | null;
  businessDescription: string | null;
  serviceCategories: string[];
  formattedAddress: string | null;
}

export interface PendingMarket {
  id: string;
  userId: string;
  name: string;
  marketType: string;
  description: string | null;
  formattedAddress: string | null;
  city: string | null;
  state: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  isPublished: boolean;
  stripeAccountStatus: string | null;
}

export function useAdminReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingEventPros, setPendingEventPros] = useState<PendingEventPro[]>([]);
  const [pendingMarkets, setPendingMarkets] = useState<PendingMarket[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_my_roles');
      
      if (error) {
        console.error('Error checking roles:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.includes('admin') || false);
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [user]);

  // Fetch pending event pros
  const fetchPendingEventPros = useCallback(async () => {
    if (!isAdmin) return;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_vendor', true)
      .in('approval_status', ['pending', 'needs_changes'])
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching pending event pros:', profilesError);
      return;
    }

    // Fetch vendor details for each profile
    const userIds = profiles?.map(p => p.user_id) || [];
    const { data: vendorDetails } = await supabase
      .from('vendor_details')
      .select('*')
      .in('user_id', userIds);

    const vendorDetailsMap = new Map(vendorDetails?.map(v => [v.user_id, v]) || []);

    const mapped: PendingEventPro[] = (profiles || []).map(p => {
      const details = vendorDetailsMap.get(p.user_id);
      return {
        id: p.id,
        userId: p.user_id,
        displayName: p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        avatarUrl: p.avatar_url,
        shortBio: p.short_bio,
        primaryCity: p.primary_city,
        instagramHandle: p.instagram_handle,
        phone: p.phone,
        createdAt: p.created_at,
        approvalStatus: p.approval_status as ApprovalStatus,
        approvalNotes: p.approval_notes,
        stripeAccountStatus: p.stripe_account_status,
        businessName: details?.business_name || null,
        businessDescription: details?.business_description || null,
        serviceCategories: details?.service_categories || [],
        formattedAddress: details?.formatted_address || null,
      };
    });

    setPendingEventPros(mapped);
  }, [isAdmin]);

  // Fetch pending markets
  const fetchPendingMarkets = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .in('approval_status', ['pending', 'needs_changes'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending markets:', error);
      return;
    }

    const mapped: PendingMarket[] = (data || []).map(m => ({
      id: m.id,
      userId: m.user_id,
      name: m.name,
      marketType: m.market_type,
      description: m.description,
      formattedAddress: m.formatted_address,
      city: m.city,
      state: m.state,
      coverImageUrl: m.cover_image_url,
      createdAt: m.created_at,
      approvalStatus: m.approval_status as ApprovalStatus,
      approvalNotes: m.approval_notes,
      isPublished: m.is_published || false,
      stripeAccountStatus: m.stripe_account_status,
    }));

    setPendingMarkets(mapped);
  }, [isAdmin]);

  // Initial fetch
  useEffect(() => {
    if (isAdmin) {
      fetchPendingEventPros();
      fetchPendingMarkets();
    }
  }, [isAdmin, fetchPendingEventPros, fetchPendingMarkets]);

  // Approve event pro
  const approveEventPro = async (profileId: string) => {
    setProcessingId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: null,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({ title: 'Event Pro approved', description: 'The profile is now visible to the public.' });
      fetchPendingEventPros();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // Reject event pro (hard reject)
  const rejectEventPro = async (profileId: string, notes: string) => {
    setProcessingId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'rejected',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: notes,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({ title: 'Event Pro rejected', description: 'The profile has been rejected.' });
      fetchPendingEventPros();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // Request changes for event pro (soft reject)
  const requestChangesEventPro = async (profileId: string, notes: string) => {
    setProcessingId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'needs_changes',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: notes,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({ title: 'Changes requested', description: 'The provider will be notified to make changes.' });
      fetchPendingEventPros();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // Approve market
  const approveMarket = async (marketId: string) => {
    setProcessingId(marketId);
    try {
      const { error } = await supabase
        .from('markets')
        .update({
          approval_status: 'approved',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: null,
        })
        .eq('id', marketId);

      if (error) throw error;

      toast({ title: 'Market approved', description: 'The market is now visible to the public.' });
      fetchPendingMarkets();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // Reject market (hard reject)
  const rejectMarket = async (marketId: string, notes: string) => {
    setProcessingId(marketId);
    try {
      const { error } = await supabase
        .from('markets')
        .update({
          approval_status: 'rejected',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: notes,
        })
        .eq('id', marketId);

      if (error) throw error;

      toast({ title: 'Market rejected', description: 'The market has been rejected.' });
      fetchPendingMarkets();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  // Request changes for market (soft reject)
  const requestChangesMarket = async (marketId: string, notes: string) => {
    setProcessingId(marketId);
    try {
      const { error } = await supabase
        .from('markets')
        .update({
          approval_status: 'needs_changes',
          approval_reviewed_at: new Date().toISOString(),
          approval_reviewed_by: user?.id,
          approval_notes: notes,
        })
        .eq('id', marketId);

      if (error) throw error;

      toast({ title: 'Changes requested', description: 'The market manager will be notified to make changes.' });
      fetchPendingMarkets();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  return {
    isAdmin,
    loading,
    pendingEventPros,
    pendingMarkets,
    processingId,
    approveEventPro,
    rejectEventPro,
    requestChangesEventPro,
    approveMarket,
    rejectMarket,
    requestChangesMarket,
    refetch: () => {
      fetchPendingEventPros();
      fetchPendingMarkets();
    },
  };
}
