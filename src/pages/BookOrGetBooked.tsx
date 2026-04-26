import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, ArrowRight, ChefHat, Sparkles, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { BookingOptionsCards } from '@/components/book-or-get-booked/BookingOptionsCards';
import { CustomerJourneyStrip } from '@/components/book-or-get-booked/CustomerJourneyStrip';
import { EventProJourney } from '@/components/book-or-get-booked/EventProJourney';
import { TrustCards } from '@/components/book-or-get-booked/TrustCards';
import { BrowseChips } from '@/components/book-or-get-booked/BrowseChips';


const customerFAQs = [
  // Pull-Up timing
  {
    q: 'How long does a typical Pull-Up Booking last?',
    a: 'Most Pull-Ups run 2–4 hours of active service. You pick the start time, and the vendor builds in setup and cleanup around it so guests get the full window you booked.',
  },
  {
    q: 'How far in advance should I book a Pull-Up?',
    a: 'For weekday lunches and small events, 1–2 weeks is usually fine. For weekend evenings, neighborhood events, or popular vendors, book 3–6 weeks ahead so your date is still open.',
  },
  {
    q: 'Can I book back-to-back time slots or extend the service window?',
    a: 'Yes. Choose the full start and end time when you book. If you need to extend after the event is confirmed, message the vendor — they can send an updated quote through EventPro.',
  },
  {
    q: 'Can I book a Pull-Up for an apartment, office, or neighborhood event?',
    a: 'Yes. Pull-Ups are designed for apartments, offices, breweries, schools, markets, neighborhoods, and pop-ups. Just make sure the location has space for the vehicle plus power and water if the package requires them.',
  },

  // Packages
  {
    q: 'What is the difference between a Pull-Up Booking and a Catering Package?',
    a: 'A Pull-Up brings the vendor to your location to serve guests in a window of time — great when guests pay individually or you cover a show-up fee. A Catering Package is priced per guest with a set menu, staffing, and timing — great for weddings, birthdays, and corporate events.',
  },
  {
    q: 'How is package pricing shown?',
    a: 'Catering Packages show flat, per-person, or base + per-person pricing along with the deposit, balance due date, and what is included. Pull-Ups show a show-up fee, minimum guarantee, or no upfront depending on the vendor’s model.',
  },
  {
    q: 'Can I see what is included before I book?',
    a: 'Yes. Every package shows the menu, drinks, add-ons, staffing, timing, and cancellation policy on the package page so you know exactly what you are paying for before you confirm.',
  },

  // Private Packages
  {
    q: 'What is a Private Package?',
    a: 'A Private Package is a custom offer a vendor sends you inside a message thread — for custom menus, larger guest counts, special timing, or mixed services that do not fit a public package.',
  },
  {
    q: 'How do I request a Private Package?',
    a: 'Open any vendor profile, send a message describing your event, and ask for a custom quote. The vendor builds the package on EventPro and sends it back for you to review and book on-platform.',
  },
  {
    q: 'Is a Private Package booked the same way as a regular package?',
    a: 'Yes. You review the price, menu, timing, and cancellation policy, then book and pay through EventPro — so deposits, payouts, refunds, and reminders all stay in one place.',
  },
];

const proFAQs = [
  // Pull-Up timing
  {
    q: 'How do I set the time window for a Pull-Up Booking?',
    a: 'On your Pull-Up package, set the service window length and the earliest/latest times you will accept. EventPro automatically adds your setup and cleanup buffers to the calendar so you never get double-booked.',
  },
  {
    q: 'Can I limit how far in advance customers can book a Pull-Up?',
    a: 'Yes. In your package rules you can set minimum lead time (e.g. 48 hours) and maximum advance booking (e.g. 6 months) so requests stay realistic.',
  },
  {
    q: 'What happens if a Pull-Up overlaps with another booking?',
    a: 'It will not. Your master calendar blocks confirmed bookings, pending holds, setup time, cleanup time, and travel buffers across every package, so customers only see slots you can actually serve.',
  },

  // Packages
  {
    q: 'What kinds of packages can I create?',
    a: 'Two public types: Pull-Up Bookings (show-up fee, minimum guarantee, combined, or no upfront) and Catering Packages (flat, per-person, or base + per-person with deposit and balance terms). You can also send Private Packages inside messages.',
  },
  {
    q: 'Do I have to publish all my packages publicly?',
    a: 'No. You can keep some packages unlisted and only share them through Private Packages in message threads — useful for premium pricing, repeat clients, or special menus.',
  },
  {
    q: 'Can I edit a package after it is published?',
    a: 'Yes. You can update pricing, menu, photos, rules, and availability anytime. Existing confirmed bookings keep the terms they were booked under.',
  },

  // Private Packages
  {
    q: 'What is a Private Package and when should I use one?',
    a: 'A Private Package is a custom offer you send inside a message thread. Use it for custom menus, larger guest counts, multi-day events, or anything that does not fit your public packages.',
  },
  {
    q: 'How do customers pay for a Private Package?',
    a: 'They book and pay through EventPro just like a public package. Deposits, balances, payouts, refunds, and cancellation policies all flow through the same system, so nothing happens off-platform.',
  },
  {
    q: 'Will a Private Package show up on my public profile?',
    a: 'No. Private Packages are visible only to the customer you sent them to. They do not appear in search results or on your public Event Pro profile.',
  },
];


