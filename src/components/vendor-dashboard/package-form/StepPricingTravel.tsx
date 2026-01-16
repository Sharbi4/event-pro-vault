import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Clock, Calendar, MapPin, Zap } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';

interface StepPricingTravelProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepPricingTravel({ formData, updateFormData }: StepPricingTravelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Set your pricing & travel details</h3>
        <p className="text-muted-foreground text-sm">
          Define how you charge and how far you're willing to travel.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Pricing Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.type === 'HOURLY'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
            onClick={() => updateFormData({ type: 'HOURLY' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Hourly</p>
                <p className="text-xs text-muted-foreground">Charge per hour</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.type === 'DAILY'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
            onClick={() => updateFormData({ type: 'DAILY' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Daily</p>
                <p className="text-xs text-muted-foreground">Charge per day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Minimum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Per {formData.type === 'HOURLY' ? 'hour' : 'day'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_units">Minimum {formData.type === 'HOURLY' ? 'Hours' : 'Days'}</Label>
            <Input
              id="min_units"
              type="number"
              min="1"
              value={formData.min_units}
              onChange={(e) => updateFormData({ min_units: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-muted-foreground">
              Minimum booking duration
            </p>
          </div>
        </div>

        {/* Travel Settings */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <Label className="font-medium">Travel Settings</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travel_radius">Travel Radius (miles)</Label>
              <Input
                id="travel_radius"
                type="number"
                min="0"
                value={formData.travel_radius}
                onChange={(e) => updateFormData({ travel_radius: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                How far you'll travel from your location
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_fee">Travel Fee ($ per mile)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="travel_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.travel_fee_per_mile || ''}
                  onChange={(e) => updateFormData({ travel_fee_per_mile: parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set to 0 if no travel fee
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="space-y-2">
          <Label htmlFor="cancellation">Cancellation Policy</Label>
          <Select
            value={formData.cancellation_policy}
            onValueChange={(value) => updateFormData({ cancellation_policy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">
                Flexible - Full refund up to 24 hours before
              </SelectItem>
              <SelectItem value="moderate">
                Moderate - Full refund up to 5 days before
              </SelectItem>
              <SelectItem value="strict">
                Strict - 50% refund up to 7 days before
              </SelectItem>
              <SelectItem value="non_refundable">
                Non-refundable - No refunds
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Instant Book */}
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium">Instant Book</p>
              <p className="text-xs text-muted-foreground">
                Allow customers to book without approval
              </p>
            </div>
          </div>
          <Switch
            checked={formData.instant_book}
            onCheckedChange={(checked) => updateFormData({ instant_book: checked })}
          />
        </div>
      </div>
    </div>
  );
}
