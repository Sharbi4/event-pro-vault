import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Clock, TrendingUp, Building2 } from 'lucide-react';

export function PayoutsTab() {
  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-8 text-white text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Payouts Coming Soon</h2>
          <p className="text-white/80 max-w-md mx-auto">
            We're building a seamless payout system to help you receive payments from vendor bookings.
          </p>
        </div>
      </Card>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Setup */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Connect Your Bank Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up your payout preferences to receive payments from vendor bookings.
          </p>
          <Button disabled>
            Set Up Payouts (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
