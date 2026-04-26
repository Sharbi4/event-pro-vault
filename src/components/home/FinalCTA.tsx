import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Find the right Vendor for your <span className="gradient-text">next event.</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Search by date, location, cuisine, and Vendor type — all in one place.
          </p>
          <Button asChild variant="gradient" size="lg" className="rounded-full">
            <Link to="/browse">
              <Search className="w-4 h-4 mr-2" /> Start searching
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
