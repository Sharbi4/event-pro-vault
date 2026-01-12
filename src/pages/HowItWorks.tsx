import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Search, Package, CreditCard, MessageCircle, 
  Star, Shield, Clock, CheckCircle, ArrowRight
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover Vendors',
    description: 'Browse our curated marketplace of verified event professionals. Filter by category, location, budget, and availability to find your perfect match.',
    features: ['Search by category or keyword', 'Filter by location and service radius', 'Compare ratings and reviews', 'View detailed profiles']
  },
  {
    icon: Package,
    title: 'Choose a Package',
    description: 'Each vendor offers ready-to-book packages with transparent pricing. Select one that fits your event, or request a custom quote for something unique.',
    features: ['Hourly or daily pricing', 'Clear inclusions and add-ons', 'Minimum booking requirements', 'Custom quote requests']
  },
  {
    icon: CreditCard,
    title: 'Book & Pay Securely',
    description: 'Complete your booking with our secure payment system. Your payment is protected until the event is completed to your satisfaction.',
    features: ['Secure encrypted payments', 'Payment held until completion', 'Easy cancellation policies', 'Instant confirmation']
  },
  {
    icon: MessageCircle,
    title: 'Coordinate Your Event',
    description: 'Use our built-in messaging to communicate directly with your vendor. Share event details, ask questions, and finalize arrangements.',
    features: ['Direct vendor messaging', 'Share event details', 'Coordinate logistics', 'Get setup instructions']
  }
];

const trustFeatures = [
  {
    icon: Shield,
    title: 'Verified Vendors',
    description: 'Every vendor is vetted for quality, professionalism, and reliability before joining our platform.'
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'All reviews come from verified bookings, so you can trust the feedback is authentic.'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Your payment is held securely until your event is completed successfully.'
  },
  {
    icon: Clock,
    title: 'Transparent Pricing',
    description: 'No hidden fees. See exactly what you\'ll pay before booking, including any travel fees.'
  }
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            How <span className="gradient-text">Event Pros</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Book premium event vendors in four simple steps. 
            From discovery to event day, we've got you covered.
          </p>
          <Link to="/browse">
            <Button variant="gradient" size="xl">
              Start Browsing
            </Button>
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-28 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-white text-lg">
                      {index + 1}
                    </div>
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-trust" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Card variant="gradient" className={`aspect-video flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <step.icon className="w-24 h-24 text-primary/30" />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Book with Confidence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your trust and safety are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="glow" 
                className="p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-trust/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-trust" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to find your perfect vendor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our marketplace and book in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse">
              <Button variant="gradient" size="xl" className="gap-2">
                Browse Vendors
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/become-a-pro">
              <Button variant="outline" size="xl">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
