import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, DollarSign, Star, Clock, Tent } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BrowseMarket } from '@/hooks/useBrowseMarkets';

interface BrowseMarketCardProps {
  market: BrowseMarket;
}

const marketTypeColors: Record<string, string> = {
  'Farmers Market': 'bg-green-500/90 text-white',
  'Flea Market': 'bg-amber-500/90 text-white',
  'Vendor Market': 'bg-blue-500/90 text-white',
  'Night Market': 'bg-purple-500/90 text-white',
  'Pop-up Event': 'bg-pink-500/90 text-white',
  'Food Truck Roundup': 'bg-orange-500/90 text-white',
  'Festival Vendor Area': 'bg-red-500/90 text-white',
};

const marketTypeEmojis: Record<string, string> = {
  'Farmers Market': '🥬',
  'Flea Market': '🛍️',
  'Vendor Market': '🏪',
  'Night Market': '🌙',
  'Pop-up Event': '🎪',
  'Food Truck Roundup': '🚚',
  'Festival Vendor Area': '🎉',
};

export function BrowseMarketCard({ market }: BrowseMarketCardProps) {
  const formatTime = (timeRange: string) => {
    const [start, end] = timeRange.split('-');
    const formatSingleTime = (t: string) => {
      const [hours, minutes] = t.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}${minutes !== '00' ? `:${minutes}` : ''}${ampm}`;
    };
    return `${formatSingleTime(start)}–${formatSingleTime(end)}`;
  };

  return (
    <Link to={`/market/${market.id}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          {market.coverImageUrl ? (
            <img
              src={market.coverImageUrl}
              alt={market.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Tent className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Type Badge */}
          <Badge className={`absolute top-3 left-3 ${marketTypeColors[market.marketType] || 'bg-gray-500/90 text-white'}`}>
            {marketTypeEmojis[market.marketType] || '🏪'} {market.marketType}
          </Badge>

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-white">{market.rating.toFixed(1)}</span>
          </div>

          {/* Location overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
            <MapPin className="w-3 h-3" />
            <span className="text-xs font-medium">{market.city}, {market.state}</span>
          </div>

          {/* Slots remaining */}
          {market.totalSlotsRemaining > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-trust/90 text-white border-0">
                <Users className="w-3 h-3 mr-1" />
                {market.totalSlotsRemaining} spots
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {market.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {market.description || market.crowdDescription || 'Local market space for vendors'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {market.nextDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {format(parseISO(market.nextDate), 'MMM d')}
                </span>
              </div>
            )}
            {market.nextTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {formatTime(market.nextTime)}
                </span>
              </div>
            )}
            {market.minPrice && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  From <span className="font-medium text-foreground">${market.minPrice}</span>/spot
                </span>
              </div>
            )}
          </div>

          {/* Categories */}
          {market.categoriesAllowed.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {market.categoriesAllowed.slice(0, 3).map(cat => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {market.categoriesAllowed.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{market.categoriesAllowed.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* No upcoming dates */}
          {!market.nextDate && (
            <p className="text-xs text-muted-foreground mb-3">
              No upcoming dates posted
            </p>
          )}

          <Button variant="gradient" size="sm" className="w-full">
            Reserve a Spot
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
