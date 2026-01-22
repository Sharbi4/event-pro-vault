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
import { DollarSign, MapPin, Zap, Shield } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';
import { FormSection } from './FormSection';
import { PricingTypeSelector } from './PricingTypeSelector';

interface StepPricingTravelProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepPricingTravel({ formData, updateFormData }: StepPricingTravelProps) {
  return (
    <div className="space-y-5">
      {/* Pricing Type */}
      <FormSection
        icon={DollarSign}
        title="Pricing Type"
        description="How do you charge for this service?"
      >
        <PricingTypeSelector
          type={formData.type}
          onTypeChange={(type) => updateFormData({ type })}
        />
      </FormSection>

      {/* Price & Minimum */}
      <div className="grid grid-cols-2 gap-3">
        <FormSection title="Price" compact>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
              className="pl-8"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per {formData.type === 'HOURLY' ? 'hour' : 'day'}
          </p>
        </FormSection>

        <FormSection title={`Min ${formData.type === 'HOURLY' ? 'Hours' : 'Days'}`} compact>
          <Input
            type="number"
            min="1"
            value={formData.min_units}
            onChange={(e) => updateFormData({ min_units: parseInt(e.target.value) || 1 })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum booking
          </p>
        </FormSection>
      </div>

      {/* Travel Settings */}
      <FormSection
        icon={MapPin}
        iconColor="text-green-500"
        title="Travel Settings"
        description="How far you'll travel for this service"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">Radius (miles)</Label>
            <Input
              type="number"
              min="0"
              value={formData.travel_radius}
              onChange={(e) => updateFormData({ travel_radius: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Fee per mile</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.travel_fee_per_mile || ''}
                onChange={(e) => updateFormData({ travel_fee_per_mile: parseFloat(e.target.value) || 0 })}
                className="pl-7"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Cancellation Policy */}
      <FormSection
        icon={Shield}
        iconColor="text-amber-500"
        title="Cancellation Policy"
      >
        <Select
          value={formData.cancellation_policy}
          onValueChange={(value) => updateFormData({ cancellation_policy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flexible">Flexible - Full refund 24hr before</SelectItem>
            <SelectItem value="moderate">Moderate - Full refund 5 days before</SelectItem>
            <SelectItem value="strict">Strict - 50% refund 7 days before</SelectItem>
            <SelectItem value="non_refundable">Non-refundable</SelectItem>
          </SelectContent>
        </Select>
      </FormSection>

      {/* Instant Book Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Instant Book</p>
            <p className="text-xs text-muted-foreground">Customers book without approval</p>
          </div>
        </div>
        <Switch
          checked={formData.instant_book}
          onCheckedChange={(checked) => updateFormData({ instant_book: checked })}
        />
      </div>
    </div>
  );
}
