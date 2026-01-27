import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Image,
  Clock,
  Package,
  Sparkles,
  Star,
  CreditCard,
  Banknote,
  Zap,
} from 'lucide-react';
import { OnboardingState, MediaItem, WeeklyAvailability } from '@/hooks/useEventProOnboarding';
import { eventProCategories } from '@/data/eventpro-categories';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { PublishChecklist } from './PublishChecklist';

interface StepReviewProps {
  state: OnboardingState;
  packages: VendorPackage[];
  onPublish: () => Promise<boolean>;
  canPublish: { canPublish: boolean; missing: string[] };
  saving: boolean;
  stripeStatus?: string;
  onConnectStripe?: () => void;
}

export function StepReview({
  state,
  packages,
  onPublish,
  canPublish,
  saving,
  stripeStatus = 'not_started',
  onConnectStripe,
}: StepReviewProps) {
  const coverPhoto = state.mediaItems.find((m) => m.isCover && m.type === 'image') || 
                     state.mediaItems.find((m) => m.type === 'image');
  
  const getCategoryLabel = (id: string) => {
    const cat = eventProCategories.find(c => c.id === id);
    return cat?.name || id;
  };

  const getEnabledDays = (availability: WeeklyAvailability[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return availability
      .filter(a => a.isEnabled)
      .map(a => days[a.dayOfWeek])
      .join(', ');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Review & Publish
        </h2>
        <p className="text-muted-foreground text-sm">
          Review your profile before going live
        </p>
      </div>

      {/* Publish Checklist */}
      <PublishChecklist
        state={state}
        packages={packages}
        stripeStatus={stripeStatus}
        onConnectStripe={onConnectStripe}
      />

      {/* Profile Preview Card */}
      <Card variant="glass" className="overflow-hidden">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10">
            {coverPhoto && (
              <img
                src={coverPhoto.url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-muted border-4 border-background flex items-center justify-center overflow-hidden">
                {coverPhoto ? (
                  <img
                    src={coverPhoto.url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg truncate">
                  {state.profileBasics.displayName || 'Your Business Name'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {state.serviceArea.city && state.serviceArea.state
                      ? `${state.serviceArea.city}, ${state.serviceArea.state}`
                      : 'Service Area'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {state.profileBasics.shortBio || 'Your short bio will appear here...'}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {state.categories.slice(0, 3).map((catId) => (
              <Badge key={catId} variant="secondary" className="text-xs">
                {getCategoryLabel(catId)}
              </Badge>
            ))}
            {state.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{state.categories.length - 3} more
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Image className="w-4 h-4" />
                <span className="font-bold">{state.mediaItems.length}</span>
              </div>
              <span className="text-xs text-muted-foreground">Photos</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Package className="w-4 h-4" />
                <span className="font-bold">{packages.length}</span>
              </div>
              <span className="text-xs text-muted-foreground">Packages</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <MapPin className="w-4 h-4" />
                <span className="font-bold">{state.serviceArea.travelRadiusMiles}</span>
              </div>
              <span className="text-xs text-muted-foreground">mi radius</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-3">
        {/* Availability Summary */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Availability</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {state.bufferSettings.availableByRequestOnly
                    ? 'By request only'
                    : getEnabledDays(state.weeklyAvailability) || 'Not set'}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Packages Summary */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Packages</h4>
                <p className="text-xs text-muted-foreground">
                  {packages.length === 0
                    ? 'No packages yet - you can add them later'
                    : `${packages.length} package${packages.length === 1 ? '' : 's'} ready`}
                </p>
              </div>
              {packages.length > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Warning */}
      {packages.length === 0 && (
        <Card variant="glass" className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Packages help you appear in search
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Profiles with packages get 5x more views. You can add them now or later from your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Ready */}
      {canPublish.canPublish && (
        <Card variant="glass" className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                You're ready to go live!
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Your profile meets all requirements. Publish now to start appearing in search results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Button */}
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={onPublish}
        disabled={!canPublish.canPublish || saving}
      >
        {saving ? (
          <>
            <Star className="w-5 h-5 mr-2 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Publish My Profile
          </>
        )}
      </Button>

      {!canPublish.canPublish && (
        <p className="text-center text-xs text-muted-foreground">
          Complete the missing requirements above to publish
        </p>
      )}
    </div>
  );
}
