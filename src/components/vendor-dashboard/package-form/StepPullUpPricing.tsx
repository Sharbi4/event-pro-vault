import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, TrendingUp, Layers, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PackageFormData } from './PackageFormWizard';

interface Props {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
  errors?: Record<string, string>;
}

type Model = NonNullable<PackageFormData['pull_up_pricing_model']>;

const MODELS: {
  id: Model;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'show_up_fee',
    title: 'Show-Up Fee',
    description: 'Customer pays a flat fee for you to show up. Guests can pay individually on-site.',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: 'min_guarantee',
    title: 'Minimum Guarantee',
    description: 'Customer guarantees a minimum sales amount for the event.',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 'show_up_plus_min',
    title: 'Show-Up Fee + Minimum Guarantee',
    description: 'Customer pays a fee and guarantees a minimum sales amount.',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'no_upfront',
    title: 'No Upfront Fee',
    description: 'No upfront charge. Guests pay individually on-site.',
    icon: <Users className="w-4 h-4" />,
  },
];

export function StepPullUpPricing({ formData, updateFormData, errors }: Props) {
  const model = formData.pull_up_pricing_model;

  const setModel = (m: Model) => {
    updateFormData({
      pull_up_pricing_model: m,
      pricing_type: 'flat',
      type: 'HOURLY',
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          How do you want to charge for this pull-up?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the model that matches how you make money on these events.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODELS.map((m) => {
          const selected = model === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={cn(
                'text-left rounded-2xl border p-4 transition-all',
                'hover:border-primary/60 hover:shadow-sm relative',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card',
                errors?.pull_up_pricing_model && !selected && 'border-destructive/40'
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
      {errors?.pull_up_pricing_model && (
        <p className="text-xs text-destructive -mt-2">{errors.pull_up_pricing_model}</p>
      )}

      {/* Conditional fields */}
      {model && (
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          {(model === 'show_up_fee' || model === 'show_up_plus_min') && (
            <div>
              <Label className="text-xs">Show-up fee</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  placeholder="150"
                  value={formData.price || ''}
                  onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Flat fee customer pays for you to show up.</p>
            </div>
          )}

          {(model === 'min_guarantee' || model === 'show_up_plus_min') && (
            <div>
              <Label className="text-xs">Minimum guarantee amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  className="pl-8"
                  placeholder="750"
                  value={formData.min_guarantee_amount ?? ''}
                  onChange={(e) =>
                    updateFormData({ min_guarantee_amount: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                If guest sales fall short, the host may be responsible for the difference.
              </p>
            </div>
          )}

          {model === 'no_upfront' && (
            <>
              <div>
                <Label className="text-xs">Estimated minimum attendance (optional)</Label>
                <Input
                  type="number"
                  min="0"
                  className="mt-1"
                  placeholder="e.g. 75 guests"
                  value={formData.min_guests ?? ''}
                  onChange={(e) =>
                    updateFormData({ min_guests: parseInt(e.target.value) || undefined })
                  }
                />
              </div>
              <p className="text-xs bg-muted/60 rounded-lg p-2 text-muted-foreground">
                Best for high-traffic locations with strong expected attendance.
              </p>
            </>
          )}

          {/* Optional deposit */}
          {model !== 'no_upfront' && (
            <div>
              <Label className="text-xs">Deposit (optional)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  className="pl-8"
                  placeholder="0"
                  value={formData.deposit ?? ''}
                  onChange={(e) =>
                    updateFormData({ deposit: parseFloat(e.target.value) || undefined })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Charged at booking to lock the date.
              </p>
            </div>
          )}

          <div>
            <Label className="text-xs">Notes for customer (optional)</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Best for events expecting 100+ guests; tips encouraged."
              className="mt-1"
              value={formData.customer_requirements ?? ''}
              onChange={(e) => updateFormData({ customer_requirements: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
