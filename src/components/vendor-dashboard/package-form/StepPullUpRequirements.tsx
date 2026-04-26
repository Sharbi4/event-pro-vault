import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Zap, Droplet, Power, Home, Ruler, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PackageFormData } from './PackageFormWizard';
import { CustomerQuestionsPicker } from './CustomerQuestionsPicker';

interface Props {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

const REQ_OPTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'truck_parking', label: 'Truck/trailer parking required', icon: <MapPin className="w-4 h-4" /> },
  { id: 'power_required', label: 'Power required', icon: <Zap className="w-4 h-4" /> },
  { id: 'water_required', label: 'Water required', icon: <Droplet className="w-4 h-4" /> },
  { id: 'generator_available', label: 'Generator available (I bring my own)', icon: <Power className="w-4 h-4" /> },
  { id: 'outdoor_only', label: 'Outdoor service only', icon: <Home className="w-4 h-4" /> },
  { id: 'space_dimensions', label: 'Specific space dimensions needed', icon: <Ruler className="w-4 h-4" /> },
  { id: 'access_instructions', label: 'Customer must provide access instructions', icon: <FileText className="w-4 h-4" /> },
  { id: 'permit_may_be_required', label: 'Permit may be required at some locations', icon: <ShieldCheck className="w-4 h-4" /> },
];

export function StepPullUpRequirements({ formData, updateFormData }: Props) {
  const requirements = formData.requirements || [];

  const toggle = (id: string) => {
    const next = requirements.includes(id)
      ? requirements.filter((r) => r !== id)
      : [...requirements, id];
    updateFormData({ requirements: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          What do you need at the location?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll ask the customer about each one before they confirm.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {REQ_OPTIONS.map((opt) => {
          const checked = requirements.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                checked
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <Checkbox checked={checked} className="pointer-events-none" />
              <div className="text-muted-foreground">{opt.icon}</div>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Customer questions
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Pick the questions customers must answer so you know what to expect on-site.
        </p>
        <CustomerQuestionsPicker
          category={formData.category}
          selected={formData.customer_questions}
          onChange={(qs) => updateFormData({ customer_questions: qs })}
        />
      </div>
    </div>
  );
}
