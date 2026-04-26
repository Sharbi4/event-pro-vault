import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { prepareExternalNavigation } from '@/lib/externalNavigation';

interface VerificationCardProps {
  status?: string | null;
  onStatusChange?: () => void;
}

/**
 * Optional Stripe Identity verification card shown on the Vendor Settings tab.
 * Verification is NOT required to publish, get bookings, or receive payouts —
 * it only unlocks the "Verified Vendor" trust badge.
 */
export function VerificationCard({
  status = 'not_started',
  onStatusChange,
}: VerificationCardProps) {
  const [loading, setLoading] = useState(false);

  const startVerification = async () => {
    const nav = prepareExternalNavigation();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-identity-verification',
      );
      if (error) throw error;
      if (data?.fallback) {
        nav.cancel();
        toast.message(
          data.message ||
            "Identity verification isn't available for your account yet.",
        );
        return;
      }
      if (data?.url) {
        if (nav.popupBlocked) {
          await navigator.clipboard.writeText(data.url).catch(() => undefined);
          toast.error(
            'Pop-up blocked — link copied to clipboard. Paste it in a new tab.',
          );
        }
        nav.open(data.url);
        return;
      }
      nav.cancel();
    } catch (err) {
      nav.cancel();
      console.error('Failed to start identity verification', err);
      toast.error('Could not start verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('check-identity-verification');
      onStatusChange?.();
      toast.success('Status refreshed');
    } catch (err) {
      console.error('Failed to refresh status', err);
      toast.error('Could not refresh status');
    } finally {
      setLoading(false);
    }
  };

  // VERIFIED state
  if (status === 'verified') {
    return (
      <div className="p-6 rounded-lg border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">Verified Vendor</h3>
              <Badge variant="verified" className="text-[10px] gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your profile has the Verified badge. Customers can see this badge
              on your profile and search cards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PROCESSING state
  if (status === 'processing' || status === 'started') {
    return (
      <div className="p-6 rounded-lg border bg-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Verification in progress</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're reviewing your identity verification. This usually takes
              just a few minutes.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStatus}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Loader2 className="w-3.5 h-3.5" />
              )}
              Refresh status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // FAILED / REQUIRES_ACTION state
  if (status === 'failed' || status === 'requires_action') {
    return (
      <div className="p-6 rounded-lg border-2 border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Verification needs attention</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't complete your verification. Try again to unlock the
              Verified Vendor badge.
            </p>
            <Button
              onClick={startVerification}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // NOT_STARTED (default) state
  return (
    <div className="p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Get the Verified Vendor badge
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete optional identity verification to add a trust badge to your
            profile and help customers book with more confidence.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={startVerification}
              disabled={loading}
              variant="gradient"
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Get verified
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Verification is optional — you can publish, get bookings, and
            receive payouts without it.
          </p>
        </div>
      </div>
    </div>
  );
}
