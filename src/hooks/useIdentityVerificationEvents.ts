import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface IdentityVerificationEvent {
  id: string;
  user_id: string;
  session_id: string | null;
  status: string;
  stripe_event_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Fetches the identity verification timeline for the current user.
 * Subscribes to realtime inserts so the UI updates as Stripe webhooks
 * append new events (processing → requires_input → verified, etc.).
 */
export function useIdentityVerificationEvents() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['identity-verification-events', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verification_events')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as IdentityVerificationEvent[];
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`identity-events-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'identity_verification_events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          query.refetch();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return query;
}
