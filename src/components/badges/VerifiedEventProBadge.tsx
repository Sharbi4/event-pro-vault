import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedEventProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * "Verified Event Pro" trust badge.
 * Shown when a Event Pro has completed optional Stripe Identity verification.
 * Used on browse cards (sm), profile headers (md/lg), and Event Pro dashboards.
 */
export function VerifiedEventProBadge({
  size = 'sm',
  showLabel = true,
  className,
}: VerifiedEventProBadgeProps) {
  const iconSize =
    size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const textSize =
    size === 'lg' ? 'text-xs' : size === 'md' ? 'text-[11px]' : 'text-[10px]';
  const label =
    size === 'lg' ? 'Verified Event Pro' : showLabel ? 'Verified' : null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="verified"
            className={cn('gap-1 shrink-0', textSize, className)}
          >
            <ShieldCheck className={iconSize} />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[220px]">
            This Event Pro completed optional identity verification through
            EventPro.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
