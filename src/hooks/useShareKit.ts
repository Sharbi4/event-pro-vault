import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ShareLink {
  id: string;
  vendor_user_id: string;
  package_id: string | null;
  code: string;
  channel: string | null;
  is_active: boolean;
  click_count: number;
  signup_count: number;
  booking_count: number;
  points_earned: number;
  created_at: string;
}

function genCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function useShareKit(packageId?: string | null) {
  const { user } = useAuth();
  const [link, setLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureLink = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      // Find existing active link for this vendor + package
      const query = supabase
        .from('share_links')
        .select('*')
        .eq('vendor_user_id', user.id)
        .eq('is_active', true);

      const { data: existing } = packageId
        ? await query.eq('package_id', packageId).maybeSingle()
        : await query.is('package_id', null).maybeSingle();

      if (existing) {
        setLink(existing as ShareLink);
        return existing as ShareLink;
      }

      // Create one
      const { data: created, error } = await supabase
        .from('share_links')
        .insert({
          vendor_user_id: user.id,
          package_id: packageId ?? null,
          code: genCode(),
        })
        .select()
        .single();

      if (error) throw error;
      setLink(created as ShareLink);
      return created as ShareLink;
    } catch (err) {
      console.error('ensureLink error', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, packageId]);

  useEffect(() => {
    ensureLink();
  }, [ensureLink]);

  const buildShareUrl = useCallback(
    (code: string) => {
      if (packageId) {
        return `${window.location.origin}/r/${code}?p=${packageId}`;
      }
      return `${window.location.origin}/r/${code}`;
    },
    [packageId]
  );

  const trackShare = useCallback(
    async (channel: string) => {
      if (!link || !user) return;
      try {
        await supabase.from('share_events').insert({
          share_link_id: link.id,
          vendor_user_id: user.id,
          event_type: 'share',
          channel,
        });
        // Award points
        await supabase.from('vendor_point_events').insert({
          vendor_user_id: user.id,
          action: 'share',
          points: 5,
          description: `Shared via ${channel}`,
          related_id: link.id,
        });
        // Update vendor_points
        const { data: pts } = await supabase
          .from('vendor_points')
          .select('total_points, lifetime_points')
          .eq('vendor_user_id', user.id)
          .maybeSingle();

        const newTotal = (pts?.total_points ?? 0) + 5;
        const newLifetime = (pts?.lifetime_points ?? 0) + 5;
        const tier =
          newLifetime >= 1000 ? 'platinum' : newLifetime >= 500 ? 'gold' : newLifetime >= 200 ? 'silver' : 'bronze';

        await supabase.from('vendor_points').upsert(
          {
            vendor_user_id: user.id,
            total_points: newTotal,
            lifetime_points: newLifetime,
            tier,
            last_activity_at: new Date().toISOString(),
          },
          { onConflict: 'vendor_user_id' }
        );

        // Update share_links counters
        await supabase
          .from('share_links')
          .update({ points_earned: (link.points_earned ?? 0) + 5 })
          .eq('id', link.id);
      } catch (err) {
        console.error('trackShare error', err);
      }
    },
    [link, user]
  );

  return { link, loading, ensureLink, buildShareUrl, trackShare };
}
