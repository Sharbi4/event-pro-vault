import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CancellationPolicyType, 
  CANCELLATION_POLICIES 
} from '@/lib/cancellationPolicies';

interface CancellationPolicyBadgeProps {
  policyType: CancellationPolicyType;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export function CancellationPolicyBadge({ 
  policyType, 
  showTooltip = true,
  size = 'md' 
}: CancellationPolicyBadgeProps) {
  const policy = CANCELLATION_POLICIES[policyType] || CANCELLATION_POLICIES.standard;

  const getIcon = () => {
    switch (policyType) {
      case 'flexible':
        return <Shield className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'standard':
        return <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'strict':
        return <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      default:
        return <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    }
  };

  const getVariantClass = () => {
    switch (policyType) {
      case 'flexible':
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'standard':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'strict':
        return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20';
      default:
        return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  const badge = (
    <Badge 
      variant="secondary" 
      className={`gap-1 ${getVariantClass()} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {getIcon()}
      {policy.name} Cancellation
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="bottom">
          <div className="space-y-2">
            <p className="font-medium text-sm">{policy.name} Cancellation Policy</p>
            <ul className="text-xs space-y-1">
              {policy.tiers.map((tier, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className={
                    tier.refundPercentage === 100 
                      ? 'text-green-500 font-medium' 
                      : tier.refundPercentage > 0 
                        ? 'text-amber-500 font-medium' 
                        : 'text-destructive font-medium'
                  }>
                    {tier.refundPercentage}%
                  </span>
                  <span className="text-muted-foreground">{tier.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CancellationPolicyDetailsProps {
  policyType: CancellationPolicyType;
  className?: string;
}

export function CancellationPolicyDetails({ 
  policyType, 
  className = '' 
}: CancellationPolicyDetailsProps) {
  const policy = CANCELLATION_POLICIES[policyType] || CANCELLATION_POLICIES.standard;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Info className="w-4 h-4 text-muted-foreground" />
        <span>{policy.name} Cancellation Policy</span>
      </div>
      <ul className="text-sm space-y-1.5 pl-6">
        {policy.tiers.map((tier, idx) => (
          <li key={idx} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{tier.label}</span>
            <span className={
              tier.refundPercentage === 100 
                ? 'text-green-600 font-medium' 
                : tier.refundPercentage > 0 
                  ? 'text-amber-600 font-medium' 
                  : 'text-destructive font-medium'
            }>
              {tier.refundPercentage}% refund
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
