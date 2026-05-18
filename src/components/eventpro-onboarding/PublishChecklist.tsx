import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  User,
  MapPin,
  Image,
  Package,
  CreditCard,
  Clock,
  Wallet,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingState } from '@/hooks/useEventProOnboarding';
import { VendorPackage } from '@/hooks/useVendorDashboard';

interface PublishChecklistProps {
  state: OnboardingState;
  packages: VendorPackage[];
  stripeStatus: string;
  onConnectStripe?: () => void;
  className?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
  };
  warning?: string;
}

export function PublishChecklist({
  state,
  packages,
  stripeStatus,
  onConnectStripe,
  className,
}: PublishChecklistProps) {
  // Check if any package requires online payment
  const hasOnlinePaymentPackage = packages.some(
    pkg => (pkg as any).payment_options === 'ONLINE' || (pkg as any).payment_options === 'BOTH'
  );
  
  const stripeConnected = stripeStatus === 'active';
  const stripeRequired = hasOnlinePaymentPackage || state.paymentMethod === 'stripe' || state.paymentMethod === 'both';

  const photoCount = state.mediaItems.filter(m => m.type === 'image').length;

  const enabledDays = state.weeklyAvailability.filter(d => d.isEnabled);
  const availabilityComplete =
    state.bufferSettings.availableByRequestOnly || enabledDays.length > 0;
  const availabilityDescription = state.bufferSettings.availableByRequestOnly
    ? 'By request only'
    : enabledDays.length === 0
    ? 'No days enabled yet'
    : `${enabledDays.length} day${enabledDays.length === 1 ? '' : 's'} per week enabled`;

  const paymentMethodComplete = !!state.paymentMethod;
  const paymentMethodDescription =
    state.paymentMethod === 'both'
      ? 'Online (Stripe) + cash'
      : state.paymentMethod === 'stripe'
      ? 'Online payments via Stripe'
      : state.paymentMethod === 'cash'
      ? 'Cash on event day'
      : 'Choose how you want to be paid';

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Profile basics',
      description: 'Display name, username & bio',
      isComplete: !!(
        state.profileBasics.displayName &&
        state.profileBasics.username &&
        state.profileBasics.shortBio
      ),
      isRequired: true,
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'location',
      label: 'Service area',
      description: 'Base location & travel radius',
      isComplete: !!state.serviceArea.formattedAddress,
      isRequired: true,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'photos',
      label: 'Photos',
      description: `${photoCount}/3 photos uploaded`,
      isComplete: photoCount >= 3,
      isRequired: false,
      icon: <Image className="w-4 h-4" />,
      warning: photoCount === 0 ? 'Profiles with photos get 10x more views' : undefined,
    },
    {
      id: 'packages',
      label: 'Packages',
      description: packages.length === 0 
        ? 'No packages yet' 
        : `${packages.length} package${packages.length === 1 ? '' : 's'} created`,
      isComplete: packages.length > 0,
      isRequired: false,
      icon: <Package className="w-4 h-4" />,
      warning: packages.length === 0 
        ? 'You need at least 1 package to appear in search' 
        : undefined,
    },
    {
      id: 'availability',
      label: 'Weekly availability',
      description: availabilityDescription,
      isComplete: availabilityComplete,
      isRequired: true,
      icon: <Clock className="w-4 h-4" />,
      warning: !availabilityComplete
        ? 'Enable at least one day or switch to by-request only'
        : undefined,
    },
    {
      id: 'payment-method',
      label: 'Payment method',
      description: paymentMethodDescription,
      isComplete: paymentMethodComplete,
      isRequired: true,
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'stripe',
      label: 'Stripe payments',
      description: stripeConnected 
        ? 'Connected & ready' 
        : 'Connect to accept online payments',
      isComplete: stripeConnected,
      isRequired: stripeRequired,
      icon: <CreditCard className="w-4 h-4" />,
      action: !stripeConnected && onConnectStripe ? {
        label: 'Connect Stripe',
        onClick: onConnectStripe,
      } : undefined,
      warning: stripeRequired && !stripeConnected 
        ? 'Required for packages with online payment' 
        : undefined,
    },
  ];

  // Filter to get required items that are incomplete
  const missingRequired = items.filter(item => item.isRequired && !item.isComplete);
  const completedCount = items.filter(item => item.isComplete).length;
  const canPublish = missingRequired.length === 0;

  // Additional check: if Stripe required for packages but not connected, block
  const stripeBlocksPublish = stripeRequired && !stripeConnected;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Publish Checklist
          </CardTitle>
          <Badge 
            variant={canPublish && !stripeBlocksPublish ? 'default' : 'secondary'}
            className={canPublish && !stripeBlocksPublish ? 'bg-green-500' : ''}
          >
            {completedCount}/{items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg transition-colors',
              item.isComplete 
                ? 'bg-green-500/5 border border-green-500/20' 
                : item.isRequired || item.warning
                ? 'bg-amber-500/5 border border-amber-500/20'
                : 'bg-muted/30 border border-transparent'
            )}
          >
            <div className={cn(
              'mt-0.5',
              item.isComplete ? 'text-green-500' : 'text-muted-foreground'
            )}>
              {item.isComplete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : item.isRequired ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
                {item.isRequired && !item.isComplete && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.description}
              </p>
              {item.warning && !item.isComplete && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ {item.warning}
                </p>
              )}
              {item.action && !item.isComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs gap-1"
                  onClick={item.action.onClick}
                >
                  <ExternalLink className="w-3 h-3" />
                  {item.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Summary message */}
        {canPublish && !stripeBlocksPublish ? (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to publish!</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Complete required items to publish
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
