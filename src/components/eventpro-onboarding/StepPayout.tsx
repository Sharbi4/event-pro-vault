import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  Info,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PaymentMethod = 'cash' | 'stripe' | 'both';

interface StepPayoutProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  stripeStatus: string;
  onConnectStripe: () => Promise<void>;
  connectLoading: boolean;
}

const paymentOptions = [
  {
    id: 'cash' as const,
    label: 'Cash / In-Person',
    description: 'Accept cash or other in-person payments. You handle collection directly.',
    icon: Banknote,
    fee: 'No platform fee',
    feePercent: '0%',
    features: [
      'Collect payment directly',
      'No processing fees',
      'More flexible for customers',
    ],
    warning: 'You are responsible for collecting payment',
  },
  {
    id: 'stripe' as const,
    label: 'Online via Stripe',
    description: 'Accept credit cards and digital payments. Secure, instant booking.',
    icon: CreditCard,
    fee: '12.9% commission',
    feePercent: '12.9%',
    features: [
      'Instant booking confirmation',
      'Secure payment processing',
      'Automatic deposits & payouts',
      'Split payments (deposit + final)',
    ],
    warning: null,
  },
  {
    id: 'both' as const,
    label: 'Both Options',
    description: 'Let customers choose their preferred payment method at checkout.',
    icon: CheckCircle2,
    fee: 'Varies by method',
    feePercent: 'Varies',
    features: [
      'Maximum flexibility for customers',
      'Online instant booking available',
      'Cash option for those who prefer',
    ],
    warning: null,
  },
];

export function StepPayout({
  selectedMethod,
  onMethodChange,
  stripeStatus,
  onConnectStripe,
  connectLoading,
}: StepPayoutProps) {
  const needsStripeSetup = (selectedMethod === 'stripe' || selectedMethod === 'both') && stripeStatus !== 'active';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl font-bold">How would you like to get paid?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Choose how customers can pay for your services. You can change this later.
        </p>
      </div>

      {/* Payment Method Cards */}
      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMethod === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onMethodChange(option.id)}
              className={`w-full text-left rounded-xl p-4 transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                  : 'ring-1 ring-border hover:ring-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{option.label}</h3>
                    <Badge variant={option.id === 'stripe' ? 'gradient' : 'secondary'} className="text-xs">
                      {option.feePercent}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {option.description}
                  </p>

                  {/* Features */}
                  {isSelected && (
                    <div className="mt-3 space-y-1.5">
                      {option.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {option.warning && (
                        <div className="flex items-start gap-2 text-sm text-amber-600 mt-2">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{option.warning}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stripe Connect Section */}
      {needsStripeSetup && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">Connect Stripe to Accept Payments</h4>
                <p className="text-sm text-muted-foreground">
                  To accept online payments, you'll need to connect your Stripe account. This takes about 5 minutes and enables secure payment processing.
                </p>
              </div>
            </div>

            {stripeStatus === 'pending' ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-amber-700">
                  Your Stripe account is pending verification...
                </span>
              </div>
            ) : stripeStatus === 'not_started' ? (
              <Button
                variant="gradient"
                className="w-full"
                onClick={onConnectStripe}
                disabled={connectLoading}
              >
                {connectLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect with Stripe
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Stripe Connected Success */}
      {(selectedMethod === 'stripe' || selectedMethod === 'both') && stripeStatus === 'active' && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Stripe Connected</h4>
                <p className="text-sm text-green-600">
                  You're all set to accept online payments!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          A 12.9% platform commission is deducted from your earnings. This covers payment processing, 
          platform services, and customer support. Your net payout is shown in your dashboard.
        </p>
      </div>
    </div>
  );
}
