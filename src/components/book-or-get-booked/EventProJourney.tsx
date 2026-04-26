import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle2, PackagePlus, CalendarRange, Inbox, MessageSquarePlus, LayoutDashboard, ArrowRight } from 'lucide-react';

const steps = [
  { icon: UserCircle2, title: 'Create your profile', copy: 'Business name, photos, service area, food style, and what you offer.', link: { href: '/become-a-pro', label: 'Create profile' } },
  { icon: PackagePlus, title: 'Add packages', copy: 'Build Pull-Up Bookings and Catering Packages customers can understand and book.', link: { href: '/vendor-dashboard?tab=packages', label: 'Create package' } },
  { icon: CalendarRange, title: 'Set your calendar', copy: 'Control availability, blocked times, setup time, cleanup time, and booking rules.', link: { href: '/vendor-dashboard?tab=availability', label: 'Set availability' } },
  { icon: Inbox, title: 'Get booking requests', copy: 'Customers can book packages or message you for custom needs.', link: { href: '/vendor-dashboard?tab=bookings', label: 'Manage requests' } },
  { icon: MessageSquarePlus, title: 'Send private packages', copy: 'Create custom offers inside messages and let customers book on-platform.', link: { href: '/vendor-dashboard?tab=messages', label: 'Open messages' } },
  { icon: LayoutDashboard, title: 'Manage in one dashboard', copy: 'Bookings, messages, packages, reminders, payouts, and reviews.', link: { href: '/vendor-dashboard?tab=overview', label: 'Open dashboard' } },
];

export function EventProJourney() {
  return (
    <section className="py-16 sm:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            For Event Pros
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Turn open dates into paid bookings
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl bg-background border border-border/60 p-6 hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.copy}</p>
                <Link to={s.link.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline">
                  {s.link.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
            <Link to="/become-a-pro">Become an Event Pro</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
