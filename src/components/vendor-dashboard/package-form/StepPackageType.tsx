import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, ChefHat, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PackageKind = 'pull_up' | 'catering';

interface StepPackageTypeProps {
  value: PackageKind | null;
  onChange: (kind: PackageKind) => void;
}

const PULL_UP_EXAMPLES = [
  'Taco Truck Pull-Up, 3 Hours',
  'Coffee Cart Pop-Up',
  'Dessert Truck Visit',
  'Mobile Bar Service',
];

const CATERING_EXAMPLES = [
  'Taco Catering for 50 Guests',
  'Dessert Table for 30',
  'Office Lunch Package',
  'Mobile Bartender, 4 Hours',
];

export function StepPackageType({ value, onChange }: StepPackageTypeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">
          What kind of package are you creating?
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick the format. You can create more packages anytime.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TypeCard
          selected={value === 'pull_up'}
          onClick={() => onChange('pull_up')}
          icon={<Truck className="w-5 h-5" />}
          title="Pull-Up Booking"
          description="For showing up at apartments, offices, markets, breweries, schools, neighborhoods, and pop-ups."
          examples={PULL_UP_EXAMPLES}
          cta="Create pull-up package"
        />
        <TypeCard
          selected={value === 'catering'}
          onClick={() => onChange('catering')}
          icon={<ChefHat className="w-5 h-5" />}
          title="Catering Package"
          description="For private events, birthdays, weddings, corporate lunches, graduations, and prepaid group orders."
          examples={CATERING_EXAMPLES}
          cta="Create catering package"
        />
      </div>

      <Card className="p-4 bg-muted/40 border-dashed">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Need a custom quote for one customer?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You'll be able to create <span className="font-medium text-foreground">Private Packages</span>{' '}
              from your message threads — perfect for one-off requests that don't fit a public package.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TypeCard({
  selected,
  onClick,
  icon,
  title,
  description,
  examples,
  cta,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
  cta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left rounded-2xl border p-5 transition-all relative',
        'hover:border-primary/60 hover:shadow-sm',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-card'
      )}
    >
      {selected && (
        <Badge className="absolute top-3 right-3 gap-1">
          <Check className="w-3 h-3" /> Selected
        </Badge>
      )}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary group-hover:bg-primary/20'
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {description}
      </p>
      <ul className="space-y-1 mb-4">
        {examples.map((ex) => (
          <li key={ex} className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            {ex}
          </li>
        ))}
      </ul>
      <span
        className={cn(
          'inline-flex text-xs font-medium',
          selected ? 'text-primary' : 'text-foreground/70 group-hover:text-primary'
        )}
      >
        {cta} →
      </span>
    </button>
  );
}
