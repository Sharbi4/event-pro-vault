import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: 'free' | 'premium';
  packageLimit: number;
  subscriptionEnd?: string;
  isFeatured: boolean;
}

export function useProSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: 'free',
    packageLimit: 5,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({ subscribed: false, tier: 'free', packageLimit: 5, isFeatured: false });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-pro-subscription');
      
      if (error) throw error;

      setStatus({
        subscribed: data.subscribed,
        tier: data.tier,
        packageLimit: data.package_limit,
        subscriptionEnd: data.subscription_end,
        isFeatured: data.is_featured || false,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      // Default to free tier on error
      setStatus({ subscribed: false, tier: 'free', packageLimit: 5, isFeatured: false });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription status periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000); // Every minute
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const startCheckout = async () => {
    if (!user) return;
    
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-pro-premium-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error starting checkout:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    ...status,
    loading,
    checkoutLoading,
    startCheckout,
    refreshStatus: checkSubscription,
  };
}
