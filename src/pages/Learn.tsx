import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, Store, Calendar, Clock, CreditCard, 
  CheckCircle, ArrowRight, Users, Zap, Shield,
  CalendarDays, Repeat, DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { ProfileTypeModal } from '@/components/layout/ProfileTypeModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const eventProFeatures = [
  {
    icon: Calendar,
    title: 'Flexible Packages',
    description: 'Create hourly or daily packages with custom pricing and inclusions.',
  },
  {
    icon: Clock,
    title: 'Availability Control',
    description: 'Set your weekly schedule, buffer times, and block specific dates.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payment Options',
    description: 'Accept payments online via Stripe or cash at the event.',
  },
  {
    icon: Zap,
    title: 'Instant Book or Review',
    description: 'Choose to auto-confirm bookings or review each request first.',
  },
];

const marketFeatures = [
  {
    icon: Store,
    title: 'Flexible Slot Types',
    description: 'Create different slot types with custom sizes, amenities, and pricing.',
  },
  {
    icon: CalendarDays,
    title: 'Inventory Calendar',
    description: 'Manage available spots per day with real-time inventory tracking.',
  },
  {
    icon: Repeat,
    title: 'Recurring Bookings',
    description: 'Vendors can book weekly recurring slots for 4, 8, or 12 weeks.',
  },
  {
    icon: Users,
    title: 'Vendor Management',
    description: 'View all bookings, vendor details, and communicate easily.',
  },
];

const eventProSteps = [
  { step: 1, title: 'Create your profile', description: 'Add your business info, photos, and service area.' },
  { step: 2, title: 'Add packages', description: 'Set up your services with pricing and inclusions.' },
  { step: 3, title: 'Set availability', description: 'Define your schedule and booking preferences.' },
  { step: 4, title: 'Get booked', description: 'Customers find you and book directly.' },
];

const marketSteps = [
  { step: 1, title: 'List your market', description: 'Add location, schedule, and market details.' },
  { step: 2, title: 'Create slot types', description: 'Define booth sizes, amenities, and pricing.' },
  { step: 3, title: 'Manage inventory', description: 'Set available spots per market day.' },
  { step: 4, title: 'Accept bookings', description: 'Vendors book and pay online instantly.' },
];

export default function Learn() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleListService = () => {
    if (user) {
      navigate('/eventpro-onboarding');
    } else {
      navigate('/auth?returnTo=/eventpro-onboarding');
    }
  };

  const handleListMarket = () => {
    if (user) {
      navigate('/marketspace/create');
    } else {
      navigate('/auth?returnTo=/marketspace/create');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="hero-gradient-bg" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Book by availability.
              <br />
              <span className="gradient-text">Get listed in minutes.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're an event professional or a market host, EventPro makes it easy to 
              manage bookings, get paid, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="darkShine" 
                size="lg"
                onClick={() => setProfileModalOpen(true)}
              >
                Create free profile
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Event Pros Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">For Event Pros</h2>
                <p className="text-muted-foreground">Services & Packages</p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
              DJs, photographers, caterers, entertainers — create your profile, list your packages, 
              and let customers book you directly based on your availability.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {eventProFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} variant="elevated" className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>

            {/* How it works - Event Pros */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">How it works</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {eventProSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
                      {step.step}
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleListService}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                List your service
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Markets Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Store className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">For Markets</h2>
                <p className="text-muted-foreground">Slots & Vendor Booking</p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
              Farmers markets, flea markets, craft fairs — manage your vendor slots, 
              accept online bookings, and fill your market with great vendors.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {marketFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} variant="elevated" className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>

            {/* How it works - Markets */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">How it works</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold mb-3">
                      {step.step}
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleListMarket}
                className="gap-2"
              >
                <Store className="w-4 h-4" />
                List a market
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fees Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-trust mx-auto flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-trust-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              No monthly fees. No hidden costs. You only pay when you get paid.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card variant="elevated" className="p-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Event Pros</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">12.9%</div>
                <p className="text-sm text-muted-foreground">
                  Platform fee on online payments. Cash payments are free.
                </p>
              </Card>

              <Card variant="elevated" className="p-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">Markets</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">12.9%</div>
                <p className="text-sm text-muted-foreground">
                  Platform fee on vendor slot bookings paid online.
                </p>
              </Card>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Free to list
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                No monthly fees
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Secure payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create your free profile in minutes and start accepting bookings today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="darkShine" 
                size="lg"
                onClick={() => setProfileModalOpen(true)}
              >
                Create free profile
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="outline" onClick={handleListService} className="gap-2">
                <Sparkles className="w-4 h-4" />
                List your service
              </Button>
              <Button variant="outline" onClick={handleListMarket} className="gap-2">
                <Store className="w-4 h-4" />
                List a market
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ProfileTypeModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </Layout>
  );
}
