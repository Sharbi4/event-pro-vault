import { Layout } from '@/components/layout/Layout';
import { useSEO } from '@/hooks/useSEO';

export default function TermsOfService() {
  useSEO({
    title: 'Terms of Service | EventPro by Vendibook',
    description: 'The terms governing your use of EventPro by Vendibook as a customer or Event Pro, including bookings, payments, and account rules.',
    canonical: 'https://eventpro.vendibook.com/terms',
  });
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using EventPro by Vendibook ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              EventPro is a marketplace platform that connects event hosts ("Customers") with event service providers ("Event Pros"). We facilitate bookings, payments, and communication between parties but do not directly provide event services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Booking and Payments</h2>
            <h3 className="text-lg font-medium text-foreground mb-2">For Customers</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Bookings are subject to Event Pro availability and acceptance</li>
              <li>Payment is required to confirm a booking</li>
              <li>A platform fee of 12.9% is added to all bookings</li>
              <li>Cancellations are subject to the Event Pro's cancellation policy</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">For Event Pros</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must accurately represent your services and availability</li>
              <li>Payouts are processed 24 hours after service completion</li>
              <li>You are responsible for delivering services as described</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Cancellations and Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cancellation and refund terms are determined by the Event Pro's selected cancellation policy (Flexible, Standard, or Strict). Platform fees are non-refundable unless the Event Pro cancels. See our Cancellation Policy for full details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, threaten, or discriminate against other users</li>
              <li>Circumvent the Platform to avoid fees</li>
              <li>Use the Platform for any illegal purpose</li>
              <li>Interfere with the Platform's operation or security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform and its original content, features, and functionality are owned by Vendibook and are protected by copyright, trademark, and other intellectual property laws. Users retain ownership of content they submit but grant us a license to use it on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              EventPro is a marketplace platform that facilitates connections between Customers and Event Pros. We are not liable for the quality, safety, or legality of services provided by Event Pros. To the maximum extent permitted by law, we disclaim all warranties and limit our liability for any damages arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Vendibook and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from these terms or your use of the Platform will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive your right to a jury trial or to participate in a class action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of material changes via email or Platform notification. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
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
