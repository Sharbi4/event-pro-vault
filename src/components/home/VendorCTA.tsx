import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Calendar, Users } from 'lucide-react';

export function VendorCTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      
      {/* Floating animated orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-[80px] orb-animate" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/25 to-primary/15 rounded-full blur-[100px] orb-animate-delay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-trust/20 to-primary/10 rounded-full blur-[60px] orb-animate" style={{ animationDelay: '-3s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Get booked faster.{' '}
            <span className="gradient-text">List your services.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of event professionals growing their business on Event Pros. 
            Set your own rates, create custom packages, and reach clients actively looking for your services.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Earn More</h3>
              <p className="text-sm text-muted-foreground">
                Competitive platform fees. Keep more of what you earn.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Manage Easily</h3>
              <p className="text-sm text-muted-foreground">
                Built-in calendar, booking management, and messaging.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Reach Clients</h3>
              <p className="text-sm text-muted-foreground">
                Connect with hosts actively planning their next event.
              </p>
            </div>
          </div>

          <Link to="/become-a-pro">
            <Button variant="gradient" size="xl" className="gap-2 shimmer-effect">
              Start Listing Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
