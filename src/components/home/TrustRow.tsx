import { ShieldCheck, Star, Package, MessageSquare, Sparkles, Lock } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, label: 'Verified Event Pros' },
  { icon: Star, label: 'Ratings & reviews' },
  { icon: Package, label: 'Package-based booking' },
  { icon: MessageSquare, label: 'In-platform messaging' },
  { icon: Sparkles, label: 'Private package offers' },
  { icon: Lock, label: 'Secure booking flow' },
];

export function TrustRow() {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
          Book with more confidence.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs md:text-sm font-medium">{it.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
