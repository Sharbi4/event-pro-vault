import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  Calendar,
  Plus,
  X,
  Info,
  Globe,
  AlertCircle
} from 'lucide-react';
import { WeeklyAvailability, BufferSettings } from '@/hooks/useEventProOnboarding';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StepAvailabilityProps {
  weeklyAvailability: WeeklyAvailability[];
  bufferSettings: BufferSettings;
  timezone: string;
  onWeeklyChange: (availability: WeeklyAvailability[]) => void;
  onBufferChange: (settings: BufferSettings) => void;
  onTimezoneChange: (timezone: string) => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${displayHour}:${minute} ${ampm}`,
  };
});

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

export function StepAvailability({
  weeklyAvailability,
  bufferSettings,
  timezone,
  onWeeklyChange,
  onBufferChange,
  onTimezoneChange,
}: StepAvailabilityProps) {
  const updateDay = (dayOfWeek: number, updates: Partial<WeeklyAvailability>) => {
    onWeeklyChange(
      weeklyAvailability.map(day =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      )
    );
  };

  const updateBuffer = <K extends keyof BufferSettings>(
    key: K,
    value: BufferSettings[K]
  ) => {
    onBufferChange({ ...bufferSettings, [key]: value });
  };

  const hasEnabledDays = weeklyAvailability.some(d => d.isEnabled);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Set your availability
        </h2>
        <p className="text-muted-foreground text-sm">
          Define when you're available for bookings
        </p>
      </div>

      {/* Timezone */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-medium">Timezone</span>
          </div>

          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">Weekly Schedule</span>
            </div>
            {!hasEnabledDays && !bufferSettings.availableByRequestOnly && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Set at least 1 day
              </span>
            )}
          </div>

          <div className="space-y-3">
            {weeklyAvailability.map((day) => (
              <div
                key={day.dayOfWeek}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  day.isEnabled ? 'bg-primary/5' : 'bg-muted/50'
                )}
              >
                {/* Day Toggle */}
                <Switch
                  checked={day.isEnabled}
                  onCheckedChange={(checked) => updateDay(day.dayOfWeek, { isEnabled: checked })}
                />

                {/* Day Name */}
                <span className={cn(
                  'w-12 text-sm font-medium',
                  !day.isEnabled && 'text-muted-foreground'
                )}>
                  {shortDayNames[day.dayOfWeek]}
                </span>

                {/* Time Range */}
                {day.isEnabled ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Select
                      value={day.startTime}
                      onValueChange={(value) => updateDay(day.dayOfWeek, { startTime: value })}
                    >
                      <SelectTrigger className="h-9 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">to</span>

                    <Select
                      value={day.endTime}
                      onValueChange={(value) => updateDay(day.dayOfWeek, { endTime: value })}
                    >
                      <SelectTrigger className="h-9 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buffer Settings */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">Buffer Time</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Buffer time between bookings to prepare</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Before bookings</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[bufferSettings.bufferBeforeMinutes]}
                  onValueChange={([value]) => updateBuffer('bufferBeforeMinutes', value)}
                  min={0}
                  max={120}
                  step={15}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {bufferSettings.bufferBeforeMinutes}m
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">After bookings</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[bufferSettings.bufferAfterMinutes]}
                  onValueChange={([value]) => updateBuffer('bufferAfterMinutes', value)}
                  min={0}
                  max={120}
                  step={15}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {bufferSettings.bufferAfterMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Respect Setup/Breakdown */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm">Include package setup/breakdown time</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Automatically add setup and breakdown times from your packages</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={bufferSettings.respectSetupBreakdown}
              onCheckedChange={(checked) => updateBuffer('respectSetupBreakdown', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Request Only Mode */}
      <Card variant="glass" className={cn(
        'transition-all',
        bufferSettings.availableByRequestOnly && 'border-primary/50 bg-primary/5'
      )}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">Available by request only</p>
              <p className="text-xs text-muted-foreground mt-1">
                All bookings will require your approval before being confirmed
              </p>
            </div>
            <Switch
              checked={bufferSettings.availableByRequestOnly}
              onCheckedChange={(checked) => updateBuffer('availableByRequestOnly', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card variant="glass" className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">How this affects your listings:</p>
              <p className="text-muted-foreground mt-1">
                {bufferSettings.availableByRequestOnly
                  ? 'Your packages will show "Request to Book" and require your approval.'
                  : hasEnabledDays
                    ? `Your packages will be available for booking on ${weeklyAvailability.filter(d => d.isEnabled).length} days per week.`
                    : 'Set your availability to allow customers to book your packages.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
