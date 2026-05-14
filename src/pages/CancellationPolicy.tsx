import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ShieldCheck, ShieldAlert, Info, Clock, DollarSign } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function CancellationPolicy() {
  useSEO({
    title: 'Cancellation & Refund Policy | EventPro by Vendibook',
    description: 'Flexible, Standard, and Strict cancellation tiers for EventPro bookings. See refund timing, deposits, and platform fee rules before you book.',
    canonical: 'https://eventpro.vendibook.com/cancellation',
  });
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Cancellation & Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2025</p>

        <div className="space-y-8">
          {/* Overview */}
          <section>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Cancellation and refund terms depend on the package's cancellation policy (Flexible, Standard, or Strict). 
              You'll always see the exact policy and refund amounts <strong>before you confirm</strong> a booking.
            </p>
          </section>

          {/* Policy Cards */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">Cancellation Policies</h2>
            <p className="text-muted-foreground mb-6">
              Event Pros choose one of these policy templates per package:
            </p>

            <div className="grid gap-4">
              {/* Flexible */}
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Flexible</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 48+ hours before start</span>
                      <span className="font-medium text-green-600">Full refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 24–48 hours before start</span>
                      <span className="font-medium text-amber-600">50% refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel less than 24 hours before</span>
                      <span className="font-medium text-destructive">No refund</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Standard */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Standard (Default)</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 7+ days before start</span>
                      <span className="font-medium text-green-600">Full refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 3–7 days before start</span>
                      <span className="font-medium text-amber-600">50% refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel less than 72 hours before</span>
                      <span className="font-medium text-destructive">No refund</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Strict */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Strict</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 14+ days before start</span>
                      <span className="font-medium text-green-600">Full refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel 7–14 days before start</span>
                      <span className="font-medium text-amber-600">50% refund</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancel less than 7 days before</span>
                      <span className="font-medium text-destructive">No refund</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Deposits */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Deposits
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some packages may require a deposit to reserve the date. <strong>Deposits are non-refundable by default</strong>, except:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>If the <strong>Event Pro cancels</strong>, your deposit is refunded in full</li>
              <li><strong>Grace period:</strong> If you cancel within 1 hour of booking and your event is 7+ days away, your deposit will be refunded</li>
            </ul>
          </section>

          {/* Platform Fees */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Platform Fees
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A <strong>platform fee (12.9%)</strong> is included in your total at checkout.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>If <strong>you cancel</strong>, the platform fee is <strong>not refunded</strong></li>
              <li>If the <strong>Event Pro cancels</strong>, the platform fee <strong>is refunded</strong></li>
            </ul>
          </section>

          {/* Event Pro Payouts */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              When Does the Event Pro Get Paid?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For online payments, funds are held and <strong>payouts are initiated 24 hours after the booking/event ends</strong>. 
              This helps reduce disputes and confirms service completion.
            </p>
          </section>

          {/* Issues */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">What If There's an Issue?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If something goes wrong, you can report an issue from your booking details. For online-paid bookings, 
              issues must be reported <strong>within 24 hours after the booking/event ends</strong> so we can review before payout is released.
            </p>
          </section>

          {/* Event Pro Cancels */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">What If the Event Pro Cancels?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If the Event Pro cancels:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You'll receive a <strong>full refund</strong> for any online payment made (including deposit)</li>
              <li>The platform fee is refunded</li>
              <li>You'll be notified immediately and can book another option</li>
            </ul>
          </section>

          {/* Cash Payments */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Cash Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              If a package is marked <strong>Pay in cash</strong>, you pay the Event Pro directly at the event. 
              Refunds or deposits for cash bookings (if applicable) follow the same cancellation policy terms shown at booking time, 
              but payment handling occurs directly between you and the Event Pro.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about cancellations or refunds, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> support@vendibook.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
