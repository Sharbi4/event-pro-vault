import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PackageFormData } from './PackageFormWizard';

interface Props {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

const SERVICE_STYLES = [
  'Buffet-style',
  'Truck service',
  'Drop-off catering',
  'Full-service catering',
  'Dessert table setup',
  'Bar service',
  'Coffee cart service',
  'Pickup only',
  'Delivery only',
];

const STAFFING = [
  'No staff included',
  'Vendor/operator included',
  'Serving staff included',
  'Bartender included',
  'Extra staff available as add-on',
];

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function StepCateringGuestsService({ formData, updateFormData }: Props) {
  // We piggy-back on best_for[] as a multi-tag field for service-style + staffing tags.
  // To keep them separated cleanly, we prefix tags: "style:" and "staff:".
  const bestFor = formData.best_for || [];
  const styles = bestFor.filter((b) => b.startsWith('style:')).map((b) => b.slice(6));
  const staff = bestFor.filter((b) => b.startsWith('staff:')).map((b) => b.slice(6));

  const toggle = (prefix: 'style' | 'staff', value: string) => {
    const tag = `${prefix}:${value}`;
    const next = bestFor.includes(tag)
      ? bestFor.filter((b) => b !== tag)
      : [...bestFor, tag];
    updateFormData({ best_for: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Who is this package built for?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set the guest count range, service style, and what staffing is included.
        </p>
      </div>

      {/* Guest counts */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Users className="w-4 h-4 text-primary" />
          Guest count
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Minimum</Label>
            <Input
              type="number"
              min="1"
              className="mt-1"
              placeholder="e.g. 25"
              value={formData.min_guests ?? ''}
              onChange={(e) =>
                updateFormData({ min_guests: parseInt(e.target.value) || undefined })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Included</Label>
            <Input
              type="number"
              min="1"
              className="mt-1"
              placeholder="e.g. 50"
              value={formData.included_guests ?? ''}
              onChange={(e) =>
                updateFormData({ included_guests: parseInt(e.target.value) || null })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Maximum</Label>
            <Input
              type="number"
              min="1"
              className="mt-1"
              placeholder="e.g. 150"
              value={formData.max_guests ?? ''}
              onChange={(e) =>
                updateFormData({ max_guests: parseInt(e.target.value) || undefined })
              }
            />
          </div>
        </div>
      </div>

      {/* Service style */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Service style</Label>
        <Chips options={SERVICE_STYLES} selected={styles} onToggle={(v) => toggle('style', v)} />
      </div>

      {/* Staffing */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Staffing included</Label>
        <Chips options={STAFFING} selected={staff} onToggle={(v) => toggle('staff', v)} />
      </div>
    </div>
  );
}