export default function BookOrGetBooked() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [vendorType, setVendorType] = useState('');

  // Prefilled browse URL based on hero inputs (used by customer CTAs)
  const browseHref = useMemo(() => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (location) params.set('location', location);
    if (vendorType) params.set('category', vendorType);
    const qs = params.toString();
    return qs ? `/browse?${qs}` : '/browse';
  }, [date, location, vendorType]);

  // Event Pro entry: signed-in users go straight to the right dashboard tab,
  // anonymous users land in onboarding first.
  const proEntry = (tab?: string) =>
    user
      ? `/vendor-dashboard${tab ? `?tab=${tab}` : ''}`
      : `/become-a-pro${tab ? `?next=${encodeURIComponent('/vendor-dashboard?tab=' + tab)}` : ''}`;

  const handleSearch = () => {
    navigate(browseHref);
  };

  useEffect(() => {
    document.title = 'Book or Get Booked — EventPro';
    const desc = document.querySelector('meta[name="description"]');
    const content =
      'Find and book food trucks, mobile bars, dessert vendors, and cottage bakers for real events — or create a profile and get booked.';
    if (desc) desc.setAttribute('content', content);
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-background to-background">
        <div className="container mx-auto px-4 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/5 text-xs font-medium text-foreground/70 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Book or Get Booked
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
              Your event, served.<br className="hidden sm:block" />{' '}
              <span className="text-orange-600">Your business, booked.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find and book food trucks, mobile bars, dessert vendors, cottage bakers, trailers, and mobile food businesses for real events.
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
              Search by date, time, location, cuisine, and guest count — or create a profile to get booked by customers nearby.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                <Link to={browseHref}>
                  Find vendors near me <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to={proEntry()}>{user ? 'Open vendor dashboard' : 'Become an Event Pro'}</Link>
              </Button>
            </div>

            {/* Compact search bar */}
            <Card className="mt-8 p-3 sm:p-4 rounded-2xl border-border/70 shadow-sm text-left max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4 relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 rounded-xl"
                    aria-label="Date needed"
                  />
                </div>
                <div className="sm:col-span-4 relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9 rounded-xl"
                    aria-label="Location"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Select value={vendorType} onValueChange={setVendorType}>
                    <SelectTrigger className="rounded-xl" aria-label="Vendor type">
                      <SelectValue placeholder="Vendor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food-truck">Food Truck</SelectItem>
                      <SelectItem value="food-trailer">Food Trailer</SelectItem>
                      <SelectItem value="mobile-bartender">Mobile Bartender</SelectItem>
                      <SelectItem value="cottage-baker">Cottage Baker</SelectItem>
                      <SelectItem value="dessert">Dessert Vendor</SelectItem>
                      <SelectItem value="mobile-coffee">Mobile Coffee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSearch} className="mt-3 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90">
                <Search className="w-4 h-4 mr-1.5" /> Search vendors
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PATH */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">What are you here to do?</h2>
            <p className="mt-3 text-muted-foreground">Two clear paths. One marketplace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {/* Customer */}
            <Card className="relative overflow-hidden p-7 sm:p-8 rounded-3xl border-border/60 hover:border-foreground/20 transition-colors group">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 mb-5">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold">I&apos;m planning an event</h3>
                <p className="mt-2 text-muted-foreground">
                  Search available vendors, compare packages, message for custom needs, and book everything in one place.
                </p>
                <div className="mt-5">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Best for</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Apartment events', 'Office lunches', 'Birthdays', 'Weddings', 'Graduations', 'Markets', 'Neighborhood events'].map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-secondary">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Link to={browseHref}>Start booking <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
                  </Button>
                  <Link to="/browse?category=food-truck" className="text-sm font-medium hover:underline">
                    See food trucks near me
                  </Link>
                </div>
              </div>
            </Card>

            {/* Event Pro */}
            <Card className="relative overflow-hidden p-7 sm:p-8 rounded-3xl border-border/60 hover:border-foreground/20 transition-colors">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-foreground/5 blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground text-background mb-5">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold">I want to get booked</h3>
                <p className="mt-2 text-muted-foreground">
                  Create a profile, add your packages, set your calendar, and get discovered by people planning events near you.
                </p>
                <div className="mt-5">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Best for</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Food trucks', 'Food trailers', 'Mobile bartenders', 'Cottage bakers', 'Dessert vendors', 'Mobile coffee', 'Mobile food businesses'].map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-secondary">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="rounded-full">
                    <Link to={proEntry('packages')}>
                      {user ? 'Create a package' : 'Become an Event Pro'} <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Link>
                  </Button>
                  <Link to={proEntry('availability')} className="text-sm font-medium hover:underline">
                    Set your calendar
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CUSTOMER JOURNEY */}
      <CustomerJourneyStrip />

      {/* BOOKING OPTIONS */}
      <div id="booking-options" className="bg-secondary/30">
        <BookingOptionsCards />
      </div>

      {/* EVENT PRO JOURNEY */}
      <EventProJourney />

      {/* TRUST */}
      <TrustCards />

      {/* BROWSE CHIPS */}
      <BrowseChips />

      {/* SPLIT CTA */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready when you are</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            <Card className="p-7 sm:p-8 rounded-3xl border-border/60">
              <h3 className="text-2xl font-semibold">Find food vendors near you</h3>
              <p className="mt-2 text-muted-foreground">
                Search by date, location, vendor type, cuisine, and guest count.
              </p>
              <Button asChild className="mt-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                <Link to={browseHref}>Start searching <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
              </Button>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ['Browse food trucks', '/browse?category=food-truck'],
                  ['Browse mobile bartenders', '/browse?category=mobile-bartender'],
                  ['Browse dessert vendors', '/browse?category=dessert'],
                  ['Available this weekend', '/browse?q=weekend'],
                ].map(([l, h]) => (
                  <Link key={l} to={h} className="text-xs px-3 py-1.5 rounded-full border border-border/70 hover:border-foreground transition-colors">
                    {l}
                  </Link>
                ))}
              </div>
            </Card>
            <Card className="p-7 sm:p-8 rounded-3xl border-border/60 bg-foreground text-background">
              <h3 className="text-2xl font-semibold">Start getting booked</h3>
              <p className="mt-2 text-background/70">
                Create your EventPro profile, add packages, and turn open calendar dates into paid bookings.
              </p>
              <Button asChild variant="secondary" className="mt-5 rounded-full">
                <Link to={proEntry()}>
                  {user ? 'Open vendor dashboard' : 'Become an Event Pro'} <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <div className="mt-5 flex flex-wrap gap-2">
                {([
                  [user ? 'Edit profile' : 'Create profile', user ? '/vendor-dashboard?tab=settings' : '/become-a-pro'],
                  ['Add packages', proEntry('packages')],
                  ['Set calendar', proEntry('availability')],
                  ['Manage requests', proEntry('bookings')],
                  ['Open messages', proEntry('messages')],
                ] as Array<[string, string]>).map(([l, h]) => (
                  <Link key={l} to={h} className="text-xs px-3 py-1.5 rounded-full border border-background/30 hover:border-background transition-colors">
                    {l}
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Questions before you start?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">For customers</h3>
              <Accordion type="single" collapsible className="bg-background rounded-2xl border border-border/60 px-4">
                {customerFAQs.map((f, i) => (
                  <AccordionItem key={i} value={`c-${i}`} className="border-b last:border-0">
                    <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Event Pros</h3>
              <Accordion type="single" collapsible className="bg-background rounded-2xl border border-border/60 px-4">
                {proFAQs.map((f, i) => (
                  <AccordionItem key={i} value={`p-${i}`} className="border-b last:border-0">
                    <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
              Find food for your event, or get booked for the next one.
            </h2>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                <Link to={browseHref}>Find vendors near me</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to={proEntry()}>{user ? 'Open vendor dashboard' : 'Become an Event Pro'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
