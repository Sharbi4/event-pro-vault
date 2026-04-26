import { CalendarSearch, Images, CalendarClock, MessagesSquare, MailPlus, ShieldCheck, BellRing, Star } from 'lucide-react';

const items = [
  { icon: CalendarSearch, title: 'Availability-based search', copy: 'Customers search by date, time, location, guest count, and vendor type.' },
  { icon: Images, title: 'Visual vendor cards', copy: 'Photos, ratings, package previews, cuisine style, and availability.' },
  { icon: CalendarClock, title: 'Smart calendar blocking', copy: 'Confirmed bookings, pending holds, setup, cleanup, and manual blocks.' },
  { icon: MessagesSquare, title: 'In-platform messaging', copy: 'Keep event details organized in one thread.' },
  { icon: MailPlus, title: 'Private packages', copy: 'Vendors can send custom packages directly through messages.' },
  { icon: ShieldCheck, title: 'Optional verification', copy: 'Verified Event Pros get a trust badge that helps them stand out.' },
  { icon: BellRing, title: 'Reminders', copy: 'Customers and vendors receive reminders before the event.' },
  { icon: Star, title: 'Reviews', copy: 'Completed bookings can turn into ratings and repeat bookings.' },
];

interface Props {
  compact?: boolean;
}

export function TrustCards({ compact = false }: Props) {
  const visible = compact ? items.slice(0, 4) : items;
  return (
    <section className={compact ? 'py-8' : 'py-16 sm:py-24'}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Built for real food bookings</h2>
          <p className="mt-3 text-muted-foreground">Marketplace tools that protect both sides and keep events on track.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {visible.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.title} className="rounded-2xl border border-border/60 bg-card p-5 hover:border-foreground/20 transition-colors">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary mb-3">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="font-semibold text-sm">{it.title}</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{it.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
