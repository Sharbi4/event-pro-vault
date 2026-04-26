import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!code) {
        navigate('/');
        return;
      }
      try {
        // Persist for downstream attribution (signup, booking)
        sessionStorage.setItem('share_ref_code', code);
        localStorage.setItem('share_ref_code', code);

        // Look up the share link
        const { data: link } = await supabase
          .from('share_links')
          .select('id, vendor_user_id, package_id')
          .eq('code', code)
          .eq('is_active', true)
          .maybeSingle();

        if (link) {
          // Track click
          await supabase.from('share_events').insert({
            share_link_id: link.id,
            vendor_user_id: link.vendor_user_id,
            event_type: 'click',
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
          });
          await supabase
            .from('share_links')
            .update({ click_count: undefined })
            .eq('id', link.id);
          // Increment via RPC-like fetch (best-effort, fail-open)
          await supabase.rpc as any;
          // Use simple read-then-write
          const { data: cur } = await supabase
            .from('share_links')
            .select('click_count')
            .eq('id', link.id)
            .single();
          if (cur) {
            await supabase
              .from('share_links')
              .update({ click_count: (cur.click_count ?? 0) + 1 })
              .eq('id', link.id);
          }

          const pkgId = params.get('p') || link.package_id;
          if (pkgId) {
            navigate(`/package/${pkgId}`, { replace: true });
            return;
          }
          // Vendor-level link → open their pro profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', link.vendor_user_id)
            .maybeSingle();
          if (prof?.username) {
            navigate(`/eventpro/${prof.username}`, { replace: true });
            return;
          }
          navigate(`/pro/${link.vendor_user_id}`, { replace: true });
          return;
        }
      } catch (err) {
        console.error('Referral redirect error', err);
      }
      navigate('/', { replace: true });
    };
    run();
  }, [code, navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading your referral…</p>
      </div>
    </div>
  );
}
