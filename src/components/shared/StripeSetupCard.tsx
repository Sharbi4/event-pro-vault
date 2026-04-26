import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  CreditCard,
  Building2,
  User,
  FileText,
  Wallet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { prepareExternalNavigation } from '@/lib/externalNavigation';

export type StripeStatus = 'not_started' | 'pending' | 'pending_verification' | 'active';

interface StripeSetupCardProps {
  variant: 'Vendor' | 'market';
  currentStatus?: string | null;
  onStatusChange?: () => void;
}

interface ConnectStatusResponse {
  status: StripeStatus;
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

const requirementLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  'external_account': { label: 'Add bank account', icon: <Building2 className="w-4 h-4" /> },
  'individual.verification.document': { label: 'Verify identity', icon: <FileText className="w-4 h-4" /> },
  'individual.verification.additional_document': { label: 'Additional document', icon: <FileText className="w-4 h-4" /> },
  'individual.dob': { label: 'Date of birth', icon: <User className="w-4 h-4" /> },
  'individual.address': { label: 'Business address', icon: <Building2 className="w-4 h-4" /> },
  'individual.first_name': { label: 'First name', icon: <User className="w-4 h-4" /> },
  'individual.last_name': { label: 'Last name', icon: <User className="w-4 h-4" /> },
  'individual.email': { label: 'Email address', icon: <User className="w-4 h-4" /> },
  'individual.phone': { label: 'Phone number', icon: <User className="w-4 h-4" /> },
  'individual.ssn_last_4': { label: 'SSN (last 4)', icon: <FileText className="w-4 h-4" /> },
  'business_profile.url': { label: 'Website URL', icon: <ExternalLink className="w-4 h-4" /> },
  'business_profile.mcc': { label: 'Business category', icon: <Building2 className="w-4 h-4" /> },
  'tos_acceptance': { label: 'Accept terms of service', icon: <FileText className="w-4 h-4" /> },
  'tos_acceptance.date': { label: 'Accept terms of service', icon: <FileText className="w-4 h-4" /> },
  'tos_acceptance.ip': { label: 'Accept terms of service', icon: <FileText className="w-4 h-4" /> },
};

const onboardingSteps = [
  { id: 'account', label: 'Create Stripe account' },
  { id: 'identity', label: 'Verify identity' },
  { id: 'bank', label: 'Add bank account' },
  { id: 'terms', label: 'Accept terms' },
];

export function StripeSetupCard({ variant, currentStatus, onStatusChange }: StripeSetupCardProps) {
  const [status, setStatus] = useState<StripeStatus>(
    (currentStatus as StripeStatus) || 'not_started'
  );
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  const { toast } = useToast();

  const checkStatusEndpoint = variant === 'Vendor' 
    ? 'check-connect-status' 
    : 'check-market-connect-status';
  
  const createAccountEndpoint = variant === 'Vendor'
    ? 'create-connect-account'
    : 'create-market-connect-account';

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        // Not signed in (yet) — keep UI stable and avoid calling protected endpoints with an anon token.
        setStatus((currentStatus as StripeStatus) || 'not_started');
        setRequirements([]);
        setDetailsSubmitted(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke<ConnectStatusResponse>(
        checkStatusEndpoint,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (error) throw error;

      if (data) {
        setStatus(data.status as StripeStatus);
        setDetailsSubmitted(data.detailsSubmitted || false);
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

  const handleSetupStripe = async () => {
    const nav = prepareExternalNavigation();

    try {
      setConnecting(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to connect Stripe.',
          variant: 'destructive',
        });
        nav.cancel();
        return;
      }

      const { data, error } = await supabase.functions.invoke(createAccountEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        if (nav.popupBlocked) {
          await navigator.clipboard.writeText(data.url).catch(() => undefined);
          toast({
            title: 'Pop-up blocked',
            description: 'Allow pop-ups, then click again. Link copied to clipboard.',
          });
        }

        nav.open(data.url);
        return;
      }

      nav.cancel();
    } catch (error: any) {
      nav.cancel();
      console.error('Error setting up Stripe:', error);
      toast({
        title: 'Setup failed',
        description: error.message || 'Failed to start Stripe setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const getRequirementInfo = (requirement: string) => {
    // Try to match exact requirement or base requirement
    const baseReq = requirement.split('.').slice(0, 2).join('.');
    return requirementLabels[requirement] || requirementLabels[baseReq] || {
      label: requirement.replace(/_/g, ' ').replace(/\./g, ' › '),
      icon: <AlertCircle className="w-4 h-4" />
    };
  };

  // Calculate progress
  const getProgress = () => {
    if (status === 'active') return 100;
    if (status === 'pending_verification') return 85;
    if (status === 'pending') return detailsSubmitted ? 60 : 30;
    return 0;
  };

  const getCompletedSteps = () => {
    if (status === 'active') return 4;
    if (status === 'pending_verification') return 3;
    if (status === 'pending' && detailsSubmitted) return 2;
    if (status === 'pending') return 1;
    return 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Checking Stripe status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Connected
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

  return (
    <Card className={status === 'active' ? 'border-green-500/20' : 'border-primary/20'}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
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
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">Stripe Payouts</h3>
              <StatusBadge />
            </div>
            <p className="text-sm text-muted-foreground">
              {status === 'active' 
                ? 'Your Stripe account is connected and ready to receive payouts.'
                : `Connect Stripe to receive ${variant === 'Vendor' ? 'booking' : 'slot booking'} payments directly to your bank account.`
              }
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Setup Progress</span>
            <span className="font-medium">{getCompletedSteps()} of 4 steps</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Steps Checklist */}
        <div className="space-y-3 mb-6">
          {onboardingSteps.map((step, index) => {
            const isCompleted = index < getCompletedSteps();
            const isCurrent = index === getCompletedSteps() && status !== 'active';
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCompleted 
                    ? 'bg-green-500/5' 
                    : isCurrent 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'bg-muted/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted 
                    ? 'text-green-600 line-through' 
                    : isCurrent 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pending Requirements */}
        {requirements.length > 0 && status !== 'active' && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Required to complete setup
            </h4>
            <ul className="space-y-2">
              {requirements.slice(0, 5).map((req) => {
                const { label, icon } = getRequirementInfo(req);
                return (
                  <li key={req} className="flex items-center gap-2 text-sm text-amber-700">
                    {icon}
                    {label}
                  </li>
                );
              })}
              {requirements.length > 5 && (
                <li className="text-sm text-amber-600">
                  +{requirements.length - 5} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Verification Pending Notice */}
        {status === 'pending_verification' && (
          <div className="mb-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-600">Verification in progress</p>
                <p className="text-sm text-blue-600/80 mt-1">
                  Stripe is reviewing your information. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active State Benefits */}
        {status === 'active' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Payouts processed automatically after bookings
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Standard payout schedule: 2-3 business days
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Platform commission: 12.9% deducted from earnings
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {status !== 'active' && (
          <Button 
            variant="gradient" 
            onClick={handleSetupStripe}
            disabled={connecting}
            className="w-full gap-2"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {status === 'not_started' 
              ? 'Connect Stripe Account' 
              : status === 'pending_verification'
                ? 'Check Status'
                : 'Continue Setup'
            }
          </Button>
        )}

        {status === 'active' && (
          <Button 
            variant="outline" 
            onClick={checkStatus}
            className="w-full gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Refresh Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}