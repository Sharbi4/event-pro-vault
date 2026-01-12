import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Check, Zap } from 'lucide-react';
import { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
  vendorName?: string;
}

export function PackageCard({ pkg, vendorName }: PackageCardProps) {
  return (
    <Card variant="glow" className="overflow-hidden group h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2">
            <Badge variant="gradient">
              {pkg.type === 'HOURLY' ? (
                <><Clock className="w-3 h-3 mr-1" /> Hourly</>
              ) : (
                <><Calendar className="w-3 h-3 mr-1" /> Daily</>
              )}
            </Badge>
            {pkg.instantBook && (
              <Badge variant="trust" className="gap-1">
                <Zap className="w-3 h-3" />
                Instant
              </Badge>
            )}
          </div>
        </div>

        <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {pkg.name}
        </h3>
        
        {vendorName && (
          <p className="text-xs text-muted-foreground mb-2">by {vendorName}</p>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {pkg.description}
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-foreground uppercase tracking-wide">Includes:</p>
          <ul className="space-y-1">
            {pkg.includes.slice(0, 4).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3 h-3 text-trust flex-shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {pkg.includes.length > 4 && (
              <li className="text-sm text-primary pl-5">
                +{pkg.includes.length - 4} more included
              </li>
            )}
          </ul>
        </div>

        {pkg.addOns.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            {pkg.addOns.length} add-on{pkg.addOns.length !== 1 ? 's' : ''} available
          </p>
        )}

        <div className="flex items-end justify-between pt-4 border-t border-border mt-auto">
          <div>
            <span className="text-2xl font-bold gradient-text">${pkg.price}</span>
            <span className="text-sm text-muted-foreground">
              /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
            </span>
            {pkg.minUnits > 1 && (
              <p className="text-xs text-muted-foreground">
                {pkg.minUnits} {pkg.type === 'HOURLY' ? 'hour' : 'day'} minimum
              </p>
            )}
          </div>
          <Link to={`/package/${pkg.id}`}>
            <Button variant="gradient" size="sm">
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
