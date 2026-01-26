import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, Calendar, Clock, CreditCard, 
  CheckCircle, ArrowRight, Zap, Shield, Info
} from 'lucide-react';
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
import { AvailabilityDemoWidget } from '@/components/learn/AvailabilityDemoWidget';

// Import service category images
import cateringImage from '@/assets/learn/catering-hero.jpg';
import weddingCakeImage from '@/assets/learn/wedding-cake.jpg';
import photographerImage from '@/assets/learn/photographer-action.jpg';
import bartenderImage from '@/assets/learn/mobile-bartender.jpg';

// Service category showcase data
const serviceShowcase = [
  { name: 'Catering', image: cateringImage, label: 'Gourmet Catering' },
  { name: 'Cakes', image: weddingCakeImage, label: 'Wedding Cakes' },
  { name: 'Photography', image: photographerImage, label: 'Event Photography' },
  { name: 'Bartending', image: bartenderImage, label: 'Mobile Bartenders' },
];

const eventProSteps = [
  { step: 1, title: 'Create your profile', description: 'Add your name/business, bio, categories, service area, and media.' },
  { step: 2, title: 'Publish packages', description: 'Set up your services with pricing, duration, and inclusions.' },
  { step: 3, title: 'Set availability per package', description: 'Define your schedule and booking preferences for each package.' },
  { step: 4, title: 'Get booked and paid', description: 'Customers find you and book directly with secure payments.' },
];

const faqs = [
  {
    q: 'Do I need an account to browse?',
    a: 'Nope. Browse freely—create an account when you\'re ready to book or list your services.',
  },
  {
    q: 'What makes EventPro different?',
    a: 'Availability-first search. You don\'t just find vendors—you find packages that are actually available for your date and time.',
  },
  {
    q: 'How do I get started as an Event Pro?',
    a: 'Create your free profile, add your packages with pricing and availability, then publish when you\'re ready to receive bookings.',
  },
  {
    q: 'Can I offer both online and cash payments?',
    a: 'Yes. Choose "Both" and customers can pick their preferred payment method at checkout.',
  },
];

export default function Learn() {
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

  return (
    <Layout>
      <TooltipProvider>
        {/* Hero Section with Service Images */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="hero-gradient-bg" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
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
                —bookable packages from trusted event professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListService}
                >
                  Become an Event Pro
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Link to="/">
                  <Button variant="outline" size="lg">
                    Browse packages
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Service Category Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {serviceShowcase.map((service) => (
                <div 
                  key={service.name}
                  className="relative group overflow-hidden rounded-xl aspect-[4/3] shadow-lg"
                >
                  <img 
                    src={service.image} 
                    alt={service.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-white font-medium text-sm">{service.label}</span>
                  </div>
                </div>
              ))}
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

        {/* Features Section with Inline Images */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
                Why Event Pros choose EventPro
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Turn your service into bookable packages with flexible pricing and booking options.
              </p>
              
              {/* Image Banner */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="relative overflow-hidden rounded-xl aspect-video">
                  <img 
                    src={photographerImage} 
                    alt="Event photographer capturing moments"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">Photographers</p>
                    <p className="text-sm opacity-80">Capture every moment</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl aspect-video">
                  <img 
                    src={cateringImage} 
                    alt="Professional catering setup"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">Caterers</p>
                    <p className="text-sm opacity-80">Delicious food service</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card variant="elevated" className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Availability-first discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Your packages appear when you're actually available. No more back-and-forth scheduling.
                  </p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Instant or request booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose Instant Book for auto-confirmation or Request to Book when you need to review first.
                  </p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Flexible payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept online payments, cash, or both. Connect Stripe for secure online transactions.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
                How it works
              </h2>
              
              <Card variant="elevated" className="p-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {eventProSteps.map((step) => (
                    <div key={step.step} className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4">
                        {step.step}
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="text-center mt-8">
                <Link to="/learn/event-pros">
                  <Button variant="outline" className="gap-2">
                    Learn more about becoming an Event Pro
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Payouts Section with Images */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Images */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative overflow-hidden rounded-xl aspect-square">
                    <img 
                      src={weddingCakeImage} 
                      alt="Beautiful wedding cake"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-xl aspect-square mt-8">
                    <img 
                      src={bartenderImage} 
                      alt="Mobile bartender at event"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center lg:text-left">
                  <div className="w-12 h-12 rounded-xl bg-trust mx-auto lg:mx-0 flex items-center justify-center mb-4">
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
                  <p className="text-muted-foreground">
                    Whether you're a baker creating stunning cakes or a mobile bartender crafting cocktails, 
                    get paid seamlessly for every booking.
                  </p>
                </div>
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
                Ready to get booked?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create your Event Pro profile and start receiving bookings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListService}
                >
                  Become an Event Pro
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Link to="/">
                  <Button variant="outline" size="lg">
                    Browse packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </TooltipProvider>
    </Layout>
  );
}
