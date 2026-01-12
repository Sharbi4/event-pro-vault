import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ChevronRight, Check } from 'lucide-react';
import { packages, vendors } from '@/data/vendors';

export function FeaturedPackages() {
  const featuredPackages = packages.filter(p => p.featured).slice(0, 3);

  const getVendor = (vendorId: string) => vendors.find(v => v.id === vendorId);

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Popular Packages
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Ready-to-book packages tailored for every type of event
            </p>
          </div>
          <Link to="/browse" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              Browse All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredPackages.map((pkg, index) => {
            const vendor = getVendor(pkg.vendorId);
            if (!vendor) return null;

            return (
              <Link key={pkg.id} to={`/package/${pkg.id}`}>
                <Card 
                  variant="gradient" 
                  className="overflow-hidden group h-full animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={vendor.gallery[0]}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge variant="gradient" className="mb-2">
                        {pkg.type === 'HOURLY' ? (
                          <><Clock className="w-3 h-3 mr-1" /> Hourly</>
                        ) : (
                          <><Calendar className="w-3 h-3 mr-1" /> Daily</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">
                      by {vendor.name}
                    </p>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {pkg.description}
                    </p>
                    
                    <ul className="space-y-1 mb-4">
                      {pkg.includes.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3 h-3 text-trust" />
                          {item}
                        </li>
                      ))}
                      {pkg.includes.length > 3 && (
                        <li className="text-sm text-primary">
                          +{pkg.includes.length - 3} more
                        </li>
                      )}
                    </ul>

                    <div className="flex items-end justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold gradient-text">
                          ${pkg.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                        </span>
                        {pkg.minUnits > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {pkg.minUnits} {pkg.type === 'HOURLY' ? 'hr' : 'day'} min
                          </p>
                        )}
                      </div>
                      <Button variant="gradient" size="sm">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/browse">
            <Button variant="outline" className="gap-2">
              Browse All Packages
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
