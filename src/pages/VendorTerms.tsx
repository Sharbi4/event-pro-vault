import { Layout } from '@/components/layout/Layout';

export default function VendorTerms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Event Pro Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Event Pro Terms & Conditions ("Event Pro Terms") govern your use of EventPro by Vendibook as a service provider. By registering as an Event Pro, you agree to these terms in addition to our general Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old</li>
              <li>You must have the legal right to offer your services</li>
              <li>You must maintain all required licenses, permits, and insurance</li>
              <li>You must accurately represent your qualifications and experience</li>
              <li>You must complete identity verification when required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Service Listings</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All service descriptions must be accurate and not misleading</li>
              <li>Pricing must be transparent and include all mandatory fees</li>
              <li>Photos and media must accurately represent your services</li>
              <li>You must keep your availability calendar up to date</li>
              <li>We reserve the right to remove listings that violate our policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Booking Management</h2>
            <h3 className="text-lg font-medium text-foreground mb-2">Accepting Bookings</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Respond to booking requests within 24 hours when possible</li>
              <li>Only accept bookings you can fulfill as described</li>
              <li>Communicate promptly with customers about event details</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Cancellations</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must set a cancellation policy for each package (Flexible, Standard, or Strict)</li>
              <li>Customer refunds follow your selected cancellation policy</li>
              <li>If you cancel, the customer receives a full refund including platform fees</li>
              <li>Excessive cancellations may result in account restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Payments and Fees</h2>
            <h3 className="text-lg font-medium text-foreground mb-2">Payouts</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Payouts are initiated 24 hours after the booking/event ends</li>
              <li>You must connect a valid Stripe account to receive payments</li>
              <li>Payout timing depends on your bank and Stripe processing</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Platform Fees</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Platform fees (12.9%) are charged to customers, not Event Pros</li>
              <li>Stripe processing fees may apply to your payouts</li>
              <li>Premium subscriptions provide additional features for $25/month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Service Delivery</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Arrive on time and prepared for all bookings</li>
              <li>Deliver services as described in your package listing</li>
              <li>Maintain professional conduct at all times</li>
              <li>Carry appropriate liability insurance for your services</li>
              <li>Report any issues or incidents promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Reviews and Ratings</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Customers may leave reviews after their event</li>
              <li>You may respond to reviews professionally</li>
              <li>Do not offer incentives for positive reviews</li>
              <li>Fraudulent reviews will be removed and may result in penalties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              If a customer reports an issue within 24 hours after the booking ends, we may hold the payout while we review the dispute. We will work with both parties to reach a fair resolution. Our decision on disputes is final.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Account Suspension and Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may suspend or terminate your Event Pro account for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violation of these terms or our policies</li>
              <li>Fraudulent or illegal activity</li>
              <li>Repeated poor reviews or customer complaints</li>
              <li>Failure to fulfill confirmed bookings</li>
              <li>Harassment or unprofessional conduct</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Insurance and Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining appropriate business insurance for your services. EventPro does not provide insurance coverage for Event Pros. You agree to indemnify EventPro against any claims arising from your services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Taxes</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for reporting and paying all applicable taxes on income earned through the Platform. We may provide tax documentation (e.g., 1099 forms) as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Event Pro Terms, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> <a href="mailto:support@vendibook.com" className="text-primary hover:underline">support@vendibook.com</a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
