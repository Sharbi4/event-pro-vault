import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  CreditCard, 
  Banknote, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';
import { CANCELLATION_POLICIES, CancellationPolicyType } from '@/lib/cancellationPolicies';

export type BookingMode = 'INSTANT' | 'REQUEST';
export type PaymentOptions = 'ONLINE' | 'CASH' | 'BOTH';

interface StepBookingPaymentProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
  stripeConnected: boolean;
  onConnectStripe?: () => void;
}

export function StepBookingPayment({ 
  formData, 
  updateFormData, 
  stripeConnected,
  onConnectStripe 
}: StepBookingPaymentProps) {
  const bookingMode = formData.booking_mode || 'INSTANT';
  const paymentOptions = formData.payment_options || 'ONLINE';
  const rawPolicy = formData.cancellation_policy || 'standard';
  const cancellationPolicy: CancellationPolicyType = 
    (rawPolicy in CANCELLATION_POLICIES) ? rawPolicy as CancellationPolicyType : 'standard';
  
  const needsStripe = paymentOptions === 'ONLINE' || paymentOptions === 'BOTH';
  const stripeBlocked = needsStripe && !stripeConnected;

  const getPolicyIcon = (policyId: CancellationPolicyType) => {
    switch (policyId) {
      case 'flexible': return <Shield className="w-4 h-4 text-green-500" />;
      case 'standard': return <ShieldCheck className="w-4 h-4 text-primary" />;
      case 'strict': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Mode */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Booking Mode</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how customers can book this package
        </p>
        
        <RadioGroup
          value={bookingMode}
          onValueChange={(value) => updateFormData({ booking_mode: value as BookingMode })}
          className="grid gap-3"
        >
          <label
            htmlFor="booking-instant"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              bookingMode === 'INSTANT'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="INSTANT" id="booking-instant" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">Instant Book</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Customers can book immediately without waiting for approval. Great for maximizing bookings.
              </p>
            </div>
          </label>
          
          <label
            htmlFor="booking-request"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              bookingMode === 'REQUEST'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="REQUEST" id="booking-request" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Request to Book</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve each booking request before it's confirmed. Good for custom services.
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Payment Options</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          How can customers pay for this package?
        </p>
        
        <RadioGroup
          value={paymentOptions}
          onValueChange={(value) => updateFormData({ payment_options: value as PaymentOptions })}
          className="grid gap-3"
        >
          <label
            htmlFor="payment-online"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              paymentOptions === 'ONLINE'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            } ${!stripeConnected ? 'opacity-60' : ''}`}
          >
            <RadioGroupItem 
              value="ONLINE" 
              id="payment-online" 
              className="mt-1" 
              disabled={!stripeConnected}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-medium">Pay online (card)</span>
                {!stripeConnected && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    Requires Stripe
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Customers pay securely with credit or debit card. Funds deposited to your account.
              </p>
            </div>
          </label>
          
          <label
            htmlFor="payment-cash"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              paymentOptions === 'CASH'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="CASH" id="payment-cash" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                <span className="font-medium">Pay in cash</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Customers pay in cash at the event. You handle payment collection directly.
              </p>
            </div>
          </label>
          
          <label
            htmlFor="payment-both"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              paymentOptions === 'BOTH'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            } ${!stripeConnected ? 'opacity-60' : ''}`}
          >
            <RadioGroupItem 
              value="BOTH" 
              id="payment-both" 
              className="mt-1"
              disabled={!stripeConnected}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <Banknote className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">Both (customer chooses)</span>
                {!stripeConnected && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    Requires Stripe
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Give customers flexibility to pay online or in cash. Recommended for maximum conversions.
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Stripe Connect Warning/Status */}
      {stripeBlocked && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Connect Stripe to enable online payments
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You need to connect your Stripe account before you can accept online payments.
                  {formData.payment_options !== 'CASH' && ' Switch to "Pay in cash" or connect Stripe to continue.'}
                </p>
                {onConnectStripe && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onConnectStripe}
                    className="mt-3 gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Connect Stripe
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stripeConnected && needsStripe && (
        <Card className="border-green-300 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Online payments enabled
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your Stripe account is connected and ready to accept payments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Policy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Cancellation Policy</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a cancellation policy that works for your business
        </p>
        
        <RadioGroup
          value={cancellationPolicy}
          onValueChange={(value) => updateFormData({ cancellation_policy: value })}
          className="grid gap-3"
        >
          {(Object.keys(CANCELLATION_POLICIES) as CancellationPolicyType[]).map((policyId) => {
            const policy = CANCELLATION_POLICIES[policyId];
            return (
              <label
                key={policyId}
                htmlFor={`policy-${policyId}`}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  cancellationPolicy === policyId
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={policyId} id={`policy-${policyId}`} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getPolicyIcon(policyId)}
                    <span className="font-medium">{policy.name}</span>
                    {policyId === 'standard' && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {policy.description}
                  </p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    {policy.tiers.map((tier, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className={tier.refundPercentage === 100 ? 'text-green-600' : tier.refundPercentage > 0 ? 'text-amber-600' : 'text-destructive'}>
                          {tier.refundPercentage}% refund
                        </span>
                        <span>— {tier.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">How it works for customers:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {bookingMode === 'INSTANT' ? (
              <li className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                Booking is confirmed immediately
              </li>
            ) : (
              <li className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                You'll review and approve each request
              </li>
            )}
            {paymentOptions === 'ONLINE' && (
              <li className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                {bookingMode === 'INSTANT' 
                  ? 'Payment collected at booking' 
                  : 'Payment collected after you approve'}
              </li>
            )}
            {paymentOptions === 'CASH' && (
              <li className="flex items-center gap-2">
                <Banknote className="w-3 h-3" />
                Customer pays in cash at the event
              </li>
            )}
            {paymentOptions === 'BOTH' && (
              <li className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <CreditCard className="w-3 h-3" />
                  <Banknote className="w-3 h-3" />
                </div>
                Customer chooses online or cash payment
              </li>
            )}
            <li className="flex items-center gap-2">
              {getPolicyIcon(cancellationPolicy)}
              {CANCELLATION_POLICIES[cancellationPolicy].name} cancellation policy applies
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
