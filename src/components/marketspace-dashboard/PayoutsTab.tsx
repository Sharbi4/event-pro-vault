import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Building2, 
  Receipt,
  Info,
  DollarSign,
  Percent
} from 'lucide-react';
import { MarketPayoutStatus } from './MarketPayoutStatus';

interface PayoutsTabProps {
  totalEarnings?: number;
  pendingPayouts?: number;
  availableBalance?: number;
}

export function PayoutsTab({ 
  totalEarnings = 0, 
  pendingPayouts = 0, 
  availableBalance = 0 
}: PayoutsTabProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Stripe Connection Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Payout Setup</h3>
        <MarketPayoutStatus variant="full" />
      </div>

      {/* Section 2: Earnings Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    ${pendingPayouts.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">
                    ${availableBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Payout History Placeholder */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Payout History</h3>
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="font-medium text-foreground mb-2">No payouts yet</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your payout history will appear here once you start receiving bookings and payments.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Fees Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">How payouts work</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When vendors book slots at your market, payments are processed through Stripe and deposited to your connected bank account.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Platform booking fee</span>
                </div>
                <Badge variant="outline">12.9%</Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Added to vendor's total at checkout. Covers payment processing and platform services.
              </p>
            </div>

            <Separator />

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Your payout calculation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">Your Payout = Slot Price - Platform Fee (12.9%) - Stripe Fees (~2.9% + $0.30)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Example: For a $100 slot → You receive approximately $84.10
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
