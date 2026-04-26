import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PackageKind } from './StepPackageType';

interface PackageBasicsExtrasProps {
  kind: PackageKind | null;
  category: string | null | undefined;
  cuisineStyles: string[];
  bestFor: string[];
  minGuests?: number;
  maxGuests?: number;
  packageName: string;
  onChange: (updates: {
    cuisine_styles?: string[];
    best_for?: string[];
    min_guests?: number;
    max_guests?: number;
    name?: string;
  }) => void;
}

const CUISINE_STYLES = [
  'Tacos', 'BBQ', 'Soul Food', 'Burgers', 'Pizza', 'Coffee',
  'Desserts', 'Vegan', 'Seafood', 'Wings', 'Brunch', 'Latin',
  'Caribbean', 'Mediterranean',
];

const BEST_FOR = [
  'Apartment event', 'Office lunch', 'Corporate event', 'Birthday party',
  'Wedding', 'Graduation', 'School event', 'Market / pop-up',
  'Brewery', 'Neighborhood event', 'Private party',
];

function nameSuggestions(category: string | null | undefined, kind: PackageKind | null): string[] {
  const cat = (category || '').toLowerCase();
  if (cat.includes('bartender') || cat.includes('bar')) {
    return kind === 'pull_up'
      ? ['Bartender Service, 4 Hours', 'Mobile Bar Setup', 'Brewery Pop-Up Bar']
      : ['Wedding Bar Service', 'Mocktail Bar Package', 'Corporate Bar Catering'];
  }
  if (cat.includes('coffee') || cat.includes('drink')) {
    return kind === 'pull_up'
      ? ['Coffee Cart Pop-Up', 'Office Coffee Bar', 'Brunch Coffee Service']
      : ['Coffee Catering for 30', 'Wedding Coffee Bar'];
  }
  if (cat.includes('baker') || cat.includes('dessert') || cat.includes('cake')) {
    return kind === 'pull_up'
      ? ['Dessert Truck Visit', 'Cookie Pop-Up']
      : ['Custom Cake Package', 'Cupcake Box Catering', 'Dessert Table for 30', 'Cookie Party Box'];
  }
  // Default = food trucks / mobile food
  return kind === 'pull_up'
    ? ['Taco Truck Pull-Up, 3 Hours', 'Late Night Food Truck Service', 'Office Lunch Truck Visit']
    : ['Private Food Truck Catering', 'Taco Catering for 50 Guests', 'Office Lunch Package'];
}

export function PackageBasicsExtras({
  kind,
  category,
  cuisineStyles,
  bestFor,
  minGuests,
  maxGuests,
  packageName,
  onChange,
}: PackageBasicsExtrasProps) {
  const suggestions = nameSuggestions(category, kind);

  const toggleCuisine = (c: string) => {
    onChange({
      cuisine_styles: cuisineStyles.includes(c)
        ? cuisineStyles.filter((x) => x !== c)
        : [...cuisineStyles, c],
    });
  };

  const toggleBestFor = (b: string) => {
    onChange({
      best_for: bestFor.includes(b) ? bestFor.filter((x) => x !== b) : [...bestFor, b],
    });
  };

  return (
    <div className="space-y-5">
      {/* Smart name suggestions */}
      {!packageName?.trim() && suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Quick name ideas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ name: s })}
                className="px-3 py-1.5 rounded-full border border-dashed border-border bg-background text-xs hover:border-primary hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cuisine / style */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Cuisine / style</Label>
        <p className="text-xs text-muted-foreground">Pick all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {CUISINE_STYLES.map((c) => {
            const sel = cuisineStyles.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCuisine(c)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-all',
                  sel
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/40'
                )}
              >
                {sel && <Check className="w-3 h-3" />}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Best for */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Best for</Label>
        <p className="text-xs text-muted-foreground">Where does this package shine?</p>
        <div className="flex flex-wrap gap-2">
          {BEST_FOR.map((b) => {
            const sel = bestFor.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBestFor(b)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-all',
                  sel
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/40'
                )}
              >
                {sel && <Check className="w-3 h-3" />}
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guest count range */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Guest count range</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Helps customers know if you're a fit. Leave blank if flexible.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Minimum</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={minGuests ?? ''}
              onChange={(e) =>
                onChange({
                  min_guests: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              placeholder="e.g., 20"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Maximum</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxGuests ?? ''}
              onChange={(e) =>
                onChange({
                  max_guests: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              placeholder="e.g., 100"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
