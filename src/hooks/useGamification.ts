import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VendorPoints {
  vendor_user_id: string;
  total_points: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  current_streak_days: number;
  longest_streak_days: number;
  multiplier: number;
}

export interface VendorChallenge {
  id: string;
  challenge_key: string;
  title: string;
  description: string | null;
  goal: number;
  progress: number;
  reward_points: number;
  ends_at: string;
  completed_at: string | null;
}

export interface VendorAchievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
}

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 200,
  gold: 500,
  platinum: 1000,
} as const;

export const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze Pro',
  silver: 'Silver Pro',
  gold: 'Gold Pro',
  platinum: 'Platinum Pro',
};

function endOfWeek(): string {
  const d = new Date();
  const dow = d.getDay();
  const daysUntilSun = (7 - dow) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSun);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const DEFAULT_CHALLENGES = [
  {
    challenge_key: 'share_3_packages_week',
    title: 'Share 3 packages this week',
    description: 'Share any of your packages 3 times to earn bonus points.',
    goal: 3,
    reward_points: 50,
  },
  {
    challenge_key: 'first_referral_signup',
    title: 'Refer a new customer',
    description: 'Get one signup from your share link.',
    goal: 1,
    reward_points: 100,
  },
  {
    challenge_key: 'first_referral_booking',
    title: 'Land a referral booking',
    description: 'Convert a share into a confirmed booking.',
    goal: 1,
    reward_points: 250,
  },
];

export function useGamification() {
  const { user } = useAuth();
  const [points, setPoints] = useState<VendorPoints | null>(null);
  const [challenges, setChallenges] = useState<VendorChallenge[]>([]);
  const [achievements, setAchievements] = useState<VendorAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ vendor_user_id: string; total_points: number; tier: string; full_name: string | null; avatar_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  const seedChallengesIfNeeded = useCallback(async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('vendor_challenges')
      .select('challenge_key')
      .eq('vendor_user_id', user.id)
      .gt('ends_at', new Date().toISOString());

    const existingKeys = new Set((existing ?? []).map((c) => c.challenge_key));
    const missing = DEFAULT_CHALLENGES.filter((c) => !existingKeys.has(c.challenge_key));
    if (missing.length === 0) return;

    await supabase.from('vendor_challenges').insert(
      missing.map((c) => ({
        vendor_user_id: user.id,
        challenge_key: c.challenge_key,
        title: c.title,
        description: c.description,
        goal: c.goal,
        reward_points: c.reward_points,
        ends_at: endOfWeek(),
      }))
    );
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await seedChallengesIfNeeded();

      const [pts, ch, ach, lb] = await Promise.all([
        supabase.from('vendor_points').select('*').eq('vendor_user_id', user.id).maybeSingle(),
        supabase
          .from('vendor_challenges')
          .select('*')
          .eq('vendor_user_id', user.id)
          .gt('ends_at', new Date().toISOString())
          .order('ends_at', { ascending: true }),
        supabase
          .from('vendor_achievements')
          .select('*')
          .eq('vendor_user_id', user.id)
          .order('unlocked_at', { ascending: false }),
        supabase
          .from('vendor_points')
          .select('vendor_user_id, total_points, tier')
          .order('total_points', { ascending: false })
          .limit(10),
      ]);

      if (pts.data) setPoints(pts.data as VendorPoints);
      else
        setPoints({
          vendor_user_id: user.id,
          total_points: 0,
          lifetime_points: 0,
          tier: 'bronze',
          current_streak_days: 0,
          longest_streak_days: 0,
          multiplier: 1,
        });
      setChallenges((ch.data as VendorChallenge[]) ?? []);
      setAchievements((ach.data as VendorAchievement[]) ?? []);

      // Hydrate leaderboard names
      const ids = (lb.data ?? []).map((r) => r.vendor_user_id);
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', ids);
        const profMap = new Map((profs ?? []).map((p) => [p.user_id, p]));
        setLeaderboard(
          (lb.data ?? []).map((r) => ({
            ...r,
            full_name: profMap.get(r.vendor_user_id)?.full_name ?? null,
            avatar_url: profMap.get(r.vendor_user_id)?.avatar_url ?? null,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, seedChallengesIfNeeded]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { points, challenges, achievements, leaderboard, loading, refresh };
}
