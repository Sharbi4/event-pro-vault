import { Link } from 'react-router-dom';
import { Search, Eye, PackageCheck, LayoutDashboard, PartyPopper, ArrowRight } from 'lucide-react';

const steps = [
  { n: 1, icon: Search, title: 'Search your date', copy: 'Date, time, location, Vendor type, cuisine, guest count.', href: '/browse', link: 'Search availability' },
  { n: 2, icon: Eye, title: 'Compare Vendors', copy: 'Photos, ratings, verified badges, package previews, pricing.', href: '/browse', link: 'Browse Vendors' },
  { n: 3, icon: PackageCheck, title: 'Choose a package', copy: 'Pull-up, catering, or private package via message.', href: '/book-or-get-booked#booking-options', link: 'Booking options' },
  { n: 4, icon: LayoutDashboard, title: 'Keep it together', copy: 'Messages, reminders, payments, and event status in one place.', href: '/dashboard', link: 'View dashboard' },
  { n: 5, icon: PartyPopper, title: 'Enjoy the event', copy: 'Your Vendor shows up ready to serve.', href: '/browse', link: 'Find Vendors' },
];

interface Props {
  title?: string;
  compact?: boolean;
}

export function CustomerJourneyStrip({ title = 'From search to served', compact = false }: Props) {
  const visible = compact ? steps.slice(0, 3) : steps;
  return (
    <section className={compact ? 'py-8' : 'py-16 sm:py-24'}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-muted-foreground">A simple path from idea to served event.</p>
        </div>
        <div className={`grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 ${compact ? 'lg:grid-cols-3' : 'lg:grid-cols-5'}`}>
          {visible.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-5 hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">0{s.n}</span>
                </div>
                <h3 className="font-semibold text-base">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.copy}</p>
                <Link to={s.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
                  {s.link} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
