import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, Store, Calendar, Clock, CreditCard, 
  CheckCircle, ArrowRight, Zap, Shield, Info,
  CalendarDays, Repeat, DollarSign, Package, MapPin,
  Users, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { ProfileTypeModal } from '@/components/layout/ProfileTypeModal';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setAuthIntent } from '@/lib/authIntent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilityDemoWidget } from '@/components/learn/AvailabilityDemoWidget';

const eventProSteps = [
  { step: 1, title: 'Create your profile', description: 'Add your name/business, bio, categories, service area, and media.' },
  { step: 2, title: 'Publish packages', description: 'Set up your services with pricing, duration, and inclusions.' },
  { step: 3, title: 'Set availability per package', description: 'Define your schedule and booking preferences for each package.' },
  { step: 4, title: 'Get booked and paid', description: 'Customers find you and book directly with secure payments.' },
];

const marketSteps = [
  { step: 1, title: 'Create your market listing', description: 'Add location, schedule, and market details.' },
  { step: 2, title: 'Create slot types', description: 'Define booth sizes, amenities, and pricing.' },
  { step: 3, title: 'Add inventory days', description: 'Set available spots per market day (weekly/biweekly/custom).' },
  { step: 4, title: 'Vendors reserve spots instantly', description: 'Vendors book and pay online automatically.' },
];

const faqs = [
  {
    q: 'Do I need an account to browse?',
    a: 'Nope. Browse freely—create an account when you\'re ready to book, reserve, or list.',
  },
  {
    q: 'What makes EventPro different?',
    a: 'Availability-first search. You don\'t just find vendors—you find packages that are actually available for your date and time.',
  },
  {
    q: 'Can I list as both an Event Pro and a Market?',
    a: 'Yes. You can switch modes from your dashboard menu anytime.',
  },
];

export default function Learn() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleListService = () => {
    if (user) {
      navigate('/eventpro-onboarding');
    } else {
      setAuthIntent({
        intent: 'EVENT_PRO_ONBOARDING',
        profileType: 'EVENT_PRO',
      });
      navigate('/auth?intent=EVENT_PRO_ONBOARDING&profileType=EVENT_PRO');
    }
  };

  const handleListMarket = () => {
    if (user) {
      navigate('/marketspace/create');
    } else {
      setAuthIntent({
        intent: 'MARKET_ONBOARDING',
        profileType: 'MARKET_SPACE',
      });
      navigate('/auth?intent=MARKET_ONBOARDING&profileType=MARKET_SPACE');
    }
  };

  return (
    <Layout>
      <TooltipProvider>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="hero-gradient-bg" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Book what's available.
                <br />
                <span className="gradient-text">Get listed in minutes.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
                EventPro matches customers to{' '}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help inline-flex items-center gap-1">
                      real-time availability
                      <Info className="w-4 h-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Availability-based results</p>
                    <p className="text-sm">Results update based on your selected date and time—no guessing, no back-and-forth.</p>
                  </TooltipContent>
                </Tooltip>
                —bookable packages for events, and open vendor spots for markets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={() => setProfileModalOpen(true)}
                >
                  Create free profile
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore Event Pros
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/markets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore Markets
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Availability Demo Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    See it in action
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Watch how availability-based search works. Select a date and time, and results update instantly—showing only what's actually bookable.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Pick your event date</p>
                        <p className="text-sm text-muted-foreground">Results filter to that day's availability</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Choose a time window</p>
                        <p className="text-sm text-muted-foreground">See who's free during your event hours</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-trust/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-trust" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Book with confidence</p>
                        <p className="text-sm text-muted-foreground">No back-and-forth—what you see is bookable</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <AvailabilityDemoWidget />
              </div>
            </div>
          </div>
        </section>

        {/* Two-Path Cards Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Event Pros Card */}
                <Card variant="elevated" className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Turn your service into bookable packages
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create packages, set availability per package, and choose how customers pay—online, cash, or both.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Show up in search when you're available</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Instant Book or review requests</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Travel radius + pricing validated at checkout</span>
                    </li>
                  </ul>
                  <Link to="/learn/event-pros">
                    <Button variant="outline" className="w-full gap-2">
                      Learn more for Event Pros
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>

                {/* Markets Card */}
                <Card variant="elevated" className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <Store className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Fill vendor spots with real slot inventory
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Post your market, create slot types, then add days and counts—vendors reserve instantly.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Slot types with sizes + amenities</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>"Spots left" FOMO on every listing</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Weekly series bookings (4/8/12 weeks)</span>
                    </li>
                  </ul>
                  <Link to="/learn/markets">
                    <Button variant="outline" className="w-full gap-2">
                      Learn more for Markets
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Toggle Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                How it works
              </h2>
              
              <Tabs defaultValue="event-pros" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="event-pros" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Event Pros
                  </TabsTrigger>
                  <TabsTrigger value="markets" className="gap-2">
                    <Store className="w-4 h-4" />
                    Markets
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="event-pros">
                  <Card variant="elevated" className="p-8">
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
                  </Card>
                </TabsContent>
                
                <TabsContent value="markets">
                  <Card variant="elevated" className="p-8">
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
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Trust & Payouts Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-trust mx-auto flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-trust-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Payments that feel professional
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Connect{' '}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help inline-flex items-center gap-1">
                      Stripe
                      <Info className="w-4 h-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Stripe securely handles payouts and identity verification. Your bank info stays with Stripe.</p>
                  </TooltipContent>
                </Tooltip>
                {' '}to accept online payments and receive payouts securely. We never store your bank details.
              </p>
            </div>
          </div>
        </section>

        {/* Fees Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2">
                Transparent fees, simple totals
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Fees help cover payment processing, support, and marketplace operations.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
                <Card variant="elevated" className="p-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Packages</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customers see the platform fee included in their total at checkout. Pros see their net earnings after commission in the dashboard.
                  </p>
                </Card>

                <Card variant="elevated" className="p-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Markets</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vendors see the platform fee included in total at checkout. Market managers receive payouts initiated immediately.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                Frequently asked questions
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to get listed?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create your free profile and publish when you're ready.
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
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg">
                    Learn how it works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ProfileTypeModal 
          open={profileModalOpen} 
          onOpenChange={setProfileModalOpen} 
        />
      </TooltipProvider>
    </Layout>
  );
}
