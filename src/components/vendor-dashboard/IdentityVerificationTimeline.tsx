import { format } from 'date-fns';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  CircleDashed,
} from 'lucide-react';
import { useIdentityVerificationEvents } from '@/hooks/useIdentityVerificationEvents';
import { cn } from '@/lib/utils';

type StatusKey =
  | 'processing'
  | 'requires_input'
  | 'verified'
  | 'canceled'
  | 'started'
  | 'pending'
  | string;

const STATUS_META: Record<
  string,
  { label: string; icon: typeof Clock; tone: string; bg: string; ring: string }
> = {
  processing: {
    label: 'Processing',
    icon: Loader2,
    tone: 'text-primary',
    bg: 'bg-primary/10',
    ring: 'ring-primary/20',
  },
  requires_input: {
    label: 'Action needed',
    icon: AlertCircle,
    tone: 'text-amber-600',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    tone: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  canceled: {
    label: 'Canceled',
    icon: XCircle,
    tone: 'text-destructive',
    bg: 'bg-destructive/10',
    ring: 'ring-destructive/20',
  },
  started: {
    label: 'Started',
    icon: Clock,
    tone: 'text-muted-foreground',
    bg: 'bg-muted',
    ring: 'ring-border',
  },
};

const FALLBACK_META = {
  label: 'Update',
  icon: CircleDashed,
  tone: 'text-muted-foreground',
  bg: 'bg-muted',
  ring: 'ring-border',
};

function getStatusMeta(status: StatusKey) {
  return STATUS_META[status] ?? FALLBACK_META;
}

function statusDescription(status: StatusKey): string {
  switch (status) {
    case 'processing':
      return 'Stripe is reviewing your documents. This usually takes a few minutes.';
    case 'requires_input':
      return "We need more info to finish verifying. Open the link to retry.";
    case 'verified':
      return 'Your identity is verified. The Verified Event Pro badge is now live on your profile.';
    case 'canceled':
      return 'Verification was canceled. You can start again anytime.';
    case 'started':
      return 'Verification session created.';
    default:
      return `Status updated to "${status}".`;
  }
}

/**
 * Identity Verification Timeline
 * Displays a vertical timeline of webhook-driven status changes
 * (processing, requires input, verified, canceled).
 */
export function IdentityVerificationTimeline() {
  const { data: events, isLoading } = useIdentityVerificationEvents();

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="font-semibold mb-1">Verification timeline</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading history…
        </p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="font-semibold mb-1">Verification timeline</h3>
        <p className="text-sm text-muted-foreground">
          No verification activity yet. Once you start verification, status
          updates from Stripe will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Verification timeline</h3>
        <span className="text-xs text-muted-foreground">
          Live updates from Stripe
        </span>
      </div>

      <ol className="relative border-l border-border ml-3 space-y-5">
        {events.map((evt, idx) => {
          const meta = getStatusMeta(evt.status);
          const Icon = meta.icon;
          const isLatest = idx === 0;
          return (
            <li key={evt.id} className="ml-5">
              <span
                className={cn(
                  'absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-background',
                  meta.bg,
                )}
                aria-hidden="true"
              >
                <Icon
                  className={cn(
                    'w-3.5 h-3.5',
                    meta.tone,
                    evt.status === 'processing' && 'animate-spin',
                  )}
                />
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h4 className={cn('text-sm font-medium', meta.tone)}>
                  {meta.label}
                </h4>
                {isLatest && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-primary">
                    Current
                  </span>
                )}
                <time className="text-xs text-muted-foreground">
                  {format(new Date(evt.created_at), 'MMM d, yyyy · h:mm a')}
                </time>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {statusDescription(evt.status)}
              </p>
              {evt.session_id && (
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono truncate">
                  session: {evt.session_id}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
