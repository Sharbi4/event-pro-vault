import { Link } from 'react-router-dom';
import { Truck, ArrowRight, Sparkles } from 'lucide-react';

export function FoodTruckPullUpStrip() {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-5 md:p-7">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Truck className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="w-3 h-3" /> Pull-up bookings
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
                Have a food truck pull up to your event
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Birthdays, office lunches, block parties — book a truck for a window of time, no minimums.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
              <Link
                to="/browse?category=Food%20Trucks"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Find a truck
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth/pro"
                className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-card border border-border font-semibold text-foreground hover:border-primary transition-colors"
              >
                I own a truck
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
