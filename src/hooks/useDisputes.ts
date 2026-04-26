import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Dispute {
  id: string;
  booking_id: string;
  reported_by_user_id: string;
  vendor_user_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'vendor_response' | 'mediation' | 'resolved' | 'closed' | 'withdrawn';
  filed_by_type: 'customer' | 'Event Pro';
  evidence_urls: string[];
  requested_remedy: 'full_refund' | 'partial_refund' | 'credit' | 'reschedule' | 'other' | null;
  requested_remedy_details: string | null;
  vendor_response: string | null;
  vendor_response_deadline: string | null;
  vendor_responded_at: string | null;
  vendor_proposed_remedy: string | null;
  mediation_started_at: string | null;
  resolution_deadline: string | null;
  resolution_outcome: 'full_refund' | 'partial_refund' | 'vendor_paid' | 'credit' | 'reschedule' | 'denied' | 'withdrawn' | null;
  resolution_notes: string | null;
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  deposit_refund_ordered: boolean;
  payout_held: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  booking?: {
    event_date: string;
    event_location: string;
    total_price: number;
    package_id: string;
    customer_email?: string;
    start_time?: string;
    end_time?: string;
  };
  reporter_profile?: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
  vendor_profile?: {
    display_name: string;
    email: string;
    business_name?: string;
  };
}

export function useDisputes(role: 'customer' | 'Event Pro' | 'admin') {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('disputes')
        .select(`
          *,
          booking:bookings(event_date, event_location, total_price, package_id, customer_email, start_time, end_time)
        `)
        .order('created_at', { ascending: false });

      // Filter based on role
      if (role === 'customer') {
        query = query.eq('reported_by_user_id', user.id);
      } else if (role === 'Event Pro') {
        query = query.eq('vendor_user_id', user.id);
      }
      // Admin sees all (no filter)

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles for reporters and Event Pros
      if (data && data.length > 0) {
        const reporterIds = [...new Set(data.map(d => d.reported_by_user_id))];
        const vendorIds = [...new Set(data.map(d => d.vendor_user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email, avatar_url')
          .in('user_id', [...reporterIds, ...vendorIds]);

        const { data: vendorDetails } = await supabase
          .from('vendor_details')
          .select('user_id, business_name')
          .in('user_id', vendorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        const vendorDetailMap = new Map(vendorDetails?.map(v => [v.user_id, v]));

        const enrichedDisputes = data.map(d => ({
          ...d,
          reporter_profile: profileMap.get(d.reported_by_user_id),
          vendor_profile: {
            ...profileMap.get(d.vendor_user_id),
            business_name: vendorDetailMap.get(d.vendor_user_id)?.business_name,
          },
        }));

        setDisputes(enrichedDisputes as Dispute[]);
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: 'Error loading disputes',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, role, toast]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('disputes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disputes' },
        () => {
          fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDisputes]);

  // Event Pro responds to dispute
  const respondToDispute = async (
    disputeId: string,
    response: string,
    proposedRemedy?: string,
    accept?: boolean
  ) => {
    setProcessingId(disputeId);
    try {
      const updateData: Record<string, unknown> = {
        vendor_response: response,
        vendor_responded_at: new Date().toISOString(),
      };

      if (proposedRemedy) {
        updateData.vendor_proposed_remedy = proposedRemedy;
      }

      if (accept) {
        // Event Pro accepts the customer's requested remedy
        updateData.status = 'resolved';
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_outcome = disputes.find(d => d.id === disputeId)?.requested_remedy || 'full_refund';
      } else {
        // Move to mediation if Event Pro disagrees
        updateData.status = 'mediation';
        updateData.mediation_started_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: accept ? 'Remedy accepted' : 'Response submitted',
        description: accept 
          ? 'The dispute has been resolved.'
          : 'Your response has been submitted for mediation.',
      });

      fetchDisputes();
    } catch (error) {
      console.error('Error responding to dispute:', error);
      toast({
        title: 'Error submitting response',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Admin resolves dispute
  const resolveDispute = async (
    disputeId: string,
    outcome: Dispute['resolution_outcome'],
    notes: string,
    depositRefundOrdered: boolean = false
  ) => {
    if (!user) return;
    
    setProcessingId(disputeId);
    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution_outcome: outcome,
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          deposit_refund_ordered: depositRefundOrdered,
          payout_held: outcome !== 'vendor_paid',
        })
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: 'Dispute resolved',
        description: `Outcome: ${outcome?.replace('_', ' ')}`,
      });

      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: 'Error resolving dispute',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Customer withdraws dispute
  const withdrawDispute = async (disputeId: string) => {
    setProcessingId(disputeId);
    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'withdrawn',
          resolution_outcome: 'withdrawn',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: 'Dispute withdrawn',
        description: 'Your dispute has been withdrawn.',
      });

      fetchDisputes();
    } catch (error) {
      console.error('Error withdrawing dispute:', error);
      toast({
        title: 'Error withdrawing dispute',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return {
    disputes,
    loading,
    processingId,
    refetch: fetchDisputes,
    respondToDispute,
    resolveDispute,
    withdrawDispute,
  };
}
