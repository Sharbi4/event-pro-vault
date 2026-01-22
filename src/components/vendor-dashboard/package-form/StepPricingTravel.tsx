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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DollarSign, MapPin, Zap, Shield, HelpCircle, Settings2, Car } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';
import { FormSection } from './FormSection';
import { PricingTypeSelector, PricingType } from './PricingTypeSelector';
import { AdditionalFeeInput, AdditionalFee } from './AdditionalFeeInput';

interface StepPricingTravelProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepPricingTravel({ formData, updateFormData }: StepPricingTravelProps) {
  const pricingType = formData.pricing_type || 'hourly';
  const isCustomQuote = pricingType === 'custom_quote';
  const showOvertimeRate = pricingType === 'hourly' || pricingType === 'daily';

  // Get price label and suffix based on pricing type
  const getPriceLabel = () => {
    switch (pricingType) {
      case 'flat':
        return 'Total price';
      default:
        return 'Price';
    }
  };

  const getPriceSuffix = () => {
    switch (pricingType) {
      case 'hourly':
        return 'per hour';
      case 'daily':
        return 'per day';
      case 'flat':
        return 'per event';
      case 'per_guest':
        return 'per guest';
      case 'per_item':
        return 'per item';
      default:
        return '';
    }
  };

  // Get minimum booking config
  const getMinimumConfig = () => {
    switch (pricingType) {
      case 'hourly':
        return { label: 'Min Hours', field: 'min_hours' as const, suffix: 'hours' };
      case 'daily':
        return { label: 'Min Days', field: 'min_units' as const, suffix: 'days' };
      case 'per_guest':
        return { label: 'Min Guests', field: 'min_guests' as const, suffix: 'guests' };
      case 'per_item':
        return { label: 'Min Quantity', field: 'min_quantity' as const, suffix: 'items' };
      case 'flat':
        return { label: 'Min Spend', field: 'min_spend' as const, suffix: '', isCurrency: true };
      default:
        return null;
    }
  };

  const minConfig = getMinimumConfig();

  const handlePricingTypeChange = (type: PricingType) => {
    updateFormData({
      pricing_type: type,
      // Also update the legacy type field for compatibility
      type: type === 'hourly' ? 'HOURLY' : 'DAILY',
      // Disable instant book for custom quote
      instant_book: type === 'custom_quote' ? false : formData.instant_book,
    });
  };

  return (
    <div className="space-y-5">
      {/* Pricing Type */}
      <FormSection
        icon={DollarSign}
        title="Pricing Type"
        description="How do you charge for this service?"
      >
        <PricingTypeSelector
          type={pricingType}
          onTypeChange={handlePricingTypeChange}
        />
      </FormSection>

      {/* Price & Minimum */}
      {!isCustomQuote ? (
        <div className="grid grid-cols-2 gap-3">
          <FormSection title={getPriceLabel()} compact>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  updateFormData({ price: value >= 0 ? value : 0 });
                }}
                className="pl-8"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getPriceSuffix()}</p>
          </FormSection>

          {minConfig && (
            <FormSection title={minConfig.label} compact>
              <div className="relative">
                {minConfig.isCurrency && (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                <Input
                  type="number"
                  min={minConfig.isCurrency ? 0 : 1}
                  step={minConfig.isCurrency ? '0.01' : '1'}
                  value={formData[minConfig.field] || (minConfig.isCurrency ? '' : 1)}
                  onChange={(e) => {
                    const value = minConfig.isCurrency
                      ? parseFloat(e.target.value) || 0
                      : parseInt(e.target.value) || 1;
                    updateFormData({ [minConfig.field]: value >= 0 ? value : 0 });
                  }}
                  className={minConfig.isCurrency ? 'pl-8' : ''}
                  placeholder={minConfig.isCurrency ? '0.00' : '1'}
                />
              </div>
              {minConfig.suffix && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum booking
                </p>
              )}
            </FormSection>
          )}
        </div>
      ) : (
        /* Custom Quote: Starting at field */
        <FormSection title="Starting at (optional)" compact>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.starting_at || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFormData({ starting_at: value >= 0 ? value : undefined });
              }}
              className="pl-8"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Show a "starting at" price to attract inquiries
          </p>
        </FormSection>
      )}

      {/* Optional Pricing Extras */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="extras" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Optional Pricing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            {/* Overtime Rate */}
            {showOvertimeRate && (
              <div>
                <Label className="text-xs mb-1.5 block">Overtime rate</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.overtime_rate || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      updateFormData({ overtime_rate: value >= 0 ? value : undefined });
                    }}
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per hour after booking ends</p>
              </div>
            )}

            {/* Deposit */}
            <div>
              <Label className="text-xs mb-1.5 block">Deposit amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deposit || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    updateFormData({ deposit: value >= 0 ? value : undefined });
                  }}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Required upfront to confirm booking</p>
            </div>

            {/* Additional Fees */}
            <div>
              <Label className="text-xs mb-1.5 block">Additional fees</Label>
              <AdditionalFeeInput
                fees={formData.additional_fees || []}
                onChange={(fees) => updateFormData({ additional_fees: fees })}
              />
            </div>

            {/* Tax note */}
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              💡 Taxes are calculated and handled separately at checkout
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Travel Settings */}
      <FormSection
        icon={MapPin}
        iconColor="text-green-500"
        title="Travel Settings"
        description="How far you'll travel for this service"
      >
        {/* Pickup Only Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Pickup only / No travel</p>
              <p className="text-xs text-muted-foreground">Customer comes to you</p>
            </div>
          </div>
          <Switch
            checked={formData.pickup_only || false}
            onCheckedChange={(checked) => updateFormData({ pickup_only: checked })}
          />
        </div>

        {!formData.pickup_only && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <Label className="text-xs">Max travel distance</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        Maximum miles you'll travel from your base location
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_travel_miles ?? formData.travel_radius ?? ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateFormData({ 
                        max_travel_miles: value >= 0 ? value : undefined,
                        travel_radius: value >= 0 ? value : 25 
                      });
                    }}
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    mi
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <Label className="text-xs">Included miles</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        Miles included in the base price (no extra fee)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={formData.included_miles || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateFormData({ included_miles: value >= 0 ? value : 0 });
                    }}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    mi
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Label className="text-xs">Fee per mile (after included)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">
                      Extra charge per mile beyond included miles
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fee_per_mile ?? formData.travel_fee_per_mile ?? ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    updateFormData({ 
                      fee_per_mile: value >= 0 ? value : 0,
                      travel_fee_per_mile: value >= 0 ? value : 0 
                    });
                  }}
                  className="pl-7"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  /mi
                </span>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      {/* Cancellation Policy */}
      <FormSection icon={Shield} iconColor="text-amber-500" title="Cancellation Policy">
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
      {!isCustomQuote ? (
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
      ) : (
        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Quote Required</p>
              <p className="text-xs text-muted-foreground">
                Customers will "Request a Quote" instead of booking directly
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
