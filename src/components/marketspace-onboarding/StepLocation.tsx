import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { MarketOnboardingState, WeeklyScheduleDay } from '@/hooks/useMarketSpaceOnboarding';
import { MapPin, Clock } from 'lucide-react';

interface StepLocationProps {
  state: MarketOnboardingState;
  updateState: <K extends keyof MarketOnboardingState>(key: K, value: MarketOnboardingState[K]) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

export function StepLocation({ state, updateState }: StepLocationProps) {
  const handlePlaceSelect = (place: {
    formatted_address: string;
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  }) => {
    updateState('formattedAddress', place.formatted_address);
    updateState('lat', place.lat);
    updateState('lng', place.lng);
    if (place.city) updateState('city', place.city);
    if (place.state) updateState('state', place.state);
  };

  const updateScheduleDay = (dayOfWeek: number, updates: Partial<WeeklyScheduleDay>) => {
    const newSchedule = state.weeklySchedule.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    );
    updateState('weeklySchedule', newSchedule);
  };

  return (
    <div className="space-y-8">
      {/* Location Section */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location
          </h2>
          <p className="text-sm text-muted-foreground">
            Where is your market held?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Market Address <span className="text-destructive">*</span>
          </Label>
          <LocationAutocomplete
            value={state.formattedAddress}
            onChange={(value) => updateState('formattedAddress', value)}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search for your market location..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium">
            Timezone
          </Label>
          <Select
            value={state.timezone}
            onValueChange={(value) => updateState('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Weekly Schedule
          </h2>
          <p className="text-sm text-muted-foreground">
            Set your default market hours for each day.
          </p>
        </div>

        <div className="space-y-3">
          {state.weeklySchedule.map((day, idx) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                day.isEnabled ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <Switch
                checked={day.isEnabled}
                onCheckedChange={(checked) => updateScheduleDay(day.dayOfWeek, { isEnabled: checked })}
              />
              <span className={`w-24 text-sm font-medium ${
                day.isEnabled ? 'text-foreground' : 'text-muted-foreground'
              }`}>
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
      </div>

      {/* Setup & Breakdown Windows */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="setupWindow" className="text-sm font-medium">
            Setup Window (minutes)
          </Label>
          <Input
            id="setupWindow"
            type="number"
            value={state.setupWindowMinutes}
            onChange={(e) => updateState('setupWindowMinutes', parseInt(e.target.value) || 0)}
            min={0}
            max={240}
          />
          <p className="text-xs text-muted-foreground">
            How early can Event Pros arrive to set up?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="breakdownWindow" className="text-sm font-medium">
            Breakdown Window (minutes)
          </Label>
          <Input
            id="breakdownWindow"
            type="number"
            value={state.breakdownWindowMinutes}
            onChange={(e) => updateState('breakdownWindowMinutes', parseInt(e.target.value) || 0)}
            min={0}
            max={120}
          />
          <p className="text-xs text-muted-foreground">
            How long after market ends for breakdown?
          </p>
        </div>
      </div>
    </div>
  );
}
