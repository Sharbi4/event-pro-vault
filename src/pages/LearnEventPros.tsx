import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, Calendar, Clock, CreditCard, 
  CheckCircle, ArrowRight, Zap, Info, MapPin,
  DollarSign, Package, Banknote, Shield, Star,
  Users, Camera, Music, UtensilsCrossed, X
} from 'lucide-react';
import { useState } from 'react';
import { ProfileTypeModal } from '@/components/layout/ProfileTypeModal';
import { useNavigate } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSEO } from '@/hooks/useSEO';
import { generatePageSEO } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const examplePackages = [
  {
    id: 1,
    name: 'Wedding DJ Package',
    provider: 'DJ Marcus',
    pricingType: 'Hourly',
    price: 150,
    minHours: 4,
    rating: 4.9,
    reviews: 127,
    icon: Music,
    includes: ['Professional sound system', 'Wireless microphone', 'Dance floor lighting'],
    badge: 'Instant Book',
    badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 2,
    name: 'Full Day Photography',
    provider: 'Sarah Chen Photography',
    pricingType: 'Daily',
    price: 2500,
    rating: 5.0,
    reviews: 89,
    icon: Camera,
    includes: ['8 hours coverage', '500+ edited photos', 'Online gallery'],
    badge: 'Top Rated',
    badgeColor: 'bg-trust/10 text-trust',
  },
  {
    id: 3,
    name: 'Catering Service',
    provider: 'Gourmet Events Co',
    pricingType: 'Per Guest',
    price: 45,
    minGuests: 50,
    rating: 4.8,
    reviews: 203,
    icon: UtensilsCrossed,
    includes: ['3-course meal', 'Service staff', 'Table settings'],
    badge: null,
    badgeColor: '',
  },
  {
    id: 4,
    name: 'Balloon Arch',
    provider: 'Party Decor Studio',
    pricingType: 'Flat Rate',
    price: 350,
    rating: 4.7,
    reviews: 56,
    icon: Sparkles,
    includes: ['Custom colors', 'Setup included', 'Same-day delivery'],
    badge: 'Popular',
    badgeColor: 'bg-accent/10 text-accent',
  },
  {
    id: 5,
    name: 'Corporate Event Planning',
    provider: 'Elite Events',
    pricingType: 'Custom Quote',
    price: null,
    rating: 4.9,
    reviews: 34,
    icon: Users,
    includes: ['Venue coordination', 'Vendor management', 'Day-of coordination'],
    badge: 'Request Quote',
    badgeColor: 'bg-secondary text-secondary-foreground',
  },
  {
    id: 6,
    name: 'Photo Booth Rental',
    provider: 'Snap & Share',
    pricingType: 'Hourly',
    price: 200,
    minHours: 2,
    rating: 4.6,
    reviews: 78,
    icon: Camera,
    includes: ['Unlimited prints', 'Props included', 'Digital copies'],
    badge: 'Instant Book',
    badgeColor: 'bg-primary/10 text-primary',
  },
];

const steps = [
  { 
    step: 1, 
    title: 'Create your profile', 
    description: 'Add your name/business, bio, categories, service area, and media.' 
  },
  { 
    step: 2, 
    title: 'Create packages', 
    description: 'Add pricing, duration, minimums, included items, setup/breakdown time, and travel rules.' 
  },
  { 
    step: 3, 
    title: 'Set availability per package', 
    description: 'Choose weekly hours, add blocked dates, and keep your calendar accurate.' 
  },
  { 
    step: 4, 
    title: 'Get booked', 
    description: 'Offer Instant Book for immediate confirmation—or review requests before accepting.' 
  },
];

const faqs = [
  {
    q: 'Can I offer cash-only bookings?',
    a: 'Yes. Set your package payment option to "Pay in cash."',
  },
  {
    q: 'Can I offer both cash and online?',
    a: 'Yes. Choose "Both" and customers pick at checkout.',
  },
  {
    q: 'Can I require approval before confirming?',
    a: 'Yes. Set booking mode to "Request to Book."',
  },
  {
    q: 'Do customers see all fees?',
    a: 'Customers see the platform fee included in their total at checkout. Your dashboard shows your earnings after commission.',
  },
];

