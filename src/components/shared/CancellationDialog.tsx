import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Loader2, XCircle, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingType: 'slot_booking' | 'booking';
  totalPaid: number; // In dollars
  eventDate?: string;
  isPaid: boolean;
  onSuccess?: () => void;
}

export function CancellationDialog({
  open,
  onOpenChange,
  bookingId,
  bookingType,
  totalPaid,
  eventDate,
  isPaid,
  onSuccess,
}: CancellationDialogProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial' | 'none'>('full');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Calculate days until event
  const daysUntilEvent = eventDate 
    ? Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate refund amounts
  const fullRefund = totalPaid;
  const partialRefund = totalPaid * 0.5;

  const handleCancel = async () => {
    setProcessing(true);

    try {
      if (isPaid && refundType !== 'none') {
        // Process refund via edge function
        const { data, error } = await supabase.functions.invoke('process-refund', {
          body: {
            booking_id: bookingId,
            booking_type: bookingType,
            refund_type: refundType,
            reason: reason || undefined,
          },
        });

        if (error) throw error;

        toast({
          title: 'Booking Cancelled',
          description: data.message || `Refund of $${data.refund_amount?.toFixed(2)} has been processed.`,
        });
      } else {
        // Just cancel without refund (no payment or user chose no refund)
        const table = bookingType === 'slot_booking' ? 'slot_bookings' : 'bookings';
        const { error } = await supabase
          .from(table)
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (error) throw error;

        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been cancelled.',
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: 'Cancellation Failed',
        description: error instanceof Error ? error.message : 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            {isPaid 
              ? 'Choose how to handle the refund for this booking.'
              : 'This booking has not been paid. It will be cancelled without any refund.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event date warning */}
          {daysUntilEvent !== null && daysUntilEvent <= 7 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">
                  {daysUntilEvent <= 0 
                    ? 'This event is today or has passed'
                    : `Only ${daysUntilEvent} day${daysUntilEvent !== 1 ? 's' : ''} until the event`
                  }
                </p>
                <p className="text-muted-foreground">
                  Consider the cancellation policy when issuing refunds.
                </p>
              </div>
            </div>
          )}

          {/* Refund options */}
          {isPaid && (
            <RadioGroup 
              value={refundType} 
              onValueChange={(v) => setRefundType(v as 'full' | 'partial' | 'none')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Full Refund</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      ${fullRefund.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Return the entire payment to the customer
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">50% Refund</span>
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                      ${partialRefund.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Return half of the payment amount
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="font-medium">No Refund</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cancel without issuing any refund
                  </p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why is this booking being cancelled?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Keep Booking
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
