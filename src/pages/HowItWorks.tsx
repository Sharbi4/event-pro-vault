import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Search,
  Package as PackageIcon,
  MessageCircle,
  CalendarCheck,
  Sparkles,
  Truck,
  ChefHat,
  MailPlus,
  CalendarRange,
  BellRing,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle,
  Bookmark,
  CreditCard,
  Users,
} from 'lucide-react';

const pathCards = [
  {
    title: "I'm planning an event",
    copy: 'Search available vendors, compare packages, and book food experiences for your date.',
    cta: 'Start searching',
    href: '/browse',
    icon: Search,
  },
  {
    title: "I'm an Event Pro",
    copy: 'Create your profile, add packages, set availability, and get booked by customers nearby.',
    cta: 'Get booked',
    href: '/become-a-pro',
    icon: ChefHat,
  },
];

const bookingOptions = [
  {
    title: 'Pull-Up Booking',
    icon: Truck,
    copy:
      'Book a food truck, trailer, mobile bar, or dessert vendor to show up at your location. Perfect for apartments, offices, breweries, neighborhoods, schools, and community events.',
    bestFor: ['Apartment events', 'Office lunches', 'Breweries', 'Markets', 'Neighborhood nights', 'School events'],
    payment: ['Host pays a show-up fee', 'Guests pay individually on-site', 'Optional minimum guarantee', 'Optional deposit'],
    cta: 'Find pull-up vendors',
    href: '/browse?type=pullup',
  },
  {
    title: 'Catering Packages',
    icon: PackageIcon,
    copy: 'Choose a ready-to-book package with clear pricing, guest count, service time, and what\'s included.',
    bestFor: ['Birthdays', 'Weddings', 'Corporate events', 'Graduations', 'Private parties', 'Team lunches'],
    payment: ['Flat package price', 'Per-person pricing', 'Deposit or full payment', 'Add-ons when available'],
    cta: 'Browse catering packages',
    href: '/browse?type=catering',
  },
  {
    title: 'Private Packages',
    icon: MailPlus,
    copy:
      'Need something custom? Message a vendor through EventPro. They can create a private package just for your event and send it directly in your message thread.',
    bestFor: ['Custom menus', 'Larger events', 'Mixed services', 'Special timing', 'Multi-item orders'],
    payment: ['Vendor creates custom package', 'Customer reviews details', 'Customer books and pays on-platform'],
    cta: 'Message a vendor',
    href: '/browse',
  },
];

const customerJourney = [
  { icon: Search, title: 'Search your date and time', copy: 'Find vendors available when you need them.' },
  { icon: PackageIcon, title: 'Compare packages', copy: 'See food style, pricing, photos, ratings, and what\'s included.' },
  { icon: MessageCircle, title: 'Book or message', copy: 'Choose a public package or ask for a private one.' },
  { icon: CalendarCheck, title: 'Track everything', copy: 'Event details, reminders, payments, and messages in one place.' },
  { icon: Sparkles, title: 'Enjoy the event', copy: 'Your vendor shows up ready to serve.' },
];

const proJourney = [
  { icon: ChefHat, title: 'Create your EventPro profile', copy: 'Show your food, service area, photos, and business details.' },
  { icon: PackageIcon, title: 'Add your packages', copy: 'List pull-up services, catering packages, and private package options.' },
  { icon: CalendarRange, title: 'Set your availability', copy: 'Control dates, times, minimum notice, and blocked days.' },
  { icon: Bookmark, title: 'Get booking requests', copy: 'Customers can book packages or message you for custom events.' },
  { icon: MailPlus, title: 'Send private packages', copy: 'Create custom offers inside messages and let customers book on-platform.' },
  { icon: CalendarCheck, title: 'Manage your events', copy: 'Track requests, confirmed bookings, reminders, messages, and payments.' },
];