export default function LearnEventPros() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [examplesModalOpen, setExamplesModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const seo = generatePageSEO('learnEventPros');
  
  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
    keywords: ['become event vendor', 'list event services', 'event pro signup', 'vendor registration'],
  });

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

  const formatPrice = (pkg: typeof examplePackages[0]) => {
    if (pkg.pricingType === 'Custom Quote') {
      return 'Request quote';
    }
    if (pkg.pricingType === 'Hourly') {
      return `$${pkg.price}/hr`;
    }
    if (pkg.pricingType === 'Daily') {
      return `$${pkg.price}/day`;
    }
    if (pkg.pricingType === 'Per Guest') {
      return `$${pkg.price}/guest`;
    }
    return `$${pkg.price}`;
  };

  const formatMinimum = (pkg: typeof examplePackages[0]) => {
    if (pkg.minHours) {
      return `${pkg.minHours} hr min`;
    }
    if (pkg.minGuests) {
      return `${pkg.minGuests} guest min`;
    }
    return null;
  };

  return (
    <Layout>
      <TooltipProvider>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="hero-gradient-bg" />
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumbs */}
            <Breadcrumbs 
              items={[
                { label: 'Learn', href: '/learn' },
                { label: 'For Event Pros' }
              ]} 
              className="mb-6"
            />
            
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">For Event Pros</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Get booked faster with packages that match{' '}
                <span className="gradient-text">real availability.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Customers search by date and time. Your packages appear when they're available—so booking feels instant and reliable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListService}
                >
                  Create your Event Pro profile
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setExamplesModalOpen(true)}
                >
                  See example packages
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Package-first Discovery Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2 flex-wrap">
                    Your packages are what get booked
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Package-level availability means you can offer different hours for different services.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your profile builds trust, but customers choose packages. Each package has its own availability, pricing, and booking rules.
                  </p>
                </div>
                <Card variant="gradient" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Availability Preview</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a time window to see what's available right now.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">Morning (9AM - 12PM)</span>
                      <Badge variant="secondary" className="bg-trust/10 text-trust">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">Afternoon (1PM - 5PM)</span>
                      <Badge variant="secondary" className="bg-trust/10 text-trust">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border opacity-60">
                      <span className="text-sm">Evening (6PM - 10PM)</span>
                      <Badge variant="outline">Booked</Badge>
                    </div>
                  </div>
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
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Booking Control Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4 inline-flex items-center gap-2 justify-center w-full">
                You decide how bookings work
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Use Instant Book for speed. Use Request to Book when you need to confirm details.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mt-10">
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Instant Book</h3>
                      <Badge variant="secondary" className="text-xs">Instant confirmation</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Auto-confirm bookings that match your availability.
                  </p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Request to Book</h3>
                      <Badge variant="outline" className="text-xs">Requires approval</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Review details before you accept.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
                Let customers pay their way
              </h2>
              <p className="text-center text-muted-foreground mb-10">
                Choose payment options per package.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="elevated" className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Pay online</h3>
                  <p className="text-sm text-muted-foreground">
                    Card payments via Stripe
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Requires Stripe</p>
                </Card>

                <Card variant="elevated" className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-trust/10 mx-auto flex items-center justify-center mb-4">
                    <Banknote className="w-6 h-6 text-trust" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Pay in cash</h3>
                  <p className="text-sm text-muted-foreground">
                    At the event
                  </p>
                </Card>

                <Card variant="elevated" className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Both</h3>
                  <p className="text-sm text-muted-foreground">
                    Customer chooses at checkout
                  </p>
                </Card>
              </div>

              <Card variant="gradient" className="p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Accept payments online</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Online payments increase conversion and reduce no-shows.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect Stripe to accept online payments for your packages and give customers more flexibility.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect Stripe
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Travel Radius Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2 flex-wrap">
                    No surprises at the venue
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">If an address is outside your max travel distance, the booking can't proceed.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Customers enter the event address. We validate distance and include any travel pricing before they confirm.
                  </p>
                </div>
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Travel fee preview</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">28 miles away</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Included miles</span>
                      <span className="font-medium">10 miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additional miles</span>
                      <span className="font-medium">18 × $2/mile</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">Travel fee</span>
                      <span className="font-bold text-primary">$36</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Payout Timing Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-trust/10 mx-auto flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-trust" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2 justify-center">
                Payouts begin after the event
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">This timing helps reduce disputes and confirms service completion.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              <p className="text-lg text-muted-foreground">
                For package bookings, payouts are initiated 24 hours after the booking ends.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                Event Pro FAQs
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
                Create your profile today—publish when you're ready
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Set up packages and availability in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListService}
                >
                  List your service
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setProfileModalOpen(true)}
                >
                  Create free profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ProfileTypeModal 
          open={profileModalOpen} 
          onOpenChange={setProfileModalOpen} 
        />

        {/* Example Packages Modal */}
        <Dialog open={examplesModalOpen} onOpenChange={setExamplesModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Example Packages
              </DialogTitle>
              <p className="text-muted-foreground">
                See how different pricing types look to customers browsing EventPro.
              </p>
            </DialogHeader>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {examplePackages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card key={pkg.id} variant="elevated" className="p-4 relative">
                    {pkg.badge && (
                      <Badge className={`absolute top-3 right-3 text-xs ${pkg.badgeColor}`}>
                        {pkg.badge}
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{pkg.provider}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      <span className="text-sm font-medium">{pkg.rating}</span>
                      <span className="text-xs text-muted-foreground">({pkg.reviews})</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(pkg)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {pkg.pricingType}
                      </Badge>
                    </div>
                    
                    {formatMinimum(pkg) && (
                      <p className="text-xs text-muted-foreground mb-3">
                        {formatMinimum(pkg)}
                      </p>
                    )}
                    
                    <div className="space-y-1">
                      {pkg.includes.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-trust shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                      {pkg.includes.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{pkg.includes.length - 2} more
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Supported Pricing Types</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Hourly</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Daily</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Flat Rate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Per Guest</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Per Item</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Custom Quote</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button variant="darkShine" onClick={handleListService} className="gap-2">
                Create your first package
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </Layout>
  );
}
