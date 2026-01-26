import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, HelpCircle, MessageCircle, ArrowRight, 
  Sparkles, ShoppingBag, CreditCard, RotateCcw,
  User, Store, Shield, Settings, Headphones, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZendeskWidget } from '@/components/shared/ZendeskWidget';

type FAQCategory = 
  | 'getting-started'
  | 'booking-packages'
  | 'paying-fees'
  | 'cancellations'
  | 'event-pros'
  | 'markets'
  | 'trust-safety'
  | 'account'
  | 'support';

interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
  hasTooltip?: string;
}

const categories: { id: FAQCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'getting-started', name: 'Getting Started', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'booking-packages', name: 'Booking Packages', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'paying-fees', name: 'Paying & Fees', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'cancellations', name: 'Cancellations & Refunds', icon: <RotateCcw className="w-4 h-4" /> },
  { id: 'event-pros', name: 'Event Pros', icon: <User className="w-4 h-4" /> },
  { id: 'markets', name: 'Markets', icon: <Store className="w-4 h-4" /> },
  { id: 'trust-safety', name: 'Trust & Safety', icon: <Shield className="w-4 h-4" /> },
  { id: 'account', name: 'Account & Profile', icon: <Settings className="w-4 h-4" /> },
  { id: 'support', name: 'Support', icon: <Headphones className="w-4 h-4" /> },
];

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'getting-started',
    question: 'Do I need an account to browse?',
    answer: 'No. You can browse packages and markets without an account. You\'ll only need to sign in when you\'re ready to book, reserve a spot, message, or create a profile.',
  },
  {
    category: 'getting-started',
    question: 'What\'s the difference between Event Services and Market Spaces?',
    answer: 'Event Services are bookable packages (food trucks, photographers, DJs, bartenders, rentals, performers). Market Spaces are markets that sell vendor spots using slot inventory.',
  },
  {
    category: 'getting-started',
    question: 'How does search work on EventPro?',
    answer: 'Search is availability-first. You search by date/time and location, and we show packages (or market spots) that are available for that window.',
    hasTooltip: 'availability-first',
  },
  {
    category: 'getting-started',
    question: 'Can I be both an Event Pro and a Market Manager?',
    answer: 'Yes. You can create both profiles and switch between modes from your dashboard menu.',
  },
  // Booking Packages
  {
    category: 'booking-packages',
    question: 'What am I booking—an Event Pro or a package?',
    answer: 'You\'re booking the package. Packages contain the pricing, duration, included items, and availability rules that determine whether it shows up in your search.',
  },
  {
    category: 'booking-packages',
    question: 'How do I know a package is available for my event time?',
    answer: 'If a package appears in your results for the date/time you selected, it\'s available for that window. On the package page, you can also confirm date/time before booking.',
  },
  {
    category: 'booking-packages',
    question: 'What information do I need to book a package?',
    answer: 'Typically: your name, phone/email, event details, and the event address. If the Event Pro has travel rules, we validate the address and include any travel pricing before you confirm.',
  },
  {
    category: 'booking-packages',
    question: 'Can I pay online or in cash?',
    answer: 'It depends on the package. Event Pros can offer: Pay online (card), Pay in cash, or Both (you choose at checkout).',
  },
  {
    category: 'booking-packages',
    question: 'What\'s the difference between Instant Book and Request to Book?',
    answer: 'Instant Book confirms your booking immediately. Request to Book sends the Event Pro a request to approve before it\'s confirmed.',
    hasTooltip: 'instant-book',
  },
  {
    category: 'booking-packages',
    question: 'When is my booking confirmed?',
    answer: 'Instant Book confirms immediately. Request to Book confirms when the Event Pro accepts your request.',
  },
  // Paying & Fees
  {
    category: 'paying-fees',
    question: 'Is there a platform fee?',
    answer: 'Yes. A 12.9% fee is included in your total at checkout to cover payment processing and platform services.',
    hasTooltip: 'platform-fee',
  },
  {
    category: 'paying-fees',
    question: 'How do online payments work?',
    answer: 'Online payments are processed securely through Stripe. If a package offers Pay Online, you\'ll pay at checkout using a card.',
    hasTooltip: 'stripe',
  },
  {
    category: 'paying-fees',
    question: 'Are taxes included?',
    answer: 'Taxes may apply depending on location and service type. If applicable, taxes will be shown before you confirm payment.',
  },
  {
    category: 'paying-fees',
    question: 'What happens if I choose "Pay in cash"?',
    answer: 'Your booking is confirmed (Instant Book) or requested (Request to Book) without online payment. You\'ll pay the Event Pro directly at the event based on the package terms.',
  },
  // Cancellations & Refunds
  {
    category: 'cancellations',
    question: 'What is your cancellation policy?',
    answer: 'Each package or market may have its own cancellation terms. You\'ll see the cancellation terms during the booking review step before you confirm.',
  },
  {
    category: 'cancellations',
    question: 'Can I get a refund if I cancel?',
    answer: 'Refund eligibility depends on the cancellation terms for that booking and how close the cancellation is to the event date/time.',
  },
  {
    category: 'cancellations',
    question: 'What if the Event Pro cancels?',
    answer: 'If an Event Pro cancels an online-paid booking, you\'ll be notified and refunds (if applicable) will be processed back to your original payment method based on the booking terms.',
  },
  {
    category: 'cancellations',
    question: 'What if there\'s a dispute?',
    answer: 'Contact support from your booking receipt page or dashboard. We\'ll review the details and help resolve it.',
  },
  // Event Pros
  {
    category: 'event-pros',
    question: 'How do I become an Event Pro?',
    answer: 'Click Create free profile, choose Event Pro, sign in, and complete your profile. Then create packages and set availability per package.',
  },
  {
    category: 'event-pros',
    question: 'Do I need Stripe to get booked?',
    answer: 'You can accept cash-only bookings without Stripe. To accept online payments, you must connect Stripe.',
    hasTooltip: 'stripe',
  },
  {
    category: 'event-pros',
    question: 'Can I offer both online and cash payments?',
    answer: 'Yes. Set the package payment option to Both, and customers choose at checkout.',
  },
  {
    category: 'event-pros',
    question: 'Can I require approval before confirming bookings?',
    answer: 'Yes. Set booking mode to Request to Book for that package.',
    hasTooltip: 'request-to-book',
  },
  {
    category: 'event-pros',
    question: 'How does travel distance and travel fee work?',
    answer: 'You set a travel radius and (optionally) a per-mile travel fee. Customers enter their address, and we validate distance and include travel pricing before booking is confirmed.',
  },
  {
    category: 'event-pros',
    question: 'What fees do I pay as an Event Pro?',
    answer: 'A 12.9% platform commission is deducted from your earnings. This covers platform services, support, and secure payment processing.',
  },
  {
    category: 'event-pros',
    question: 'When do I get paid for package bookings?',
    answer: 'For package bookings, payouts are initiated 24 hours after the booking/event ends (for online payments).',
  },
  // Markets
  {
    category: 'markets',
    question: 'How do markets work on EventPro?',
    answer: 'Markets list slot types (sizes/amenities) and post inventory days (weekly/biweekly/custom). Vendors reserve available spots instantly.',
  },
  {
    category: 'markets',
    question: 'What is a slot type?',
    answer: 'A slot type is a spot option you sell—like "10×10 Booth," "Food Truck Spot," or "Premium Corner"—with size, amenities, and pricing.',
  },
  {
    category: 'markets',
    question: 'How do I post inventory for my market?',
    answer: 'In your Market Dashboard, add dates/times and set how many spots are available per slot type. Your listing shows "spots left" based on remaining inventory.',
  },
  {
    category: 'markets',
    question: 'Can vendors book recurring weekly spots?',
    answer: 'Yes. Vendors can reserve weekly series like 4 / 8 / 12 weeks in one checkout.',
    hasTooltip: 'weekly-series',
  },
  {
    category: 'markets',
    question: 'What does "weekly series paid upfront" mean?',
    answer: 'It means the vendor pays once for the full series and their spot is reserved each week included.',
    hasTooltip: 'weekly-series',
  },
  {
    category: 'markets',
    question: 'What fees do market managers pay?',
    answer: 'A 12.9% platform commission is deducted from your slot price, plus Stripe processing fees (~2.9% + $0.30). This covers platform services, support, and secure payments.',
  },
  {
    category: 'markets',
    question: 'When do market managers get paid?',
    answer: 'For market slot reservations, payouts are initiated 24 hours after the event date (for online payments), once Stripe is connected.',
  },
  // Trust & Safety
  {
    category: 'trust-safety',
    question: 'Is online payment secure?',
    answer: 'Yes. Payments are processed via Stripe. We do not store your card or bank details.',
    hasTooltip: 'stripe',
  },
  {
    category: 'trust-safety',
    question: 'How do you verify providers?',
    answer: 'We use profile information, activity, and payout verification. Additional verification and badges may be added as the marketplace grows.',
  },
  {
    category: 'trust-safety',
    question: 'Can I message before booking?',
    answer: 'Yes (if enabled). Messaging helps confirm details and reduce surprises.',
  },
  // Account & Profile
  {
    category: 'account',
    question: 'I signed up—what happens next?',
    answer: 'You\'ll be directed to the dashboard that matches your selection (Event Pro or Market Manager) to complete onboarding.',
  },
  {
    category: 'account',
    question: 'Can I switch between vendor and market manager?',
    answer: 'Yes. Use the mode switcher in your dashboard menu.',
  },
  {
    category: 'account',
    question: 'Can I delete my profile?',
    answer: 'You can remove your listing visibility and request deletion from support if needed.',
  },
  // Support
  {
    category: 'support',
    question: 'How do I contact support?',
    answer: 'Use the support link in your dashboard or the help button on booking pages. Include your booking ID for fastest help.',
  },
  {
    category: 'support',
    question: 'What hours is support available?',
    answer: 'Support is available for urgent booking issues. Most requests are answered quickly during business hours.',
  },
];

