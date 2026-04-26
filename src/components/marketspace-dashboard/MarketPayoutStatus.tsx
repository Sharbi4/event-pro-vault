import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Building2,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PayoutStatus = 'not_started' | 'pending' | 'pending_verification' | 'active';

interface MarketPayoutStatusProps {
  variant?: 'banner' | 'full';
  onNavigateTab?: (tab: string) => void;
}

interface ConnectStatusResponse {
  status: PayoutStatus;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pendingVerification: string[];
  };
  error?: string;
}

export function MarketPayoutStatus({ variant = 'banner', onNavigateTab }: MarketPayoutStatusProps) {
  const [status, setStatus] = useState<PayoutStatus>('not_started');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const { toast } = useToast();

  // Check status on mount and when returning from Stripe
  useEffect(() => {
    checkStatus();
    
    // Check for return from Stripe onboarding
    const urlParams = new URLSearchParams(window.location.search);
    const payoutSetup = urlParams.get('payoutSetup');
    if (payoutSetup === 'return' || payoutSetup === 'refresh') {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      checkStatus();
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke<ConnectStatusResponse>(
        'check-market-connect-status'
      );

      if (error) throw error;

      if (data) {
        setStatus(data.status as PayoutStatus);
        if (data.requirements?.currentlyDue) {
          setRequirements(data.requirements.currentlyDue);
        }
      }
    } catch (error: any) {
      console.error('Error checking payout status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPayouts = async () => {
    try {
      setConnecting(true);
      const { data, error } = await supabase.functions.invoke('create-market-connect-account');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error setting up payouts:', error);
      toast({
        title: 'Setup failed',
        description: error.message || 'Failed to start payout setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const getRequirementLabel = (requirement: string): string => {
    const labels: Record<string, string> = {
      'external_account': 'Add bank account',
      'individual.verification.document': 'Verify identity',
      'individual.dob': 'Add date of birth',
      'individual.address': 'Add address',
      'business_profile.url': 'Add website URL',
      'tos_acceptance': 'Accept terms of service',
    };
    return labels[requirement] || requirement.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Checking payout status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status badge component
  const StatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Payouts Enabled
          </Badge>
        );
      case 'pending_verification':
        return (
          <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3" />
            Verification Pending
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Action Required
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Not Connected
          </Badge>
        );
    }
  };

  // Banner variant for Overview tab
  if (variant === 'banner' && status === 'active') {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-green-700">Payouts enabled ✅</p>
                <p className="text-sm text-muted-foreground">
                  You're all set to receive payments
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab?.('payouts')}>
              View details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner' && status !== 'active') {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Set up payouts</h3>
                  <StatusBadge />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {status === 'pending' || status === 'pending_verification'
                    ? 'Complete your Stripe setup to receive payouts from Event Pro bookings.'
                    : 'Connect Stripe to receive your market slot payouts. Takes ~2 minutes.'}
                </p>
                {requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requirements.slice(0, 3).map((req) => (
                      <Badge key={req} variant="outline" className="text-xs">
                        {getRequirementLabel(req)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="gradient" 
                onClick={handleSetupPayouts}
                disabled={connecting}
                className="gap-2"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {status === 'not_started' ? 'Set up Stripe payouts' : 'Continue Stripe setup'}
              </Button>
              <Dialog open={showWhyModal} onOpenChange={setShowWhyModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <HelpCircle className="w-4 h-4" />
                    Why do I need this?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Why Stripe?</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Secure payments</p>
                        <p className="text-sm text-muted-foreground">
                          We use Stripe to securely transfer funds to your bank account.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Quick setup</p>
                        <p className="text-sm text-muted-foreground">
                          You'll need to verify your identity and add a bank account.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Building2 className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Your data is safe</p>
                        <p className="text-sm text-muted-foreground">
                          Vendibook never stores your bank details — Stripe handles everything.
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant for Payouts tab
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status === 'active' 
              ? 'bg-green-500/10' 
              : 'bg-primary/10'
          }`}>
            {status === 'active' ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Wallet className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Stripe Connection</h3>
              <StatusBadge />
            </div>
            
            {status === 'active' ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Your Stripe account is connected and ready to receive payouts.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>💵 Payouts are processed automatically after each booking.</p>
                  <p className="mt-1">📅 Standard payout schedule: 2-3 business days.</p>
                </div>
              </div>
            ) : status === 'pending_verification' ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Your information is being verified by Stripe. This usually takes 1-2 business days.
                </p>
                <Button variant="outline" onClick={checkStatus} className="gap-2">
                  <Loader2 className="w-4 h-4" />
                  Refresh Status
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {status === 'pending' 
                    ? 'Complete your Stripe setup to start receiving payouts.'
                    : 'Connect your Stripe account to receive payouts from Event Pro bookings.'}
                </p>
                {requirements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Required actions:</p>
                    <ul className="space-y-1">
                      {requirements.map((req) => (
                        <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          {getRequirementLabel(req)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button 
                  variant="gradient" 
                  onClick={handleSetupPayouts}
                  disabled={connecting}
                  className="gap-2"
                >
                  {connecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  {status === 'not_started' ? 'Connect Stripe Account' : 'Continue Setup'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
