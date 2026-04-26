import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarketOnboardingState } from '@/hooks/useMarketSpaceOnboarding';
import { Check, X } from 'lucide-react';

interface StepBasicsProps {
  state: MarketOnboardingState;
  updateState: <K extends keyof MarketOnboardingState>(key: K, value: MarketOnboardingState[K]) => void;
}

const MARKET_TYPES = [
  { value: 'farmers_market', label: 'Farmers Market' },
  { value: 'flea_market', label: 'Flea Market' },
  { value: 'vendor_market', label: 'Event Pro Market' },
  { value: 'night_market', label: 'Night Market' },
  { value: 'popup_event', label: 'Pop-up Event' },
  { value: 'food_truck_roundup', label: 'Food Truck Roundup' },
  { value: 'festival_vendor_area', label: 'Festival Event Pro Area' },
  { value: 'other', label: 'Other' },
];

const VENDOR_CATEGORIES = [
  'Food Trucks',
  'Food Pop-ups',
  'Artisans / Handmade',
  'Vintage / Thrift',
  'Farmers / Produce',
  'Baked Goods / Cottage Bakery',
  'Coffee / Beverage',
  'Apparel',
  'Beauty / Self-care',
  'Home Goods',
  'Other',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function StepBasics({ state, updateState }: StepBasicsProps) {
  const toggleCategory = (category: string) => {
    const current = state.categoriesAllowed;
    if (current.includes(category)) {
      updateState('categoriesAllowed', current.filter(c => c !== category));
    } else {
      updateState('categoriesAllowed', [...current, category]);
    }
  };

  const toggleMonth = (month: string) => {
    const current = state.seasonalMonths;
    if (current.includes(month)) {
      updateState('seasonalMonths', current.filter(m => m !== month));
    } else {
      updateState('seasonalMonths', [...current, month]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Market Basics
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell Event Pros what your market is all about.
        </p>
      </div>

      {/* Market Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Market Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={state.name}
          onChange={(e) => updateState('name', e.target.value)}
          placeholder="e.g., Downtown Farmers Market"
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          This is the exact name shown publicly
        </p>
      </div>

      {/* Market Type */}
      <div className="space-y-2">
        <Label htmlFor="marketType" className="text-sm font-medium">
          Market Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={state.marketType}
          onValueChange={(value) => updateState('marketType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select market type" />
          </SelectTrigger>
          <SelectContent>
            {MARKET_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) => updateState('description', e.target.value)}
          placeholder="What can Event Pros expect at your market?"
          rows={4}
        />
      </div>

      {/* Crowd Description */}
      <div className="space-y-2">
        <Label htmlFor="crowdDescription" className="text-sm font-medium">
          Crowd / Audience Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="crowdDescription"
          value={state.crowdDescription}
          onChange={(e) => updateState('crowdDescription', e.target.value)}
          placeholder="e.g., Family-friendly, local neighborhood, tourists, college crowd..."
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Help Event Pros understand who they'll be selling to
        </p>
      </div>

      {/* Categories Allowed */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Categories Allowed
        </Label>
        <div className="flex flex-wrap gap-2">
          {VENDOR_CATEGORIES.map(category => (
            <Badge
              key={category}
              variant={state.categoriesAllowed.includes(category) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                state.categoriesAllowed.includes(category)
                  ? 'bg-primary hover:bg-primary/90'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleCategory(category)}
            >
              {state.categoriesAllowed.includes(category) && (
                <Check className="w-3 h-3 mr-1" />
              )}
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Operating Season */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Operating Season</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={state.operatingSeason === 'year-round' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateState('operatingSeason', 'year-round')}
          >
            Year-round
          </Button>
          <Button
            type="button"
            variant={state.operatingSeason === 'seasonal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateState('operatingSeason', 'seasonal')}
          >
            Seasonal
          </Button>
        </div>

        {state.operatingSeason === 'seasonal' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {MONTHS.map(month => (
              <Badge
                key={month}
                variant={state.seasonalMonths.includes(month) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  state.seasonalMonths.includes(month)
                    ? 'bg-primary hover:bg-primary/90'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleMonth(month)}
              >
                {month.slice(0, 3)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
