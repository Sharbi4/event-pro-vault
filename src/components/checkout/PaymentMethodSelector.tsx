import { useState, useEffect } from 'react';
import { CreditCard, Banknote, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export type PaymentMethod = 'stripe' | 'cash';

interface PaymentMethodSelectorProps {
  vendorUserId?: string | null;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  className?: string;
}

interface VendorPaymentSettings {
  accepts_cash: boolean;
  accepts_stripe: boolean;
}

const STRIPE_FEE_PERCENT = 12.9;

export function PaymentMethodSelector({
  vendorUserId,
  selectedMethod,
  onMethodChange,
  className
}: PaymentMethodSelectorProps) {
  const [settings, setSettings] = useState<VendorPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      if (!vendorUserId) {
        // Default to stripe only if no vendor user id
        setSettings({ accepts_cash: false, accepts_stripe: true });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendor_details')
        .select('accepts_cash, accepts_stripe')
        .eq('user_id', vendorUserId)
        .single();

      if (error || !data) {
        // Default to stripe if error
        setSettings({ accepts_cash: false, accepts_stripe: true });
      } else {
        setSettings({
          accepts_cash: data.accepts_cash ?? false,
          accepts_stripe: data.accepts_stripe ?? true
        });
        
        // Auto-select the only available method
        if (data.accepts_cash && !data.accepts_stripe) {
          onMethodChange('cash');
        } else if (!data.accepts_cash && data.accepts_stripe) {
          onMethodChange('stripe');
        }
      }
      setLoading(false);
    };

    fetchPaymentSettings();
  }, [vendorUserId, onMethodChange]);

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <label className="block text-sm font-medium text-foreground">Payment Method</label>
        <div className="animate-pulse bg-muted rounded-xl h-20" />
      </div>
    );
  }

  // If only one method available, show info but don't show selector
  if (settings && !settings.accepts_cash && settings.accepts_stripe) {
    return (
      <div className={cn("space-y-3", className)}>
        <label className="block text-sm font-medium text-foreground">Payment Method</label>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Pay Online via Stripe</p>
              <p className="text-xs text-muted-foreground">Secure payment • {STRIPE_FEE_PERCENT}% service fee</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (settings && settings.accepts_cash && !settings.accepts_stripe) {
    return (
      <div className={cn("space-y-3", className)}>
        <label className="block text-sm font-medium text-foreground">Payment Method</label>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Cash / In-Person Payment</p>
              <p className="text-xs text-muted-foreground">Pay the vendor directly • No service fee</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Both methods available - show selector
  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-foreground">Payment Method</label>
      <div className="space-y-2">
        {/* Stripe Option */}
        {settings?.accepts_stripe && (
          <button
            type="button"
            onClick={() => onMethodChange('stripe')}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              selectedMethod === 'stripe'
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              selectedMethod === 'stripe' ? "bg-primary text-white" : "bg-muted"
            )}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Pay Online</p>
                {selectedMethod === 'stripe' && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Credit/Debit Card • {STRIPE_FEE_PERCENT}% service fee
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-primary">Instant</span>
            </div>
          </button>
        )}

        {/* Cash Option */}
        {settings?.accepts_cash && (
          <button
            type="button"
            onClick={() => onMethodChange('cash')}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              selectedMethod === 'cash'
                ? "border-green-500 bg-green-500/5 ring-1 ring-green-500"
                : "border-border bg-card hover:border-green-500/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              selectedMethod === 'cash' ? "bg-green-500 text-white" : "bg-muted"
            )}>
              <Banknote className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Cash / In-Person</p>
                {selectedMethod === 'cash' && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pay the vendor directly at the event
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-green-600">No fee</span>
            </div>
          </button>
        )}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          {selectedMethod === 'stripe' 
            ? "A 12.9% service fee will be added to your total. Your payment is protected by Stripe's secure payment processing."
            : "You'll pay the vendor directly in cash or via their preferred method at the event. No online payment required."
          }
        </p>
      </div>
    </div>
  );
}

export function useVendorPaymentMethods(vendorUserId?: string | null) {
  const [settings, setSettings] = useState<VendorPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!vendorUserId) {
        setSettings({ accepts_cash: false, accepts_stripe: true });
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('vendor_details')
        .select('accepts_cash, accepts_stripe')
        .eq('user_id', vendorUserId)
        .single();

      setSettings({
        accepts_cash: data?.accepts_cash ?? false,
        accepts_stripe: data?.accepts_stripe ?? true
      });
      setLoading(false);
    };

    fetchSettings();
  }, [vendorUserId]);

  return { settings, loading };
}