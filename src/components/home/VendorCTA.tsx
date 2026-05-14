import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Calendar, Users, Sparkles, Zap } from 'lucide-react';

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
            Run a food truck or catering business?{' '}
            <span className="gradient-text">Get booked here.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join food trucks, caterers, mobile bartenders and bakers growing their business on EventPro.
            Set your availability, list your packages, and reach hosts ready to book.
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary - Become an Event Pro */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
              <Link to="/become-a-pro" className="relative block">
                <Button variant="gradient" size="xl" className="gap-2 shimmer-effect rounded-full font-bold text-base shadow-2xl">
                  <Sparkles className="w-5 h-5" />
                  Become an Event Pro
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Secondary - Get Booked Now */}
            <Link to="/eventpro-onboarding">
              <Button variant="outline" size="xl" className="gap-2 rounded-full font-bold text-base border-2 border-foreground hover:bg-foreground hover:text-background transition-colors">
                <Zap className="w-5 h-5" />
                Get Booked Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
