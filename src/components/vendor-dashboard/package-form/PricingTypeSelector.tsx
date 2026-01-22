import { Clock, Calendar } from 'lucide-react';

interface PricingTypeSelectorProps {
  type: 'HOURLY' | 'DAILY';
  onTypeChange: (type: 'HOURLY' | 'DAILY') => void;
}

export function PricingTypeSelector({ type, onTypeChange }: PricingTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onTypeChange('HOURLY')}
        className={`p-3 rounded-xl border-2 transition-all text-left ${
          type === 'HOURLY'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            type === 'HOURLY' ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <Clock className={`w-4 h-4 ${type === 'HOURLY' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium text-sm">Hourly</p>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onTypeChange('DAILY')}
        className={`p-3 rounded-xl border-2 transition-all text-left ${
          type === 'DAILY'
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            type === 'DAILY' ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <Calendar className={`w-4 h-4 ${type === 'DAILY' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium text-sm">Daily</p>
            <p className="text-xs text-muted-foreground">Per day</p>
          </div>
        </div>
      </button>
    </div>
  );
}
