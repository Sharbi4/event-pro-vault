import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Clock, 
  Eye, 
  EyeOff, 
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StripeSetupCard } from '@/components/shared/StripeSetupCard';

interface SettingsTabProps {
  market: {
    isPublished: boolean;
    bookingsEnabled: boolean;
    stripeAccountStatus?: string | null;
  };
  bookingMode: 'instant' | 'request';
  onUpdateBookingMode: (mode: 'instant' | 'request') => void;
  onTogglePublished: (published: boolean) => void;
  saving: boolean;
}

export function SettingsTab({
  market,
  bookingMode,
  onUpdateBookingMode,
  onTogglePublished,
  saving,
}: SettingsTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stripe Payouts Setup */}
      <StripeSetupCard 
        variant="market" 
        currentStatus={market.stripeAccountStatus}
      />
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            Booking Mode
          </h3>
          
          <div className="space-y-4">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                bookingMode === 'instant' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onUpdateBookingMode('instant')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Instant Booking
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vendors can book immediately. Slots decrement on checkout.
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  bookingMode === 'instant' ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`} />
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                bookingMode === 'request' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onUpdateBookingMode('request')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="font-medium">Request Approval</div>
                    <p className="text-sm text-muted-foreground">
                      Review and approve each booking request. Slots decrement on approval.
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  bookingMode === 'request' ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            {market.isPublished ? (
              <Eye className="w-5 h-5 text-green-500" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            )}
            Market Visibility
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {market.isPublished ? 'Published' : 'Draft'}
              </p>
              <p className="text-sm text-muted-foreground">
                {market.isPublished 
                  ? 'Your market is visible to vendors and accepting bookings.'
                  : 'Your market is hidden. Complete the setup checklist to publish.'
                }
              </p>
            </div>
            <Switch
              checked={market.isPublished}
              onCheckedChange={onTogglePublished}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary" />
            Cancellation Policy
          </h3>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Default cancellation policy applies. Full refund if cancelled 7+ days before the event, 
              50% refund if cancelled 3-7 days before, no refund within 3 days.
            </p>
            <Button variant="link" className="px-0 h-auto mt-2" disabled>
              Customize (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Limit Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-600">One Market Per Account</h3>
              <p className="text-sm text-amber-600/80 mt-1">
                During MVP, each account can manage one market. This helps us ensure quality support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-destructive flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your market will remove all slot types, inventory, and cancel any pending bookings.
            This action cannot be undone.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Market
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your market,
                  all slot types, inventory, and cancel any pending bookings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                  Delete Market
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
