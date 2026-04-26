import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { MediaUploadGrid } from '@/components/vendor-dashboard/package-form/MediaUploadGrid';
import { MarketOnboardingState, MediaItem, WeeklyScheduleDay } from '@/hooks/useMarketSpaceOnboarding';
import { Check, Loader2, MapPin, Clock, Camera, Save } from 'lucide-react';

interface MarketListingTabProps {
  market: MarketOnboardingState;
  updateMarket: (data: Partial<MarketOnboardingState>) => Promise<void>;
  saving: boolean;
}

const MARKET_TYPES = [
  { value: 'farmers_market', label: 'Farmers Market' },
  { value: 'flea_market', label: 'Flea Market' },
  { value: 'vendor_market', label: 'Vendor Market' },
  { value: 'night_market', label: 'Night Market' },
  { value: 'popup_event', label: 'Pop-up Event' },
  { value: 'food_truck_roundup', label: 'Food Truck Roundup' },
  { value: 'festival_vendor_area', label: 'Festival Vendor Area' },
  { value: 'other', label: 'Other' },
];

const VENDOR_CATEGORIES = [
  'Food Trucks', 'Food Pop-ups', 'Artisans / Handmade', 'Vintage / Thrift',
  'Farmers / Produce', 'Baked Goods / Cottage Bakery', 'Coffee / Beverage',
  'Apparel', 'Beauty / Self-care', 'Home Goods', 'Other',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
];

export function MarketListingTab({ market, updateMarket, saving }: MarketListingTabProps) {
  const [localState, setLocalState] = useState(market);
  const [hasChanges, setHasChanges] = useState(false);

  const updateLocal = <K extends keyof MarketOnboardingState>(key: K, value: MarketOnboardingState[K]) => {
    setLocalState(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateMarket(localState);
    setHasChanges(false);
  };

  const toggleCategory = (category: string) => {
    const current = localState.categoriesAllowed;
    if (current.includes(category)) {
      updateLocal('categoriesAllowed', current.filter(c => c !== category));
    } else {
      updateLocal('categoriesAllowed', [...current, category]);
    }
  };

  const updateScheduleDay = (dayOfWeek: number, updates: Partial<WeeklyScheduleDay>) => {
    const newSchedule = localState.weeklySchedule.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    );
    updateLocal('weeklySchedule', newSchedule);
  };

  const handlePlaceSelect = (place: { formatted_address: string; lat: number; lng: number; city?: string; state?: string }) => {
    setLocalState(prev => ({
      ...prev,
      formattedAddress: place.formatted_address,
      lat: place.lat,
      lng: place.lng,
      city: place.city || prev.city,
      state: place.state || prev.state,
    }));
    setHasChanges(true);
  };

  const handleImagesChange = (images: string[]) => {
    const newMediaItems: MediaItem[] = images.map(url => ({
      url,
      type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image',
    }));
    updateLocal('mediaItems', newMediaItems);
    if (images.length > 0 && !localState.coverImageUrl) {
      updateLocal('coverImageUrl', images[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Save Banner */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="p-3 flex items-center gap-4 shadow-lg">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </Card>
        </div>
      )}

      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold mb-4">Basic Information</h3>
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Market Name</Label>
              <Input
                value={localState.name}
                onChange={(e) => updateLocal('name', e.target.value)}
                placeholder="e.g., Downtown Farmers Market"
              />
            </div>
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select value={localState.marketType} onValueChange={(v) => updateLocal('marketType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MARKET_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={localState.description}
              onChange={(e) => updateLocal('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Crowd Description</Label>
            <Textarea
              value={localState.crowdDescription}
              onChange={(e) => updateLocal('crowdDescription', e.target.value)}
              rows={2}
              placeholder="Family-friendly, local neighborhood..."
            />
          </div>

          <div className="space-y-2">
            <Label>Categories Allowed</Label>
            <div className="flex flex-wrap gap-2">
              {VENDOR_CATEGORIES.map(cat => (
                <Badge
                  key={cat}
                  variant={localState.categoriesAllowed.includes(cat) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(cat)}
                >
                  {localState.categoriesAllowed.includes(cat) && <Check className="w-3 h-3 mr-1" />}
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location
        </h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <LocationAutocomplete
              value={localState.formattedAddress}
              onChange={(v) => updateLocal('formattedAddress', v)}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={localState.timezone} onValueChange={(v) => updateLocal('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Weekly Schedule
        </h3>
        <div className="space-y-3">
          {localState.weeklySchedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                day.isEnabled ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <Switch
                checked={day.isEnabled}
                onCheckedChange={(checked) => updateScheduleDay(day.dayOfWeek, { isEnabled: checked })}
              />
              <span className={`w-24 text-sm font-medium ${day.isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                {DAYS[day.dayOfWeek]}
              </span>
              {day.isEnabled && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateScheduleDay(day.dayOfWeek, { startTime: e.target.value })}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateScheduleDay(day.dayOfWeek, { endTime: e.target.value })}
                    className="w-28"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Media */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Photos & Videos
        </h3>
        <MediaUploadGrid
          images={localState.mediaItems.map(m => m.url)}
          onImagesChange={handleImagesChange}
          maxItems={20}
        />
      </Card>

      {/* Publishing */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold mb-4">Publishing</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Publish Listing</p>
              <p className="text-sm text-muted-foreground">Make your market visible to Vendors</p>
            </div>
            <Switch
              checked={localState.isPublished}
              onCheckedChange={(checked) => updateLocal('isPublished', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Accept Bookings</p>
              <p className="text-sm text-muted-foreground">Allow Vendors to reserve slots</p>
            </div>
            <Switch
              checked={localState.bookingsEnabled}
              onCheckedChange={(checked) => updateLocal('bookingsEnabled', checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
