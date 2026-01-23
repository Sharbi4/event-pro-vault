import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserDashboards {
  hasVendorPackages: boolean;
  loading: boolean;
}

export function useUserDashboards(): UserDashboards {
  const { user } = useAuth();
  const [hasVendorPackages, setHasVendorPackages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkDashboards = async () => {
      try {
        const packagesRes = await supabase
          .from('vendor_packages')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        setHasVendorPackages((packagesRes.data?.length || 0) > 0);
      } catch (error) {
        console.error('Error checking dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    checkDashboards();
  }, [user]);

  return { hasVendorPackages, loading };
}
