import { useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/hooks/useMarketDetail';

interface FomoStripProps {
  nextInventory: InventoryItem | null;
  totalSlots: number;
  slotsRemaining: number;
  minPrice: number | null;
  onReserve: () => void;
  className?: string;
  compact?: boolean;
}

export function FomoStrip({
  nextInventory,
  totalSlots,
  slotsRemaining,
  minPrice,
  onReserve,
  className,
  compact = false,
}: FomoStripProps) {
  const urgencyLevel = useMemo(() => {
    if (slotsRemaining <= 0) return 'sold-out';
    if (slotsRemaining <= 3) return 'critical';
    if (slotsRemaining <= 10 || slotsRemaining / totalSlots <= 0.2) return 'high';
    return 'normal';
  }, [slotsRemaining, totalSlots]);

  const daysUntil = useMemo(() => {
    if (!nextInventory) return null;
    return differenceInDays(parseISO(nextInventory.date), new Date());
  }, [nextInventory]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!nextInventory && slotsRemaining <= 0) {
    return (
      <div className={cn(
        "flex items-center justify-center gap-3 py-3 px-4 bg-muted text-muted-foreground rounded-xl",
        className
      )}>
        <span className="text-sm font-medium">No upcoming spots available</span>
      </div>
    );
  }

  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'sold-out':
        return 'bg-muted text-muted-foreground';
      case 'critical':
        return 'bg-gradient-to-r from-destructive/15 to-destructive/5 border border-destructive/30';
      case 'high':
        return 'bg-gradient-to-r from-trust/20 to-trust/5 border border-trust/30';
      default:
        return 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20';
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between gap-3 py-3 px-4 rounded-xl",
        getUrgencyStyles(),
        className
      )}>
        <div className="flex items-center gap-3">
          {urgencyLevel === 'critical' && (
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          )}
          {urgencyLevel === 'high' && (
            <TrendingUp className="w-4 h-4 text-trust shrink-0" />
          )}
          <div className="text-sm">
            <span className="font-semibold text-foreground">
              {slotsRemaining > 0 ? `Only ${slotsRemaining} left` : 'Sold out'}
            </span>
            {minPrice && slotsRemaining > 0 && (
              <span className="text-muted-foreground"> • From ${minPrice}</span>
            )}
          </div>
        </div>
        {slotsRemaining > 0 && (
          <Button size="sm" variant="gradient" onClick={onReserve}>
            Reserve
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-5 rounded-xl",
      getUrgencyStyles(),
      className
    )}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          {urgencyLevel === 'critical' && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Selling Fast
            </Badge>
          )}
          {urgencyLevel === 'high' && (
            <Badge variant="trust" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              High Demand
            </Badge>
          )}
          {daysUntil !== null && daysUntil <= 7 && daysUntil >= 0 && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : 'This week'}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {nextInventory && (
            <>
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {format(parseISO(nextInventory.date), 'EEE, MMM d')}
              </span>
              <span className="text-muted-foreground">
                {formatTime(nextInventory.startTime)} – {formatTime(nextInventory.endTime)}
              </span>
            </>
          )}
        </div>

        <div className="text-sm">
          <span className={cn(
            "font-semibold",
            urgencyLevel === 'critical' && "text-destructive",
            urgencyLevel === 'high' && "text-trust",
            urgencyLevel === 'normal' && "text-foreground",
          )}>
            {slotsRemaining} of {totalSlots} spots remaining
          </span>
          {minPrice && (
            <span className="text-muted-foreground"> • From ${minPrice}/spot</span>
          )}
        </div>
      </div>

      <Button 
        variant="gradient" 
        onClick={onReserve}
        disabled={slotsRemaining <= 0}
      >
        {slotsRemaining > 0 ? 'Reserve Now' : 'Sold Out'}
      </Button>
    </div>
  );
}
