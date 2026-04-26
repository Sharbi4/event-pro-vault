import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Truck, ChefHat, MailPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

const options = [
  {
    icon: Truck,
    label: 'Pull-Up Booking',
    headline: 'Bring a vendor to your location',
    copy: 'Perfect for apartments, offices, breweries, schools, markets, neighborhoods, and pop-ups.',
    bullets: [
      'Choose a vendor',
      'Select your date and time',
      'Pay a show-up fee, minimum guarantee, or deposit if required',
      'Guests can pay individually on-site',
    ],
    cta: { label: 'Find pull-up vendors', href: '/browse?type=pull-up' },
    accent: 'from-orange-500/10 to-orange-500/0',
  },
  {
    icon: ChefHat,
    label: 'Catering Packages',
    headline: 'Book a ready-made event package',
    copy: 'Great for birthdays, weddings, corporate events, graduations, private parties, and office lunches.',
    bullets: [
      'Choose a package',
      'Enter guest count and event details',
      'Review price, menu, timing, and cancellation policy',
      'Request or book through EventPro',
    ],
    cta: { label: 'Browse catering packages', href: '/browse?type=catering' },
    accent: 'from-amber-500/10 to-amber-500/0',
  },
  {
    icon: MailPlus,
    label: 'Private Packages',
    headline: 'Need something custom? Message the vendor',
    copy: 'For custom menus, larger events, special timing, or mixed services.',
    bullets: [
      'Message the vendor through EventPro',
      'The vendor creates a private package',
      'You review and book it on-platform',
      'Your details stay organized in one place',
    ],
    cta: { label: 'Message a vendor', href: '/browse' },
    accent: 'from-rose-500/10 to-rose-500/0',
  },
];

interface Props {
  title?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export function BookingOptionsCards({
  title = 'Book the way your event works',
  showTitle = true,
  compact = false,
}: Props) {
  return (
    <section className={compact ? 'py-8' : 'py-16 sm:py-24'}>
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-3 text-muted-foreground">
              Three flexible ways to book mobile food &amp; beverage for any event.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <Card
                key={opt.label}
                className="relative overflow-hidden p-6 sm:p-7 flex flex-col rounded-2xl border-border/60 hover:border-foreground/20 transition-colors"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${opt.accent} pointer-events-none`} />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-foreground text-background mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    {opt.label}
                  </div>
                  <h3 className="text-xl font-semibold leading-snug">{opt.headline}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{opt.copy}</p>
                  <ul className="mt-5 space-y-2">
                    {opt.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-foreground/70 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button asChild variant="outline" className="rounded-full w-full">
                      <Link to={opt.cta.href}>
                        {opt.cta.label}
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
