import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  User, Shield, Settings, Headphones, Info,
  CalendarCheck, MapPin, CheckCircle2, CreditCard as CardIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZendeskWidget } from '@/components/shared/ZendeskWidget';
import { useSEO } from '@/hooks/useSEO';
import { FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { generatePageSEO } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

type FAQCategory = 
  | 'getting-started'
  | 'booking-packages'
  | 'paying-fees'
  | 'cancellations'
  | 'event-pros'
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
  { id: 'trust-safety', name: 'Trust & Safety', icon: <Shield className="w-4 h-4" /> },
  { id: 'account', name: 'Account & Profile', icon: <Settings className="w-4 h-4" /> },
  { id: 'support', name: 'Support', icon: <Headphones className="w-4 h-4" /> },
];

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'getting-started',
    question: 'Do I need an account to browse?',
    answer: 'No. You can browse packages, vendors, and markets without an account. You only need to sign in when you\'re ready to book, message a pro, save favorites, or create your own profile.',
  },
  {
    category: 'getting-started',
    question: 'How does search work on EventPro?',
    answer: 'Search is availability-first. Steps:\n1. Pick a category (e.g., Food Trucks, Catering, Bartending).\n2. Enter your event location (city or full address).\n3. Choose a date and a start time — we auto-set a 3-hour window you can adjust.\n4. Optionally add guest count and cuisine.\n5. Hit Search — only packages truly available for that exact window appear, ranked by trust + distance.',
    hasTooltip: 'availability-first',
  },
  {
    category: 'getting-started',
    question: 'Step-by-step: How do I find and book my first vendor?',
    answer: '1. From the homepage, use the search bar (or tap "Let AI help me choose" for guided picks).\n2. Browse the results grid — toggle Map view to see proximity.\n3. Tap a package card to open the split-screen detail view (gallery + summary).\n4. Review pricing, what\'s included, travel range, and the cancellation policy badge.\n5. Tap "Book" or "Request to Book" — sign in if you haven\'t already.\n6. Complete the 5-step checkout drawer: details → add-ons → questions → policy → payment.\n7. You\'ll get a confirmation email with your receipt and an "Add to Calendar" link.',
  },
  // Booking Packages
  {
    category: 'booking-packages',
    question: 'What am I booking — an Event Pro or a package?',
    answer: 'You\'re booking the package. Each package contains its own pricing, duration, included items, travel rules, and availability. A single Event Pro can offer multiple packages (e.g., a 2-hour pull-up vs. a full catering buildout).',
  },
  {
    category: 'booking-packages',
    question: 'How do I know a package is truly available for my time?',
    answer: 'If a package shows up in your filtered search, it\'s available. We cross-check the pro\'s calendar against:\n• Other confirmed bookings (including setup + cleanup buffers)\n• Their weekly availability rules\n• Any blocked dates\n• Their travel radius from your address\n\nOn the package page, the calendar widget will show your selected slot in green if it\'s still open.',
  },
  {
    category: 'booking-packages',
    question: 'What information do I need to book a package?',
    answer: 'Have ready:\n• Your name, email, and phone number\n• Full event address (street + city + ZIP)\n• Event start time and duration\n• Guest count (helps the pro plan portions/setup)\n• Any custom questions the pro requires (e.g., dietary restrictions, parking access, power source)\n\nIf the pro charges travel beyond their free radius, we\'ll calculate and show the travel fee before you confirm.',
  },
  {
    category: 'booking-packages',
    question: 'Can I pay online or in cash?',
    answer: 'It depends on the package. Pros choose one of:\n• Pay online (card via Stripe) — fastest, fully tracked\n• Pay in cash — you pay the pro at the event\n• Both — you pick at checkout\n\nThe accepted payment methods are shown on every package card.',
  },
  {
    category: 'booking-packages',
    question: 'What\'s the difference between Instant Book and Request to Book?',
    answer: 'Instant Book confirms your booking immediately — your card is charged, the slot is locked, and the pro is notified. Request to Book sends the pro a request; they have 24 hours to accept. If accepted, your card is charged. If declined or not answered in 24h, you owe nothing.',
    hasTooltip: 'instant-book',
  },
  {
    category: 'booking-packages',
    question: 'When is my booking confirmed?',
    answer: 'Instant Book: confirmed the moment payment succeeds. Request to Book: confirmed when the pro accepts (you\'ll get an email + in-app notification). Until accepted, the slot is held for you for up to 24 hours.',
  },
  {
    category: 'booking-packages',
    question: 'Can I message the Event Pro before booking?',
    answer: 'Yes. From any package or vendor page, tap "Message". You can ask about menu customizations, setup needs, or timing. To keep transactions on-platform and protected, contact info (phone, email, links) is masked in the chat until a booking is confirmed.',
  },
  {
    category: 'booking-packages',
    question: 'Step-by-step: How does checkout work?',
    answer: 'Checkout is a 5-step spatial drawer:\n1. Event Details — confirm date, time, address, guest count.\n2. Add-Ons — pick optional extras the pro offers (extra hour, premium menu, etc.).\n3. Questions — answer the pro\'s required + optional questions.\n4. Cancellation Policy — review and acknowledge Flexible/Standard/Strict terms.\n5. Payment — pay online via card, or confirm cash arrangement.\n\nYour slot is held for 15 minutes while you complete checkout.',
  },
  // Paying & Fees
  {
    category: 'paying-fees',
    question: 'Is there a platform fee?',
    answer: 'Yes. A 12.9% service fee is included in your total at checkout. It covers secure payment processing, customer support, dispute protection, and platform operations. Bookers see it as a service fee included in the total; pros see it as a 12.9% commission deducted from payouts.',
    hasTooltip: 'platform-fee',
  },
  {
    category: 'paying-fees',
    question: 'How do online payments work?',
    answer: 'Online payments are processed securely via Stripe. Steps:\n1. At checkout, enter your card details (or use Apple Pay / Google Pay if available).\n2. We capture the full amount immediately for Instant Book, or place a hold for Request to Book.\n3. Funds are held in escrow until 24 hours after your event ends.\n4. After the 24-hour window (with no disputes), the pro is paid out automatically.\n\nWe never store your card details — Stripe handles all PCI-compliant data.',
    hasTooltip: 'stripe',
  },
  {
    category: 'paying-fees',
    question: 'Are taxes included?',
    answer: 'Sales tax may apply depending on the service type and your state/city. If applicable, tax is itemized in the order summary before you confirm — never a surprise.',
  },
  {
    category: 'paying-fees',
    question: 'What happens if I choose "Pay in cash"?',
    answer: 'Your booking is confirmed (or requested) without an online charge. You pay the pro directly at the event in cash. The platform fee on cash bookings is collected separately if applicable. Cash bookings still appear in your dashboard with a receipt and reminders.',
  },
  {
    category: 'paying-fees',
    question: 'Are deposits required?',
    answer: 'Some packages require a non-refundable deposit (typically 20–50% of total) to lock the date. The deposit is shown clearly during checkout. The balance is charged automatically 7 days before the event for online bookings, or paid at the event for cash bookings.',
  },
  // Cancellations & Refunds
  {
    category: 'cancellations',
    question: 'What is your cancellation policy?',
    answer: 'Each package uses one of three standard policies, shown clearly on every listing:\n\n• Flexible — Full refund 48+ hours out, 50% refund 24–48 hours out, no refund <24 hours.\n• Standard (default) — Full refund 7+ days out, 50% refund 3–7 days, no refund <72 hours.\n• Strict — Full refund 14+ days out, 50% refund 7–14 days, no refund <7 days.\n\nThe exact refund amount appears at checkout before you confirm.',
  },
  {
    category: 'cancellations',
    question: 'Step-by-step: How do I cancel a booking?',
    answer: '1. Go to your Dashboard → Bookings.\n2. Open the booking you want to cancel.\n3. Tap "Cancel booking" — we\'ll show your exact refund amount based on the package policy and how close the event is.\n4. Confirm. Refunds to the original card take 5–10 business days.\n5. The pro is notified immediately and the slot is freed up.',
  },
  {
    category: 'cancellations',
    question: 'Can I get a refund if I cancel?',
    answer: 'Refund eligibility depends on the package\'s cancellation policy and how far out the event is. The exact amount is calculated and shown before you confirm cancellation. Deposits follow special rules (see deposit FAQ).',
  },
  {
    category: 'cancellations',
    question: 'Is there a deposit? Is it refundable?',
    answer: 'Some packages require a deposit. Deposits are non-refundable by default, with two exceptions:\n1. If the Event Pro cancels — your deposit is refunded in full.\n2. Grace period — if you cancel within 1 hour of booking AND your event is 7+ days away, your deposit is refunded.',
    hasTooltip: 'deposit-refund',
  },
  {
    category: 'cancellations',
    question: 'What happens to the rest of my payment if I cancel?',
    answer: 'The remaining balance follows the package\'s policy (Flexible/Standard/Strict). Refund amounts are calculated automatically and shown at the time of cancellation.',
  },
  {
    category: 'cancellations',
    question: 'Are platform fees refundable?',
    answer: 'If you cancel, the 12.9% platform fee is not refunded. If the Event Pro cancels, the platform fee is fully refunded along with everything else.',
    hasTooltip: 'platform-fee-refund',
  },
  {
    category: 'cancellations',
    question: 'When does the Event Pro get paid?',
    answer: 'For online payments, funds are held in escrow and payouts initiate 24 hours after the booking/event ends. This buffer allows time to report any service issues before money moves.',
    hasTooltip: 'payout-timing',
  },
  {
    category: 'cancellations',
    question: 'Step-by-step: What if there\'s an issue with the service?',
    answer: '1. Open the booking in your Dashboard.\n2. Tap "Report an issue" — must be done within 24 hours of the event ending for online bookings.\n3. Describe what happened and upload photos/videos as evidence.\n4. The payout is automatically paused while we review.\n5. Our team reviews within 1–2 business days and may issue a partial or full refund.\n6. Both parties are notified of the resolution.',
    hasTooltip: 'issue-reporting',
  },
  {
    category: 'cancellations',
    question: 'What if the Event Pro cancels?',
    answer: 'You receive a full refund — including any deposit and the platform fee. We notify you immediately, surface alternative pros for your date, and help you rebook. The pro\'s cancellation rate is tracked and affects their ranking.',
  },
  {
    category: 'cancellations',
    question: 'Can Event Pros set custom cancellation policies?',
    answer: 'Not at launch. We use three standardized templates (Flexible, Standard, Strict) so customers can quickly compare options without surprises. We may add custom policies for established pros in the future.',
  },
  {
    category: 'cancellations',
    question: 'How do cash payments work with refunds?',
    answer: 'Cash bookings follow the same cancellation timing rules, but the actual refund (if applicable) is handled directly between you and the pro since no money has moved through the platform yet. Deposits paid online for cash bookings follow the standard refund rules.',
    hasTooltip: 'cash-refunds',
  },
  {
    category: 'cancellations',
    question: 'What if there\'s a dispute we can\'t resolve?',
    answer: 'Open a formal dispute from your booking page. Both sides upload evidence (messages, photos, contracts). Our team reviews within 1–2 business days and issues a binding decision. Payouts stay paused until resolved.',
  },
  // Event Pros
  {
    category: 'event-pros',
    question: 'Step-by-step: How do I become an Event Pro?',
    answer: '1. Click "Become a Pro" in the header.\n2. Sign up with email or Google.\n3. Choose your category (Food Truck, Caterer, Bartender, etc.).\n4. Complete your profile: business name, bio, service area, photos, social links.\n5. Connect Stripe (3-min flow) to accept online payments — optional if you only want cash bookings.\n6. Build your first package using the wizard: pricing, duration, what\'s included, photos, availability rules.\n7. Set your weekly availability and any blocked dates.\n8. Submit for admin review (most listings approved within 24 hours).\n9. Once approved, your packages go live and you\'ll appear in search results.',
  },
  {
    category: 'event-pros',
    question: 'Step-by-step: How do I create a package?',
    answer: 'Open Dashboard → Packages → New Package. The wizard walks you through:\n1. Type — Pull-Up Booking (food truck style) or Catering Package (full service).\n2. Basics — name, description, category, photos.\n3. Pricing — flat, hourly, daily, or per-person; min/max guests.\n4. Time & Buffers — duration, setup minutes, cleanup minutes (live calendar preview shows what gets blocked).\n5. Travel — free radius, per-mile fee beyond.\n6. Customer Questions — pick required vs. optional intake questions.\n7. Cancellation Policy — Flexible / Standard / Strict.\n8. Booking Mode — Instant Book or Request to Book (default is Request).\n9. Status — Draft, Published, Paused, or Archived.\n\nThe wizard is fully mobile-friendly with a sticky next/back bar.',
  },
  {
    category: 'event-pros',
    question: 'Do I need Stripe to get booked?',
    answer: 'You can accept cash-only bookings without Stripe. To accept online payments (recommended — most customers prefer it), connect Stripe in Dashboard → Settings → Payments. The Stripe onboarding takes about 3 minutes.',
    hasTooltip: 'stripe',
  },
  {
    category: 'event-pros',
    question: 'Can I offer both online and cash payments?',
    answer: 'Yes. Set a package\'s payment option to "Both" and customers pick at checkout. This typically increases bookings by 15–25% vs. cash-only.',
  },
  {
    category: 'event-pros',
    question: 'Can I require approval before confirming bookings?',
    answer: 'Yes — set the package booking mode to "Request to Book". You have 24 hours to accept or decline each request. Pull-up packages default to Request to Book; we recommend Instant Book for high-volume packages with stable availability.',
    hasTooltip: 'request-to-book',
  },
  {
    category: 'event-pros',
    question: 'How does travel distance and travel fee work?',
    answer: 'Per package, you set:\n• Free travel radius (miles from your base address)\n• Per-mile fee for travel beyond the free radius\n• Maximum travel distance (hard cap)\n\nWhen a customer enters their address, we calculate the actual driving distance and add the travel fee to their quote before they confirm. You see the breakdown in your booking dashboard.',
  },
  {
    category: 'event-pros',
    question: 'What fees do I pay as an Event Pro?',
    answer: 'A flat 12.9% commission is deducted from your earnings on each booking. This covers Stripe payment processing, customer support, dispute protection, marketing, and platform infrastructure. There are no monthly fees, listing fees, or hidden charges.',
  },
  {
    category: 'event-pros',
    question: 'Step-by-step: When and how do I get paid?',
    answer: '1. Customer pays online at booking — funds go to escrow.\n2. Event happens.\n3. 24 hours after the event ends (and no issues reported) — payout is automatically initiated.\n4. Stripe transfers the funds to your connected bank account in 1–2 business days.\n5. View every payout, fee breakdown, and tax summary in Dashboard → Payouts.\n\nFor cash bookings, you collect directly at the event — no payout delay.',
  },
  {
    category: 'event-pros',
    question: 'Can I get the "Verified Event Pro" badge?',
    answer: 'Yes — complete optional Stripe Identity verification in Dashboard → Settings → Verification. It takes 2 minutes (government ID + selfie). Verified pros get a trust badge, higher search ranking, and typically book 30%+ more events. It\'s optional and not required for payouts.',
  },
  // Trust & Safety
  {
    category: 'trust-safety',
    question: 'Is online payment secure?',
    answer: 'Yes. All payments are processed by Stripe, which is PCI-DSS Level 1 certified — the highest standard. We never see or store your full card number, CVV, or bank details.',
    hasTooltip: 'stripe',
  },
  {
    category: 'trust-safety',
    question: 'How do you verify Event Pros?',
    answer: 'Multi-layer verification:\n• Email + phone confirmation at signup\n• Manual admin review of every new listing\n• Stripe identity check for payouts (bank ownership)\n• Optional Stripe Identity verification for the "Verified Event Pro" badge\n• Customer reviews after every completed booking\n• Automated monitoring for cancellation rate, response time, and disputes',
  },
  {
    category: 'trust-safety',
    question: 'Can I message before booking?',
    answer: 'Yes. Use the in-app messaging hub to ask questions, customize details, and confirm logistics. Contact info (phone, email, external links) is automatically masked until a booking is confirmed — this protects both sides and keeps everything documented.',
  },
  {
    category: 'trust-safety',
    question: 'Are reviews real?',
    answer: 'Yes — only customers with completed bookings can leave reviews. Reviews are tied to a specific booking ID and cannot be purchased, removed by pros, or faked. Pros can publicly respond to reviews but cannot edit or delete them.',
  },
  // Account & Profile
  {
    category: 'account',
    question: 'I signed up — what happens next?',
    answer: 'Customers go straight to the dashboard and can browse + book immediately. Event Pros are walked through a 5-step onboarding wizard (profile, photos, first package, payments, availability) and then submitted for admin review.',
  },
  {
    category: 'account',
    question: 'Can I change my profile URL?',
    answer: 'Event Pro public profiles use immutable URLs in the format /eventpro/{username}. You set the username during onboarding and it cannot be changed afterward — this protects your SEO and any links your customers have shared. Choose carefully.',
  },
  {
    category: 'account',
    question: 'Can I delete my profile?',
    answer: 'Yes. From Dashboard → Settings, you can pause your listing (hidden from search but kept for records) or request full deletion via support. Deletion permanently removes your packages, profile, and message history after a 30-day grace period.',
  },
  // Support
  {
    category: 'support',
    question: 'How do I contact support?',
    answer: 'Three ways:\n1. In-app chat — bottom-right of any dashboard page.\n2. Email — support via the Contact page.\n3. From a booking — tap "Get help" on the booking page (fastest, auto-attaches your booking ID).\n\nInclude screenshots and your booking ID for the quickest resolution.',
  },
  {
    category: 'support',
    question: 'What hours is support available?',
    answer: 'Live chat: weekdays 9 AM – 7 PM ET. Email + in-app messages: monitored 7 days/week with most replies within a few hours. Urgent booking issues (event happening today/tomorrow) are prioritized 24/7.',
  },
];

