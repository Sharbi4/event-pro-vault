import { Truck, Package, MessageSquare } from 'lucide-react';

const TYPES = [
  {
    icon: Truck,
    title: 'Pull-Up Booking',
    copy: 'Bring a food truck, trailer, or mobile Event Pro to your apartment, office, brewery, school, market, or neighborhood.',
  },
  {
    icon: Package,
    title: 'Catering Packages',
    copy: 'Book ready-made packages for birthdays, weddings, corporate events, graduations, and private parties.',
  },
  {
    icon: MessageSquare,
    title: 'Private Packages',
    copy: 'Need something custom? Message a Event Pro and they can send a private package you can book securely through EventPro.',
  },
];

export function BookingTypeCards() {
  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Three ways to book</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Whether you want them to pull up, cater your event, or build something custom — it all happens on EventPro.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-2xl bg-card border border-border p-6 hover:shadow-lg hover:border-primary/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
