import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, DollarSign, Calendar, Users, 
  Shield, TrendingUp, CheckCircle, Star
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { generatePageSEO } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Fees',
    description: 'Keep more of what you earn with our low platform fees.'
  },
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Built-in calendar and availability management.'
  },
  {
    icon: Users,
    title: 'Reach More Clients',
    description: 'Connect with hosts actively planning events in your area.'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Guaranteed payments with fraud protection.'
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Analytics and insights to optimize your listings.'
  },
  {
    icon: Star,
    title: 'Build Reputation',
    description: 'Collect reviews and build a trusted brand.'
  }
];

const steps = [
  {
    step: '1',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your services. Add photos, bio, and service area.'
  },
  {
    step: '2',
    title: 'Build Your Packages',
    description: 'Create up to 20 custom packages with your own pricing, inclusions, and add-ons.'
  },
  {
    step: '3',
    title: 'Set Availability',
    description: 'Manage your calendar, set blackout dates, and control when you can be booked.'
  },
  {
    step: '4',
    title: 'Start Earning',
    description: 'Go live and start receiving booking requests from event hosts.'
  }
];

export default function BecomePro() {
  const seo = generatePageSEO('becomePro');
  
  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
    keywords: [
      'become event Event Pro',
      'list event services',
      'event pro signup',
      'Event Pro registration',
      'sell event services',
      'catering business',
      'DJ booking platform',
      'photographer marketplace',
      'event services marketplace',
    ],
  });

  return (
    <Layout>
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://event-pro-vault.lovable.app/' },
        { name: 'Become a Pro', url: 'https://event-pro-vault.lovable.app/become-a-pro' },
      ]} />
      
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs 
            items={[{ label: 'Become an Event Pro' }]} 
            className="mb-6"
          />
        </div>
        
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Grow your event business with{' '}
              <span className="gradient-text">Event Pros</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of Event Pros getting booked for events every day. 
              Create your profile, set your rates, and start earning.
            </p>
            <Link to="/vendor-onboarding">
              <Button variant="gradient" size="xl" className="gap-2 shimmer-effect">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No monthly fees. Only pay when you get booked.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
              <p className="text-muted-foreground">Active Event Pros</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
              <p className="text-muted-foreground">Events Booked</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">$2M+</div>
              <p className="text-muted-foreground">Paid to Event Pros</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">4.8★</div>
              <p className="text-muted-foreground">Avg. Event Pro Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Event Pros love Event Pros
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run and grow your event business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title} 
                variant="glow" 
                className="p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Getting started is easy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be up and running in less than 15 minutes
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={step.step} 
                className="flex gap-6 mb-8 last:mb-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-white text-lg">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-primary to-accent mx-auto mt-2" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package System */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Flexible package system
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create up to 20 unique packages tailored to different event types and budgets. 
                Set hourly or daily rates, add optional extras, and let clients book exactly what they need.
              </p>
              <ul className="space-y-4">
                {[
                  'Set your own prices and minimums',
                  'Add custom inclusions and add-ons',
                  'Hourly or daily pricing options',
                  'Instant book or request-based',
                  'Custom cancellation policies'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-trust" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card variant="gradient" className="p-8">
              <div className="space-y-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">Premium Package</h4>
                    <span className="gradient-text font-bold">$350/hr</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Full service with premium equipment</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">Standard Package</h4>
                    <span className="gradient-text font-bold">$200/hr</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Great for medium-sized events</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">+ 18 more packages</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Create unlimited variations</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Event Pros today and start getting booked for events in your area.
          </p>
          <Link to="/vendor-onboarding">
            <Button variant="gradient" size="xl" className="gap-2 shimmer-effect">
              Create Your Profile
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