const popularQuestions = [
  { question: 'How do I book a package?', category: 'booking-packages' as FAQCategory },
  { question: 'How do market spot reservations work?', category: 'markets' as FAQCategory },
  { question: 'How do payouts work?', category: 'event-pros' as FAQCategory },
  { question: 'What fees are charged?', category: 'paying-fees' as FAQCategory },
  { question: 'What\'s the cancellation policy?', category: 'cancellations' as FAQCategory },
];

const tooltipContent: Record<string, string> = {
  'availability-first': 'Results match your selected date/time—only what\'s actually available shows up.',
  'platform-fee': 'This fee supports payment processing, support, and marketplace operations.',
  'instant-book': 'Booking is confirmed immediately when it matches availability.',
  'request-to-book': 'Booking confirms after the Event Pro approves.',
  'weekly-series': 'Pay once to reserve your spot for every week in the series.',
  'stripe': 'Stripe securely handles payouts and verification. We never store bank details.',
};

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    const groups: Record<FAQCategory, FAQItem[]> = {
      'getting-started': [],
      'booking-packages': [],
      'paying-fees': [],
      'cancellations': [],
      'event-pros': [],
      'markets': [],
      'trust-safety': [],
      'account': [],
      'support': [],
    };

    filteredFAQs.forEach(faq => {
      groups[faq.category].push(faq);
    });

    return groups;
  }, [filteredFAQs]);

  const handleQuickLink = (category: FAQCategory) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const renderTooltip = (tooltipKey: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center ml-1 text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{tooltipContent[tooltipKey]}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <Layout>
      {/* Zendesk Chat Widget */}
      <ZendeskWidget />
      
      <div className="min-h-screen bg-background pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary/50 to-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find answers fast. If you need help, our support team is here.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions, payouts, fees, booking, markets…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-card border-border"
                />
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Quick links:</span>
                <button
                  onClick={() => handleQuickLink('booking-packages')}
                  className="text-primary hover:underline"
                >
                  How do I book a package?
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => handleQuickLink('markets')}
                  className="text-primary hover:underline"
                >
                  How do market spots work?
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => handleQuickLink('paying-fees')}
                  className="text-primary hover:underline"
                >
                  What fees are charged?
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Chips */}
        <div className="sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                )}
              >
                <HelpCircle className="w-4 h-4" />
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  )}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* FAQ Accordions */}
            <div className="flex-1 min-w-0">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or browse by category.
                  </p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                    Clear filters
                  </Button>
                </div>
              ) : selectedCategory === 'all' ? (
                // Show grouped by category
                <div className="space-y-8">
                  {categories.map((cat) => {
                    const categoryFAQs = groupedFAQs[cat.id];
                    if (categoryFAQs.length === 0) return null;

                    return (
                      <div key={cat.id}>
                        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground mb-4">
                          {cat.icon}
                          {cat.name}
                        </h2>
                        <Accordion type="single" collapsible className="space-y-2">
                          {categoryFAQs.map((faq, index) => (
                            <AccordionItem
                              key={index}
                              value={`${cat.id}-${index}`}
                              className="border border-border rounded-lg px-4 bg-card"
                            >
                              <AccordionTrigger className="text-left hover:no-underline py-4">
                                <span className="font-medium text-foreground pr-4">
                                  {faq.question}
                                  {faq.hasTooltip && renderTooltip(faq.hasTooltip)}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground pb-4">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Show single category
                <div>
                  <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground mb-4">
                    {categories.find(c => c.id === selectedCategory)?.icon}
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`faq-${index}`}
                        className="border border-border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium text-foreground pr-4">
                            {faq.question}
                            {faq.hasTooltip && renderTooltip(faq.hasTooltip)}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right Sidebar (Desktop) */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-40 space-y-6">
                {/* Popular Questions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Popular Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {popularQuestions.map((q, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleQuickLink(q.category)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                          >
                            {q.question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card className="bg-secondary/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Need more help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Our support team is ready to assist you with any questions.
                    </p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Headphones className="w-4 h-4" />
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Band */}
        <section className="bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-8">
                Create a free profile or explore how EventPro works.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?intent=signup">
                  <Button variant="darkShine" size="lg" className="gap-2">
                    Create free profile
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="outline" size="lg">
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Contact Support (shown at bottom on mobile) */}
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2"
            onClick={() => window.open('https://support.zendesk.com', '_blank')}
          >
            <MessageCircle className="w-5 h-5" />
            Support
          </Button>
        </div>
      </div>
    </Layout>
  );
}
