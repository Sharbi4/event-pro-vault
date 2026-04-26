import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Users, Layers, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PackageFormData } from './PackageFormWizard';

interface Props {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
  errors?: Record<string, string>;
}

type Model = NonNullable<PackageFormData['catering_pricing_model']>;

const MODELS: {
  id: Model;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'flat',
    title: 'Flat Package Price',
    description: 'One price for the full package.',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: 'per_person',
    title: 'Per-Person Pricing',
    description: 'Price changes based on guest count.',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'base_plus_per_person',
    title: 'Base + Per-Person',
    description: 'A starting price plus per-guest pricing.',
    icon: <Layers className="w-4 h-4" />,
  },
];

const BALANCE_TIMING: { value: NonNullable<PackageFormData['balance_due_timing']>; label: string }[] = [
  { value: 'before_event', label: 'Before event' },
  { value: 'day_of_event', label: 'Day of event' },
  { value: 'after_event', label: 'After event' },
  { value: 'direct_to_vendor', label: 'Paid directly to vendor' },
];

export function StepCateringPricing({ formData, updateFormData, errors }: Props) {
  const model = formData.catering_pricing_model;

  const setModel = (m: Model) => {
    updateFormData({
      catering_pricing_model: m,
      pricing_type: m === 'per_person' ? 'per_guest' : 'flat',
      type: 'HOURLY',
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">How do you price this package?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the model that fits how you quote catering events.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {MODELS.map((m) => {
          const selected = model === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={cn(
                'text-left rounded-2xl border p-4 transition-all relative',
                'hover:border-primary/60 hover:shadow-sm',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card',
                errors?.catering_pricing_model && !selected && 'border-destructive/40'
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
                  selected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                )}
              >
                {m.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
            </button>
          );
        })}
      </div>
      {errors?.catering_pricing_model && (
        <p className="text-xs text-destructive -mt-2">{errors.catering_pricing_model}</p>
      )}

      {model && (
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          {model === 'flat' && (
            <>
              <PriceInput
                label="Base price"
                placeholder="850"
                value={formData.price}
                onChange={(v) => updateFormData({ price: v })}
                error={errors?.price}
              />
              <NumberInput
                label="Guests included"
                placeholder="50"
                value={formData.included_guests ?? undefined}
                onChange={(v) => updateFormData({ included_guests: v ?? null })}
                error={errors?.included_guests}
              />
              <PriceInput
                label="Additional guest fee (optional)"
                placeholder="0"
                value={formData.additional_per_person ?? undefined}
                onChange={(v) => updateFormData({ additional_per_person: v ?? null })}
                error={errors?.additional_per_person}
              />
            </>
          )}

          {model === 'per_person' && (
            <>
              <PriceInput
                label="Price per person"
                placeholder="18"
                value={formData.price}
                onChange={(v) => updateFormData({ price: v })}
                error={errors?.price}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Min guests"
                  placeholder="50"
                  value={formData.min_guests ?? undefined}
                  onChange={(v) => updateFormData({ min_guests: v })}
                  error={errors?.min_guests}
                />
                <NumberInput
                  label="Max guests"
                  placeholder="200"
                  value={formData.max_guests ?? undefined}
                  onChange={(v) => updateFormData({ max_guests: v })}
                  error={errors?.max_guests}
                />
              </div>
              <PriceInput
                label="Minimum booking total (optional)"
                placeholder="900"
                value={formData.min_spend ?? undefined}
                onChange={(v) => updateFormData({ min_spend: v ?? undefined })}
              />
            </>
          )}

          {model === 'base_plus_per_person' && (
            <>
              <PriceInput
                label="Base price"
                placeholder="600"
                value={formData.price}
                onChange={(v) => updateFormData({ price: v })}
                error={errors?.price}
              />
              <NumberInput
                label="Guests included in base"
                placeholder="30"
                value={formData.included_guests ?? undefined}
                onChange={(v) => updateFormData({ included_guests: v ?? null })}
                error={errors?.included_guests}
              />
              <PriceInput
                label="Additional price per person"
                placeholder="15"
                value={formData.additional_per_person ?? undefined}
                onChange={(v) => updateFormData({ additional_per_person: v ?? null })}
                error={errors?.additional_per_person}
              />
              <NumberInput
                label="Max guests"
                placeholder="150"
                value={formData.max_guests ?? undefined}
                onChange={(v) => updateFormData({ max_guests: v })}
                error={errors?.max_guests}
              />
            </>
          )}
        </div>
      )}

      {/* Deposit & balance */}
      {model && (
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          <div>
            <Label className="text-sm font-semibold">Do you require a deposit?</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: 'full', label: 'No deposit' },
                { value: 'deposit', label: 'Percentage deposit' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateFormData({ payment_mode: opt.value as 'full' | 'deposit' })}
                  className={cn(
                    'rounded-xl border p-3 text-xs font-medium transition-all',
                    formData.payment_mode === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formData.payment_mode === 'deposit' && (
            <div>
              <Label className="text-xs">Deposit percentage</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  min={10}
                  max={90}
                  step={5}
                  className="pr-8"
                  value={formData.deposit_percentage ?? 50}
                  onChange={(e) =>
                    updateFormData({ deposit_percentage: parseInt(e.target.value) || 50 })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Balance due timing</Label>
            <Select
              value={formData.balance_due_timing ?? 'before_event'}
              onValueChange={(v) =>
                updateFormData({ balance_due_timing: v as PackageFormData['balance_due_timing'] })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALANCE_TIMING.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="relative mt-1">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          step="0.01"
          className={cn('pl-8', error && 'border-destructive focus-visible:ring-destructive')}
          placeholder={placeholder}
          value={value ?? ''}
          aria-invalid={!!error}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) ? undefined : v);
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NumberInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  error?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min="0"
        step="1"
        className={cn('mt-1', error && 'border-destructive focus-visible:ring-destructive')}
        placeholder={placeholder}
        value={value ?? ''}
        aria-invalid={!!error}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          onChange(isNaN(v) ? undefined : v);
        }}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
