import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthIntent } from '@/hooks/useAuthIntent';
import { supabase } from '@/integrations/supabase/client';
import { clearAuthIntent, getBookingDraft, clearBookingDraft } from '@/lib/authIntent';
import { Loader2 } from 'lucide-react';

export default function PostAuth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { intent, clearIntent } = useAuthIntent();
  const [isRouting, setIsRouting] = useState(true);

  useEffect(() => {
    const routeUser = async () => {
      // Wait for auth to settle
      if (authLoading) return;

      // If no user, redirect to auth
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check user's existing profiles/markets
      const [profileResult, vendorResult, marketResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, is_vendor, is_published, onboarding_completed_at')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('vendor_details')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('markets')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      const hasEventProProfile = !!vendorResult.data;
      const hasMarket = !!marketResult.data;

      // Route based on intent
      if (intent) {
        switch (intent.intent) {
          case 'EVENT_PRO_ONBOARDING':
            if (!hasEventProProfile) {
              clearIntent();
              navigate('/eventpro-onboarding');
            } else {
              clearIntent();
              navigate('/vendor-dashboard');
            }
            return;

          case 'MARKET_ONBOARDING':
            if (!hasMarket) {
              clearIntent();
              navigate('/marketspace/create');
            } else {
              clearIntent();
              navigate('/marketspace-dashboard');
            }
            return;

          case 'BOOK_PACKAGE':
            if (intent.payload?.packageId) {
              const draftId = intent.payload.draftId;
              let url = `/package/${intent.payload.packageId}?resumeBooking=1`;
              if (draftId) {
                url += `&draftId=${draftId}`;
              }
              clearIntent();
              navigate(url);
              return;
            }
            break;

          case 'BOOK_SLOT':
            if (intent.payload?.marketId) {
              const draftId = intent.payload.draftId;
              let url = `/market/${intent.payload.marketId}?reserve=1`;
              if (draftId) {
                url += `&draftId=${draftId}`;
              }
              clearIntent();
              navigate(url);
              return;
            }
            break;

          case 'GENERAL':
            if (intent.returnTo) {
              clearIntent();
              navigate(intent.returnTo);
              return;
            }
            break;

          case 'DASHBOARD':
          default:
            break;
        }

        // Handle returnTo fallback
        if (intent.returnTo) {
          clearIntent();
          navigate(intent.returnTo);
          return;
        }

        // Handle profileType without specific intent
        if (intent.profileType) {
          if (intent.profileType === 'EVENT_PRO') {
            clearIntent();
            if (!hasEventProProfile) {
              navigate('/eventpro-onboarding');
            } else {
              navigate('/vendor-dashboard?onboarding=1');
            }
            return;
          } else if (intent.profileType === 'MARKET_SPACE') {
            clearIntent();
            if (!hasMarket) {
              navigate('/marketspace/create');
            } else {
              navigate('/marketspace-dashboard?onboarding=1');
            }
            return;
          }
        }
      }

      // Default routing: go to browse page
      clearIntent();
      navigate('/');
    };

    routeUser();
  }, [user, authLoading, intent, navigate, clearIntent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
