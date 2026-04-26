import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileEdit, Globe, PauseCircle, Archive, Check } from 'lucide-react';

export type PackageStatus = 'draft' | 'published' | 'paused' | 'archived';

interface PackageStatusSelectorProps {
  value: PackageStatus;
  onChange: (status: PackageStatus) => void;
  /** When true, hides "Archived" unless already archived (typical for new packages) */
  isNew?: boolean;
}

interface StatusOption {
  id: PackageStatus;
  label: string;
  tagline: string;
  description: string;
  visibility: string;
  icon: React.ReactNode;
  tone: string;
  badge?: { text: string; className: string };
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    id: 'draft',
    label: 'Draft',
    tagline: 'Not visible. Only you can see it.',
    description:
      'Save your work without going live. Customers cannot find or book this package yet.',
    visibility: 'Hidden from search',
    icon: <FileEdit className="w-5 h-5" />,
    tone: 'text-muted-foreground',
    badge: { text: 'Private', className: 'bg-muted text-muted-foreground' },
  },
  {
    id: 'published',
    label: 'Published',
    tagline: 'Live and bookable.',
    description:
      'Customers can discover this package in search and request or book it based on your rules.',
    visibility: 'Visible in search · Accepts bookings',
    icon: <Globe className="w-5 h-5" />,
    tone: 'text-primary',
    badge: { text: 'Live', className: 'bg-primary/15 text-primary' },
  },
  {
    id: 'paused',
    label: 'Paused',
    tagline: 'Temporarily hidden. No new bookings.',
    description:
      'Existing bookings continue. New customers cannot find or book this package until you resume it. Great for vacations or while you update details.',
    visibility: 'Hidden from search · Existing bookings continue',
    icon: <PauseCircle className="w-5 h-5" />,
    tone: 'text-amber-600 dark:text-amber-500',
    badge: {
      text: 'On hold',
      className: 'bg-amber-500/15 text-amber-600 dark:text-amber-500',
    },
  },
  {
    id: 'archived',
    label: 'Archived',
    tagline: 'Retired. Kept for your records.',
    description:
      'Removes the package from your active list and search. You can restore it later by changing the status. Use this for packages you no longer offer.',
    visibility: 'Hidden everywhere',
    icon: <Archive className="w-5 h-5" />,
    tone: 'text-destructive',
    badge: { text: 'Retired', className: 'bg-destructive/15 text-destructive' },
  },
];

export function PackageStatusSelector({
  value,
  onChange,
  isNew = false,
}: PackageStatusSelectorProps) {
  const options = STATUS_OPTIONS.filter(
    (o) => !(isNew && o.id === 'archived' && value !== 'archived')
  );

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">Package status</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Control who can see and book this package. You can change it any time.
        </p>
      </div>

      <div className="grid gap-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`group text-left transition-all rounded-lg border-2 p-3 sm:p-4 ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
              }`}
              aria-pressed={selected}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${
                    selected ? 'bg-primary text-primary-foreground' : `bg-muted ${opt.tone}`
                  }`}
                >
                  {opt.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {opt.label}
                    </span>
                    {opt.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${opt.badge.className}`}
                      >
                        {opt.badge.text}
                      </Badge>
                    )}
                    {selected && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-foreground/80 mt-0.5 font-medium">
                    {opt.tagline}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80 mt-2">
                    {opt.visibility}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value === 'paused' && (
        <Card className="p-3 bg-amber-500/5 border-amber-500/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Heads up: paused packages still show on bookings already in progress. Only new
            discovery and booking are blocked.
          </p>
        </Card>
      )}
      {value === 'archived' && (
        <Card className="p-3 bg-destructive/5 border-destructive/30">
          <p className="text-xs text-destructive">
            Archiving hides this package everywhere. You can change it back to Draft or
            Published later — nothing is deleted.
          </p>
        </Card>
      )}
    </div>
  );
}
