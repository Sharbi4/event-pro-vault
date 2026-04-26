import { Clock, Calendar, DollarSign, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PricingType = 'hourly' | 'daily' | 'flat' | 'per_guest' | 'per_item';

interface PricingTypeSelectorProps {
  type: PricingType;
  onTypeChange: (type: PricingType) => void;
}

const pricingTypes: {
  id: PricingType;
  label: string;
  helper: string;
  icon: typeof Clock;
}[] = [
  { id: 'hourly', label: 'Hourly', helper: 'Per hour', icon: Clock },
  { id: 'daily', label: 'Daily', helper: 'Per day', icon: Calendar },
  { id: 'flat', label: 'Flat Rate', helper: 'Per event', icon: DollarSign },
  { id: 'per_guest', label: 'Per Guest', helper: 'Per person', icon: Users },
  { id: 'per_item', label: 'Per Item', helper: 'Per unit', icon: Package },
];

export function PricingTypeSelector({ type, onTypeChange }: PricingTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {pricingTypes.map((pt) => {
        const Icon = pt.icon;
        const isSelected = type === pt.id;

        return (
          <button
            key={pt.id}
            type="button"
            onClick={() => onTypeChange(pt.id)}
            className={cn(
              'p-3 rounded-xl border-2 transition-all text-left',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  isSelected ? 'bg-primary/10' : 'bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{pt.label}</p>
                <p className="text-xs text-muted-foreground truncate">{pt.helper}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
