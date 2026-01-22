import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  TrendingUp, 
  Building2, 
  Receipt,
  Info,
  DollarSign,
  Percent,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { MarketPayoutStatus } from './MarketPayoutStatus';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { useMarketEarnings, calculateEarningsBreakdown } from '@/hooks/useMarketEarnings';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface PayoutsTabProps {
  bookings: SlotBooking[];
}

export function PayoutsTab({ bookings }: PayoutsTabProps) {
  const earnings = useMarketEarnings(bookings);
  
  // Example calculation for display
  const exampleBreakdown = calculateEarningsBreakdown(100);

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
                    ${earnings.totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {earnings.completedBookings + earnings.upcomingBookings} paid bookings
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
                    ${earnings.pendingPayouts.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Released 24h after event
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
                    ${earnings.availableBalance.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ready for payout
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Recent Payouts/Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <Card>
          {earnings.recentPayouts.length > 0 ? (
            <div className="divide-y">
              {earnings.recentPayouts.map((payout) => (
                <div key={payout.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      payout.status === 'available' 
                        ? 'bg-green-500/10' 
                        : 'bg-amber-500/10'
                    }`}>
                      {payout.status === 'available' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Timer className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{payout.slotTypeName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(payout.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +${payout.netPayout.toFixed(2)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        payout.status === 'available' 
                          ? 'border-green-500/30 text-green-600' 
                          : 'border-amber-500/30 text-amber-600'
                      }`}
                    >
                      {payout.status === 'available' ? 'Available' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardContent className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">No transactions yet</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your transaction history will appear here once you start receiving bookings and payments.
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Section 4: Fee Structure - Market Host Only */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Fee Structure</h3>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">How your payouts work</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A small platform fee is deducted from each booking to cover platform services, support, and secure payment processing.
                </p>
              </div>
            </div>

            <Separator />

            {/* Market Host Fees */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary">Your Fees</Badge>
              </div>
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Platform commission</span>
                </div>
                <Badge variant="outline">12.9%</Badge>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Deducted from your slot price. Covers platform services and support.
              </p>
              <div className="flex items-center justify-between pl-2 mt-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Stripe processing</span>
                </div>
                <Badge variant="outline">~2.9% + $0.30</Badge>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Standard payment processing fees charged by Stripe.
              </p>
            </div>

            <Separator />

            {/* Payout Timing */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-sm text-amber-700">24-Hour Payout Hold</span>
              </div>
              <p className="text-sm text-amber-700/80">
                Payouts are released 24 hours after the event date. This protects both parties and allows time for any issues to be resolved.
              </p>
            </div>

            <Separator />

            {/* Example Calculation - Market Host View Only */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Example: $100 Slot</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your slot price</span>
                  <span className="font-mono">${exampleBreakdown.slotPrice.toFixed(2)}</span>
                </div>
                
                <div className="my-2 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex justify-between text-red-600">
                  <span>- Platform commission (12.9%)</span>
                  <span className="font-mono">-${exampleBreakdown.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Stripe fees (~2.9% + $0.30)</span>
                  <span className="font-mono">-${exampleBreakdown.stripeFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600 border-t pt-2 text-base">
                  <span>Your payout</span>
                  <span className="font-mono">${exampleBreakdown.netPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
