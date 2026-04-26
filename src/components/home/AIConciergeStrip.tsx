import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AIConciergeDrawer } from './AIConciergeDrawer';

const PROMPTS = [
  'Apartment event for 100',
  'Office lunch for 40',
  'Wedding bartender',
  'Taco truck this weekend',
  'Dessert table for a birthday',
  'Affordable catering',
];

export function AIConciergeStrip() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-card border border-border p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> EventPro Assistant
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Not sure what fits your event?
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Tell us what you're planning and we'll recommend the best Vendor types and packages.
              </p>
            </div>
            <Button variant="gradient" size="lg" onClick={() => setOpen(true)} className="rounded-full shrink-0">
              <Sparkles className="w-4 h-4 mr-2" /> Ask the assistant
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setOpen(true)}
                className="text-sm px-4 py-2 rounded-full bg-card hover:bg-card/80 border border-border transition-colors flex items-center gap-1.5 group"
              >
                {p}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <AIConciergeDrawer open={open} onOpenChange={setOpen} />
    </section>
  );
}
