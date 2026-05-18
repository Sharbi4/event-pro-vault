import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Camera,
  MessageSquare,
  Share2,
  Search,
  Shield,
  Briefcase,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Rocket,
  Target,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { JsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const heroStats = [
  { label: 'Avg. response time goal', value: '< 1 hr' },
  { label: 'Listings with photos book', value: '5× more' },
  { label: 'Verified pros book', value: '2× faster' },
];

const playbookSections = [
  {
    icon: Rocket,
    title: 'Launch your listing the right way',
    tips: [
      'Pick one signature package first — niche down, then expand.',
      'Use a tight, benefit-led title: "Wood-Fired Pizza Truck for 50–150 Guests".',
      'Write 3 short paragraphs: what you do, who it\'s for, what\'s included.',
      'Set a clear service radius and travel fee so quotes are instant.',
    ],
  },
  {
    icon: Camera,
    title: 'Photography that converts',
    tips: [
      'Lead with a hero shot of your setup at a real event (not a stock photo).',
      'Show food/service close-ups, the rig/truck, and happy guests.',
      'Shoot vertical + horizontal — both are used across the marketplace.',
      'Aim for 8–12 high-resolution images per package minimum.',
    ],
  },
  {
    icon: Calendar,
    title: 'Availability & pricing strategy',
    tips: [
      'Keep your calendar updated weekly — stale calendars kill instant bookings.',
      'Block setup/cleanup buffers so back-to-back bookings stay realistic.',
      'Offer one entry-level package and one premium tier to anchor pricing.',
      'Enable Instant Book on off-peak dates to fill gaps fast.',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Win the inquiry',
    tips: [
      'Reply within 60 minutes — fastest reply usually wins the booking.',
      'Restate the event details to show you read the request.',
      'Send one clear next step ("Shall I hold your date for 24 hours?").',
      'Always keep messaging on-platform — it\'s protected and audit-logged.',
    ],
  },
  {
    icon: Star,
    title: 'Earn 5-star reviews',
    tips: [
      'Confirm the run-sheet 48 hours out: timing, address, contacts, parking.',
      'Show up 30 minutes early. First impressions drive the review.',
      'Bring a printed menu / setup card guests can photograph and share.',
      'Send a 1-tap review request the morning after the event.',
    ],
  },
  {
    icon: Search,
    title: 'Get found on Google',
    tips: [
      'Claim a Google Business Profile and link it to your EventPro page.',
      'Use the same business name, phone, and address everywhere (NAP consistency).',
      'Encourage reviews on both Google and EventPro — they compound.',
      'Publish 1 short blog/case study per month with city + service keywords.',
    ],
  },
];

const resourceLinks = [
  {
    category: 'On EventPro',
    items: [
      { label: 'Become an Event Pro', href: '/become-a-pro', internal: true, desc: 'Create your free profile in minutes.' },
      { label: 'Event Pro Onboarding', href: '/eventpro-onboarding', internal: true, desc: 'Step-by-step listing wizard.' },
      { label: 'Best Practices Guide', href: '/eventpro-best-practices', internal: true, desc: 'Listing optimization deep-dive.' },
      { label: 'Pro Learn Hub', href: '/learn/event-pros', internal: true, desc: 'How the marketplace works for pros.' },
      { label: 'Event Pro Dashboard', href: '/dashboard', internal: true, desc: 'Manage bookings, payouts & messages.' },
      { label: 'FAQ for Pros', href: '/faq#event-pros', internal: true, desc: 'Fees, payouts, cancellations.' },
      { label: 'Vendor Terms', href: '/vendor-terms', internal: true, desc: 'Platform terms for Event Pros.' },
      { label: 'EventPro Blog', href: '/blog', internal: true, desc: 'Tips, trends, and case studies.' },
    ],
  },
  {
    category: 'Business setup & legal',
    items: [
      { label: 'SBA — Start a Business', href: 'https://www.sba.gov/business-guide/10-steps-start-your-business', internal: false, desc: 'Official US small business roadmap.' },
      { label: 'IRS — EIN Application', href: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', internal: false, desc: 'Free federal tax ID for your business.' },
      { label: 'SCORE Free Mentoring', href: 'https://www.score.org/', internal: false, desc: 'Free 1:1 mentoring for entrepreneurs.' },
      { label: 'Next Insurance — Event Coverage', href: 'https://www.nextinsurance.com/', internal: false, desc: 'Liability insurance built for event pros.' },
    ],
  },
  {
    category: 'Marketing & discovery',
    items: [
      { label: 'Google Business Profile', href: 'https://www.google.com/business/', internal: false, desc: 'Show up on Google Maps & Search.' },
      { label: 'Meta Business Suite', href: 'https://business.facebook.com/', internal: false, desc: 'Manage Instagram + Facebook in one place.' },
      { label: 'Canva for Small Business', href: 'https://www.canva.com/small-business/', internal: false, desc: 'Free flyers, menus & social graphics.' },
      { label: 'Linktree', href: 'https://linktr.ee/', internal: false, desc: 'One link for your bio and booking page.' },
    ],
  },
  {
    category: 'Operations & finance',
    items: [
      { label: 'Stripe — Tax & Payouts', href: 'https://stripe.com/connect', internal: false, desc: 'Powers EventPro payouts (already built in).' },
      { label: 'QuickBooks Self-Employed', href: 'https://quickbooks.intuit.com/self-employed/', internal: false, desc: 'Mileage, expenses, quarterly taxes.' },
      { label: 'Calendly', href: 'https://calendly.com/', internal: false, desc: 'Tasting & consultation scheduling.' },
      { label: 'Square POS', href: 'https://squareup.com/us/en/point-of-sale', internal: false, desc: 'Take in-person card payments at events.' },
    ],
  },
];

const faqs = [
  {
    question: 'How do I get my first booking on EventPro?',
    answer: 'Complete your profile 100%, add at least 8 high-quality photos, enable Instant Book on 2–3 dates in the next 30 days, and respond to every inquiry within an hour. Most new pros book their first event within 14 days of going live.',
  },
  {
    question: 'How much does it cost to list on EventPro?',
    answer: 'Creating an Event Pro profile and listing packages is 100% free. EventPro charges a 12.9% platform fee that is deducted from each completed booking — only when you get paid.',
  },
  {
    question: 'How fast do payouts arrive?',
    answer: 'For online payments, funds are held and payouts are initiated 24 hours after the event ends. Stripe typically deposits to your bank account within 1–2 business days after that.',
  },
  {
    question: 'What\'s the single biggest thing I can do to get booked faster?',
    answer: 'Reply fast. Pros who answer inquiries within 60 minutes book 3–4× more often than pros who reply after a day. Turn on push and email notifications, and use saved message templates from your dashboard.',
  },
  {
    question: 'Do I need business insurance to list?',
    answer: 'Insurance is not required to list, but most repeat bookers (corporate, venues, weddings) ask for a Certificate of Insurance (COI). Carriers like Next, Thimble, and Hiscox offer event-day or annual policies that are simple to attach to your profile.',
  },
  {
    question: 'How do I rank higher in search results?',
    answer: 'EventPro\'s search ranking weights real-time availability, response time, photo quality, verified status, and review count. Keep your calendar fresh, respond fast, complete identity verification, and ask every happy client for a review.',
  },
];

export default function EventProGrow() {
  const canonical = `${SEO_CONFIG.baseUrl}/grow`;

  useSEO({
    title: 'Grow Your Event Business — Tips, Tools & Resources for Event Pros | EventPro by Vendibook',
    description:
      'The complete resource hub for event pros: get-booked playbook, marketing guides, business tools, and 25+ free links to grow your catering, food truck, DJ, photography or bartending business.',
    canonical,
    type: 'website',
    keywords: [
      'event business tips',
      'how to get more event bookings',
      'food truck business resources',
      'event vendor marketing',
      'grow catering business',
      'event pro toolkit',
      'how to get booked for events',
    ],
  });

  return (
    <Layout>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SEO_CONFIG.baseUrl },
          { name: 'Grow Your Event Business', url: canonical },
        ]}
      />
      <FAQJsonLd faqs={faqs} />
      <JsonLd
        type="Article"
        data={{
          title: 'Grow Your Event Business — Tips, Tools & Resources for Event Pros',
          excerpt:
            'The complete resource hub for event pros: get-booked playbook, marketing guides, business tools, and 25+ free links.',
          slug: 'grow',
          publishedAt: '2026-05-18',
          modifiedAt: new Date().toISOString().slice(0, 10),
          authorName: 'EventPro by Vendibook',
        }}
      />

      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs items={[{ label: 'Grow Your Business' }]} className="mb-6" />

          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="w-3 h-3" /> For Event Pros
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.05]">
              Build your event business. <span className="text-primary">Get booked more.</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl">
              The complete playbook, tools, and trusted links for caterers, food trucks, bartenders,
              photographers, DJs and every event pro on EventPro by Vendibook.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to="/become-a-pro">
                <Button variant="darkShine" size="lg" className="gap-2">
                  <Rocket className="w-4 h-4" /> Become an Event Pro
                </Button>
              </Link>
              <Link to="/eventpro-best-practices">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="w-4 h-4" /> Best practices guide
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-2xl">
              {heroStats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border/50 bg-card/40 p-3">
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Playbook */}
      <section className="py-16 lg:py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
              The Get-Booked Playbook
            </h2>
            <p className="text-muted-foreground">
              Six battle-tested chapters from pros who consistently book the most events on the
              platform. Apply one per week and watch your calendar fill.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {playbookSections.map((s, i) => (
              <Card key={s.title} variant="glass" className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Chapter {i + 1}
                      </p>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {s.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resource directory */}
      <section className="py-16 lg:py-20 bg-secondary/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Resource Directory
            </h2>
            <p className="text-muted-foreground">
              Curated links — on-platform tools plus the best free third-party resources for event
              professionals. Bookmark this page.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {resourceLinks.map((group) => (
              <Card key={group.category} variant="glass" className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {group.category === 'On EventPro' && <Briefcase className="w-4 h-4 text-primary" />}
                    {group.category === 'Business setup & legal' && <Shield className="w-4 h-4 text-primary" />}
                    {group.category === 'Marketing & discovery' && <Target className="w-4 h-4 text-primary" />}
                    {group.category === 'Operations & finance' && <DollarSign className="w-4 h-4 text-primary" />}
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {group.category}
                    </h3>
                  </div>
                  <ul className="divide-y divide-border/50">
                    {group.items.map((item) =>
                      item.internal ? (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className="flex items-start gap-3 py-3 group hover:text-foreground transition-colors"
                          >
                            <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </Link>
                        </li>
                      ) : (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="flex items-start gap-3 py-3 group"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category quick links (SEO internal linking) */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Grow your category
            </h2>
            <p className="text-muted-foreground">
              Tailored guidance per service. Jump to the marketplace and see what your competitors
              are charging today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Food Trucks', href: '/browse?category=Food+Truck' },
              { label: 'Catering', href: '/browse?category=Catering' },
              { label: 'Mobile Bartenders', href: '/browse?category=Bartending' },
              { label: 'Photographers', href: '/browse?category=Photography' },
              { label: 'DJs', href: '/browse?category=DJ' },
              { label: 'Decor & Rentals', href: '/browse?category=Decorations' },
              { label: 'Entertainment', href: '/browse?category=Entertainment' },
              { label: 'Equipment Rentals', href: '/browse?category=Rentals' },
            ].map((c) => (
              <Link key={c.label} to={c.href}>
                <Badge
                  variant="outline"
                  className="text-sm py-2 px-3 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                >
                  {c.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-secondary/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3 text-center">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Everything new Event Pros ask before their first booking.
            </p>

            <div className="space-y-3">
              {faqs.map((f) => (
                <Card key={f.question} variant="glass" className="border-border/50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                      <span className="text-primary">Q.</span>
                      {f.question}
                    </h3>
                    <p className="text-sm text-muted-foreground pl-6">{f.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card variant="glass" className="border-border/50 max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <CardContent className="p-8 lg:p-12 text-center relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to fill your calendar?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of event pros already booking through EventPro. Free to list. No
                monthly fees. Get paid 24 hours after each event.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/become-a-pro">
                  <Button variant="darkShine" size="lg" className="gap-2">
                    <Users className="w-4 h-4" /> Start your free profile
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Share2 className="w-4 h-4" /> Talk to our team
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