const popularQuestions = [
  { question: 'How do I book a package?', category: 'booking-packages' as FAQCategory },
  { question: 'How do payouts work?', category: 'event-pros' as FAQCategory },
  { question: 'What fees are charged?', category: 'paying-fees' as FAQCategory },
  { question: 'What\'s the cancellation policy?', category: 'cancellations' as FAQCategory },
];

const tooltipContent: Record<string, string> = {
  'availability-first': 'Results match your selected date/time—only what\'s actually available shows up.',
  'platform-fee': 'This fee supports payment processing, support, and marketplace operations.',
  'platform-fee-refund': 'You keep the platform fee if you cancel. Event Pro cancels = fee refunded.',
  'payout-timing': 'Payouts are held until 24 hours after the event to allow for issue reporting.',
  'issue-reporting': 'Report issues promptly so we can review before funds are released.',
  'cash-refunds': 'Cash bookings are handled directly between you and the Event Pro.',
  'instant-book': 'Booking is confirmed immediately when it matches availability.',
  'request-to-book': 'Booking confirms after the Event Pro approves.',
  'stripe': 'Stripe securely handles payouts and verification. We never store bank details.',
  'deposit-refund': 'Cancel within 1 hour of booking + event 7+ days away = deposit refunded. Event Pro cancels = always refunded.',
};

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');

  // SEO for FAQ page
  const seo = generatePageSEO('faq');
  
  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
    keywords: [
      'event booking FAQ',
      'vendor booking help',
      'cancellation policy',
      'payment questions',
      'event pro help',
      'booking support',
      'EventPro help',
    ],
  });

  // Prepare FAQ data for JSON-LD (top 10 most important questions)
  const faqJsonLdData = faqData.slice(0, 10).map(faq => ({
    question: faq.question,
    answer: faq.answer,
  }));

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
      {/* Structured Data for FAQ Rich Snippets */}
      <FAQJsonLd faqs={faqJsonLdData} />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://event-pro-vault.lovable.app/' },
        { name: 'FAQ', url: 'https://event-pro-vault.lovable.app/faq' },
      ]} />
      
      {/* Zendesk Chat Widget */}
      <ZendeskWidget />
      
      <div className="min-h-screen bg-background pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary/50 to-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumbs */}
            <Breadcrumbs 
              items={[{ label: 'FAQ' }]} 
              className="mb-6"
            />
            
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
                  placeholder="Search questions, payouts, fees, booking…"
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
                  onClick={() => handleQuickLink('cancellations')}
                  className="text-primary hover:underline"
                >
                  Cancellation policy
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

        {/* How It Works Section */}
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                How Booking Works
              </h2>
              <p className="text-muted-foreground">
                Four simple steps to book your perfect event vendor
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  icon: <Search className="w-6 h-6" />,
                  title: 'Search & Browse',
                  description: 'Enter your event date, location, and browse available packages.',
                },
                {
                  step: 2,
                  icon: <MapPin className="w-6 h-6" />,
                  title: 'Choose a Package',
                  description: 'Review details, pricing, and check availability for your event.',
                },
                {
                  step: 3,
                  icon: <CardIcon className="w-6 h-6" />,
                  title: 'Book & Pay',
                  description: 'Confirm your booking with secure online payment or pay in cash.',
                },
                {
                  step: 4,
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  title: 'You\'re All Set',
                  description: 'Receive confirmation and connect with your Event Pro.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative group"
                >
                  {/* Connector line (hidden on mobile, last item) */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-border group-hover:bg-primary/30 transition-colors" />
                  )}
                  
                  <div className="relative bg-background rounded-xl border border-border p-6 h-full hover:border-primary/30 hover:shadow-md transition-all">
                    {/* Step number badge */}
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      Step {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      {item.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Link to="/browse">
                <Button variant="outline" className="gap-2">
                  Start Browsing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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
                              <AccordionContent className="text-muted-foreground pb-4 whitespace-pre-line leading-relaxed">
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
                        <AccordionContent className="text-muted-foreground pb-4 whitespace-pre-line leading-relaxed">
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
        <Link to="/contact" className="lg:hidden fixed bottom-4 right-4 z-40">
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Support
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
