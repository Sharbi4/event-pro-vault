import { useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Printer, Calendar, MapPin, CreditCard, Package, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CancellationPolicyBadge } from '@/components/shared/CancellationPolicyBadge';

interface BookingReceiptProps {
  booking: {
    id: string;
    event_date: string;
    event_location: string;
    total_price: number;
    deposit_amount?: number;
    final_amount?: number;
    deposit_paid_at?: string | null;
    final_paid_at?: string | null;
    payment_method?: 'stripe' | 'cash';
    payment_status?: string;
    status: string;
    units: number;
    notes?: string | null;
    package_name?: string;
    vendor_display_name?: string;
    created_at: string;
    cancellation_policy?: 'flexible' | 'standard' | 'strict';
    start_time?: string | null;
  };
  trigger?: React.ReactNode;
}

export function BookingReceipt({ booking, trigger }: BookingReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const eventDate = parseISO(booking.event_date);
  const depositAmount = booking.deposit_amount ? booking.deposit_amount / 100 : 0;
  const finalAmount = booking.final_amount ? booking.final_amount / 100 : 0;
  const platformFee = booking.total_price * 0.129;

  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Receipt - ${booking.id.slice(0, 8)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .receipt-id { color: #666; font-size: 14px; margin-top: 8px; }
            .section { margin-bottom: 24px; }
            .section-title { font-weight: 600; font-size: 14px; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .divider { border-top: 1px solid #e5e7eb; margin: 16px 0; }
            .total-row { font-size: 18px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .badge-confirmed { background: #dcfce7; color: #166534; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContents}
          <div class="footer">
            <p>Thank you for booking with EventPro by Vendibook</p>
            <p>Questions? Visit your dashboard or contact support.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    // Trigger print which can also be saved as PDF
    handlePrint();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            View Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Receipt</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef}>
          {/* Header */}
          <div className="header text-center mb-6">
            <div className="logo text-2xl font-bold text-primary">EventPro</div>
            <p className="receipt-id text-sm text-muted-foreground mt-1">
              Receipt #{booking.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(booking.created_at), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <Badge 
              variant={
                booking.status === 'confirmed' ? 'default' :
                booking.status === 'completed' ? 'verified' :
                booking.status === 'cancelled' ? 'destructive' : 'secondary'
              }
              className="text-sm"
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>

          {/* Event Details */}
          <Card className="p-4 mb-4">
            <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Event Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{booking.package_name || 'Event Package'}</p>
                  <p className="text-sm text-muted-foreground">{booking.units} unit(s)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{booking.vendor_display_name || 'Event Pro'}</p>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                  {booking.start_time && (
                    <p className="text-sm text-muted-foreground">{booking.start_time}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{booking.event_location}</p>
              </div>
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="p-4 mb-4">
            <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="row flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(booking.total_price - platformFee).toFixed(2)}</span>
              </div>
              <div className="row flex justify-between">
                <span className="text-muted-foreground">Platform Fee (12.9%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="row flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${booking.total_price.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment breakdown */}
            {(depositAmount > 0 || finalAmount > 0) && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  {depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Deposit Paid {booking.deposit_paid_at && `(${format(parseISO(booking.deposit_paid_at), 'MMM d')})`}
                      </span>
                      <span className={booking.deposit_paid_at ? 'text-green-600' : ''}>
                        ${depositAmount.toFixed(2)} {booking.deposit_paid_at && '✓'}
                      </span>
                    </div>
                  )}
                  {finalAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Balance Due {booking.final_paid_at && `(${format(parseISO(booking.final_paid_at), 'MMM d')})`}
                      </span>
                      <span className={booking.final_paid_at ? 'text-green-600' : ''}>
                        ${finalAmount.toFixed(2)} {booking.final_paid_at && '✓'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Payment method */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {booking.payment_method === 'cash' ? 'Pay in Cash' : 'Paid Online'}
              </span>
            </div>
          </Card>

          {/* Cancellation Policy */}
          {booking.cancellation_policy && (
            <Card className="p-4 mb-4">
              <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Cancellation Policy
              </h3>
              <CancellationPolicyBadge 
                policyType={booking.cancellation_policy} 
                showTooltip={false}
              />
            </Card>
          )}

          {/* Notes */}
          {booking.notes && (
            <Card className="p-4">
              <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Special Requests
              </h3>
              <p className="text-sm text-muted-foreground italic">"{booking.notes}"</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
