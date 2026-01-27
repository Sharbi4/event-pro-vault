import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Store, Calendar, CheckCircle, ArrowRight, Info,
  DollarSign, TrendingUp, Repeat, Zap, Shield,
  LayoutGrid, Users
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
import { Progress } from '@/components/ui/progress';
import { useSEO } from '@/hooks/useSEO';
import { generatePageSEO } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const slotTypeExamples = [
  { name: '10×10 Booth', description: 'Power available, high foot-traffic' },
  { name: 'Food Truck Spot', description: 'Extra space, easy load-in' },
  { name: 'Premium Corner', description: 'Best visibility' },
  { name: 'Indoor Stall', description: 'Weather-proof option' },
];

const faqs = [
  {
    q: 'Can I run weekly or biweekly markets?',
    a: 'Yes. Add inventory using weekly or biweekly recurrence.',
  },
  {
    q: 'Can I create multiple slot sizes?',
    a: 'Yes. Slot types let you offer different sizes/amenities at different prices.',
  },
  {
    q: 'What happens when spots sell out?',
    a: 'The listing shows sold out for that date/time and highlights the next available opening.',
  },
  {
    q: 'Can vendors reserve multiple weeks?',
    a: 'Yes. Vendors can reserve 4/8/12-week series in one checkout.',
  },
];

export default function LearnMarkets() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const seo = generatePageSEO('learnMarkets');
  
  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
    keywords: ['market manager', 'vendor spots', 'farmers market booking', 'event space rental'],
  });

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
            {/* Breadcrumbs */}
            <Breadcrumbs 
              items={[
                { label: 'Learn', href: '/learn' },
                { label: 'For Markets' }
              ]} 
              className="mb-6"
            />
            
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
                <Store className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">For Markets</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Fill vendor spots with real inventory—
                <span className="gradient-text">no back-and-forth.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create slot types, post market days, and let vendors reserve instantly. Show "spots left" to drive faster decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListMarket}
                >
                  Create your Market page
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Slot Types Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4 inline-flex items-center gap-2 justify-center w-full">
                Sell different spot options with slot types
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Slot types let you price different sizes and perks without creating separate listings.</p>
                  </TooltipContent>
                </Tooltip>
              </h2>
              <p className="text-center text-muted-foreground mb-10">
                Create options for booths, trucks, premium corners, indoor stalls—each with size, amenities, and pricing.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {slotTypeExamples.map((slot, idx) => (
                  <Card key={idx} variant="elevated" className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <LayoutGrid className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{slot.name}</h3>
                    <p className="text-sm text-muted-foreground">{slot.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Calendar Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2 flex-wrap">
                    Post days. Set counts. Watch spots fill.
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Your listing only shows as "available" when you've posted inventory.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Add inventory for specific dates and time windows. Weekly, biweekly, or custom—your choice.
                  </p>
                </div>
                <Card variant="gradient" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Add Saturday 8–1</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">Booth spots</span>
                      <Badge variant="secondary">40 available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">Truck spots</span>
                      <Badge variant="secondary">12 available</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Publish and start receiving reservations.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FOMO Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Create urgency automatically
                </h2>
                <p className="text-lg text-muted-foreground">
                  Every market listing shows remaining spots and a progress bar so vendors can act fast.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-destructive" />
                    <Badge variant="destructive" className="text-xs">Only 8 spots left</Badge>
                  </div>
                  <Progress value={80} className="h-2 mb-3" />
                  <p className="text-sm text-muted-foreground">32 of 40 spots filled</p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-warning" />
                    <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">Selling fast</Badge>
                  </div>
                  <Progress value={65} className="h-2 mb-3" />
                  <p className="text-sm text-muted-foreground">26 of 40 spots filled</p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">Sold out</Badge>
                  </div>
                  <Progress value={100} className="h-2 mb-3" />
                  <p className="text-sm text-muted-foreground">Next available: Jan 29</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Recurring Weekly Series Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 inline-flex items-center gap-2 flex-wrap">
                    Let vendors reserve their spot every week
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Full series upfront</p>
                        <p className="text-sm">Vendors pay once for the entire series. We reserve their spot for each week included.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Vendors can book a weekly series in one checkout—4, 8, or 12 weeks.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Choose a duration and we'll confirm availability for every week before checkout.
                  </p>
                </div>
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Weekly Series</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border-2 border-accent">
                      <span className="text-sm font-medium">4 weeks</span>
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">8 weeks</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <span className="text-sm">12 weeks</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Payments & Payout Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-trust/10 mx-auto flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-trust" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Simple checkout. Faster payouts.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vendors pay online and see the platform fee included in their total at checkout. Market manager payouts are initiated immediately after booking.
              </p>

              <Card variant="gradient" className="p-6 max-w-xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-trust/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-trust" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Set up payouts</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Stripe securely handles payouts and verification. We never store bank details.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect Stripe to receive market payouts securely.
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

        {/* FAQ Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                Markets FAQs
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
        <section className="py-20 lg:py-28 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Create your market listing—then add your first market day
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Slot types + inventory = instant vendor reservations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="darkShine" 
                  size="lg"
                  onClick={handleListMarket}
                >
                  List a market
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
      </TooltipProvider>
    </Layout>
  );
}
