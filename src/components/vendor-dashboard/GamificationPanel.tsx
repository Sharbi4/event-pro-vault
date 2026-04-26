import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flame, Sparkles, Crown, Medal, Target, Share2 } from 'lucide-react';
import { useGamification, TIER_LABELS, TIER_THRESHOLDS } from '@/hooks/useGamification';
import { useState } from 'react';
import { ShareKitDialog } from '@/components/share-kit/ShareKitDialog';

const tierColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-slate-400 to-slate-200',
  gold: 'from-yellow-500 to-amber-400',
  platinum: 'from-indigo-400 to-purple-300',
};

function nextTier(tier: string): { name: string; threshold: number } | null {
  const order: Array<keyof typeof TIER_THRESHOLDS> = ['bronze', 'silver', 'gold', 'platinum'];
  const idx = order.indexOf(tier as any);
  if (idx === -1 || idx === order.length - 1) return null;
  const next = order[idx + 1];
  return { name: next, threshold: TIER_THRESHOLDS[next] };
}

export function GamificationPanel() {
  const { points, challenges, achievements, leaderboard, loading } = useGamification();
  const [shareOpen, setShareOpen] = useState(false);

  if (loading || !points) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading rewards…</CardContent></Card>;
  }

  const nt = nextTier(points.tier);
  const progressToNext = nt
    ? Math.min(100, ((points.lifetime_points - TIER_THRESHOLDS[points.tier]) /
        (nt.threshold - TIER_THRESHOLDS[points.tier])) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="overflow-hidden">
        <div className={`relative bg-gradient-to-br ${tierColors[points.tier]} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wider opacity-90">Your tier</span>
              </div>
              <h2 className="text-3xl font-bold">{TIER_LABELS[points.tier]}</h2>
              <p className="text-sm opacity-90 mt-1">
                {points.total_points.toLocaleString()} points available
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Flame className="w-4 h-4" />
                {points.current_streak_days} day streak
              </div>
              <div className="text-xs opacity-80 mt-1">
                Best: {points.longest_streak_days}d
              </div>
            </div>
          </div>

          {nt && (
            <div className="mt-5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{points.lifetime_points} / {nt.threshold} pts</span>
                <span>Next: {TIER_LABELS[nt.name]}</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <Button onClick={() => setShareOpen(true)} className="w-full" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Open Share Kit & earn points
          </Button>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4" /> Active challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active challenges. Check back next week!</p>
          ) : (
            challenges.map((c) => {
              const pct = Math.min(100, (c.progress / c.goal) * 100);
              const done = !!c.completed_at;
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {c.title}
                        {done && <Badge variant="trust" className="text-[10px]">Done</Badge>}
                      </div>
                      {c.description && (
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">+{c.reward_points}</Badge>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="text-xs text-muted-foreground text-right">
                    {c.progress} / {c.goal}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Medal className="w-4 h-4" /> Badges unlocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No badges yet — share your first link to unlock <Badge variant="secondary">First Share</Badge>.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a) => (
                <div key={a.id} className="rounded-lg border border-border p-3 text-center">
                  <Sparkles className="w-6 h-6 mx-auto text-primary mb-1" />
                  <div className="font-semibold text-xs">{a.title}</div>
                  {a.description && (
                    <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{a.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4" /> Top Pros this season
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rankings yet. Be the first!</p>
          ) : (
            leaderboard.map((row, idx) => (
              <div key={row.vendor_user_id} className="flex items-center gap-3 py-2">
                <span className="w-5 text-sm font-bold text-muted-foreground">{idx + 1}</span>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={row.avatar_url ?? undefined} />
                  <AvatarFallback>{(row.full_name ?? '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">{row.full_name ?? 'Anonymous Pro'}</div>
                <Badge variant="outline" className="capitalize">{row.tier}</Badge>
                <span className="text-sm font-mono">{row.total_points}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ShareKitDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
