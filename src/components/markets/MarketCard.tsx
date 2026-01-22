import { Link } from 'react-router-dom';
import { Market } from '@/data/markets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, DollarSign, Star } from 'lucide-react';
import { format } from 'date-fns';

interface MarketCardProps {
  market: Market;
  isSelected?: boolean;
  onSelect?: (marketId: string) => void;
}

export function MarketCard({ market, isSelected, onSelect }: MarketCardProps) {
  const availabilityPercent = (market.availableSpots / market.totalSpots) * 100;
  
  return (
    <div
      className={`group relative bg-card rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-lg'
          : 'border-border/50 hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={() => onSelect?.(market.id)}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={market.image}
          alt={market.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Type Badge */}
        <Badge
          className={`absolute top-3 left-3 ${
            market.type === 'farmers'
              ? 'bg-green-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}
        >
          {market.type === 'farmers' ? '🥬 Farmers Market' : '🛍️ Flea Market'}
        </Badge>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-white">{market.rating}</span>
        </div>

        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
          <MapPin className="w-3 h-3" />
          <span className="text-xs font-medium">{market.location}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-lg mb-1 line-clamp-1">
          {market.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {market.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {format(new Date(market.nextDate), 'MMM d')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              ${market.pricePerSpot}/spot
            </span>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Available Spots
            </span>
            <span className={`font-medium ${
              availabilityPercent > 30 ? 'text-green-500' : 'text-amber-500'
            }`}>
              {market.availableSpots} / {market.totalSpots}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                availabilityPercent > 30
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>
        </div>

        {/* Schedule */}
        <p className="text-xs text-muted-foreground mb-3">
          📅 {market.schedule}
        </p>

        {/* Action */}
        <Link to={`/market/${market.id}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="gradient" size="sm" className="w-full">
            Reserve a Spot
          </Button>
        </Link>
      </div>
    </div>
  );
}