const trustCards = [
  { icon: Search, title: 'Availability-based search', copy: 'Customers search by date, time, location, guest count, and category.' },
  { icon: PackageIcon, title: 'Package-based booking', copy: 'Vendors list clear services customers can understand and book.' },
  { icon: MailPlus, title: 'Private packages', copy: 'Custom events stay organized inside messages and on-platform booking.' },
  { icon: BellRing, title: 'Reminders', copy: 'Customers and vendors receive reminders before the event.' },
  { icon: ShieldCheck, title: 'Cancellation rules', copy: 'Bookings follow clear windows based on event date and vendor policy.' },
  { icon: Star, title: 'Ratings and reviews', copy: 'Customers can review completed bookings.' },
];

const customerLinks = [
  { label: 'Search vendors', href: '/browse' },
  { label: 'Browse food trucks', href: '/browse?category=food-truck' },
  { label: 'Browse mobile bartenders', href: '/browse?category=bartender' },
  { label: 'Browse dessert vendors', href: '/browse?category=dessert' },
  { label: 'Browse catering packages', href: '/browse?type=catering' },
  { label: 'See available this weekend', href: '/browse?when=weekend' },
];

const proLinks = [
  { label: 'Become an Event Pro', href: '/become-a-pro' },
  { label: 'Create a package', href: '/vendor-onboarding' },
  { label: 'Set availability', href: '/vendor-dashboard' },
  { label: 'Learn about private packages', href: '#private-packages' },
  { label: 'Vendor dashboard', href: '/vendor-dashboard' },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-5">How EventPro works</Badge>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
            Book or get booked,{' '}
            <span className="text-primary">your way.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            EventPro helps customers find available mobile food vendors, compare packages, message
            for custom needs, and book confidently. Event Pros can list services, manage
            availability, send private packages, and turn open dates into paid bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse">
              <Button size="xl" className="gap-2 w-full sm:w-auto">
                Find vendors <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/become-a-pro">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Become an Event Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Choose your path */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Choose your path</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {pathCards.map((p) => (
              <Card
                key={p.title}
                className="group p-8 rounded-2xl border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <p.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{p.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{p.copy}</p>
                <Link to={p.href}>
                  <Button className="gap-2">
                    {p.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Three booking options */}
      <section id="private-packages" className="py-16 lg:py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Three ways to bring food to your event
            </h2>
            <p className="text-muted-foreground">
              Pick the path that matches your event — pull-up, catering, or fully custom.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {bookingOptions.map((opt) => (
              <Card
                key={opt.title}
                className="p-6 rounded-2xl border-border/50 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col bg-background"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <opt.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{opt.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{opt.copy}</p>

                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
                    Best for
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.bestFor.map((b) => (
                      <Badge key={b} variant="secondary" className="text-[11px] font-normal">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
                    Payment style
                  </div>
                  <ul className="space-y-1.5">
                    {opt.payment.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Link to={opt.href}>
                    <Button variant="outline" className="w-full gap-2">
                      {opt.cta} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer journey */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-3">For customers</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">From search to served</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {customerJourney.map((s, i) => (
              <Card key={s.title} className="p-5 rounded-2xl border-border/50 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  {i + 1}
                </div>
                <s.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Pro journey */}
      <section className="py-16 lg:py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-3">For Event Pros</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Turn your open calendar into bookings
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {proJourney.map((s, i) => (
              <Card key={s.title} className="p-5 rounded-2xl border-border/50 bg-background relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  {i + 1}
                </div>
                <s.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.copy}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/become-a-pro">
              <Button size="lg" className="gap-2">
                Become an Event Pro <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Built for real event bookings
            </h2>
            <p className="text-muted-foreground">
              The structure customers and vendors need to make events run smoothly.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {trustCards.map((t) => (
              <Card key={t.title} className="p-5 rounded-2xl border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <t.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1.5">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Where do you want to go? */}
      <section className="py-16 lg:py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Where do you want to go?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="p-7 rounded-2xl border-border/50 bg-background">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold">For customers</h3>
              </div>
              <ul className="space-y-2">
                {customerLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors group"
                    >
                      <span className="text-sm font-medium">{l.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7 rounded-2xl border-border/50 bg-background">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold">For Event Pros</h3>
              </div>
              <ul className="space-y-2">
                {proLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors group"
                    >
                      <span className="text-sm font-medium">{l.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
