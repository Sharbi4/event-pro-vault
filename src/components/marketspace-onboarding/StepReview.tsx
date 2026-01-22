import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketOnboardingState, SlotType, SlotInventoryItem } from '@/hooks/useMarketSpaceOnboarding';
import { Check, AlertCircle, Loader2, Rocket, MapPin, Calendar, Store } from 'lucide-react';
import { format } from 'date-fns';

interface StepReviewProps {
  state: MarketOnboardingState;
  slotTypes: SlotType[];
  inventory: SlotInventoryItem[];
  canPublish: () => { canPublish: boolean; missing: string[] };
  onPublish: () => Promise<boolean>;
  saving: boolean;
}

export function StepReview({ state, slotTypes, inventory, canPublish, onPublish, saving }: StepReviewProps) {
  const { canPublish: isReady, missing } = canPublish();
  const coverImage = state.coverImageUrl || state.mediaItems[0]?.url;
  const upcomingDates = inventory.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Review & Publish
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your market listing before going live.
        </p>
      </div>

      {/* Requirements Check */}
      {!isReady && (
        <Card className="p-4 bg-destructive/10 border-destructive/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive mb-2">Missing requirements</p>
              <ul className="text-sm text-destructive/80 space-y-1">
                {missing.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Card */}
      <Card className="overflow-hidden">
        {coverImage && (
          <div className="h-40 bg-muted">
            <img src={coverImage} alt={state.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">{state.name || 'Untitled Market'}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {state.city || 'Location not set'}{state.state ? `, ${state.state}` : ''}
              </p>
            </div>
            <Badge>{state.marketType?.replace('_', ' ') || 'Market'}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{state.description}</p>

          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Store className="w-4 h-4 text-primary" />
              {slotTypes.length} slot types
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              {inventory.length} dates
            </span>
          </div>
        </div>
      </Card>

      {/* Upcoming Dates */}
      {upcomingDates.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Upcoming Dates</h3>
          <div className="flex flex-wrap gap-2">
            {upcomingDates.map(inv => (
              <Badge key={inv.id} variant="outline">
                {format(new Date(inv.date), 'MMM d')} • {inv.slotsRemaining} slots
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Publish Button */}
      {isReady && (
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium text-green-600">Ready to publish!</p>
              <p className="text-sm text-green-600/80">Your market meets all requirements.</p>
            </div>
            <Button onClick={onPublish} disabled={saving} variant="gradient" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Publish
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
