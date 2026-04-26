import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerQuestionsPickerProps {
  category: string | null | undefined;
  selected: string[];
  onChange: (next: string[]) => void;
}

const GENERAL_QUESTIONS = [
  'What type of event is this?',
  'Is there parking for a truck or trailer?',
  'Is power available?',
  'Is water available?',
  'Is this indoor or outdoor?',
  'How many guests are expected?',
  'Are there any dietary restrictions?',
  'Do you need service staff?',
];

const BARTENDER_QUESTIONS = [
  'Will alcohol be provided by the customer?',
  'Do you need mixers or garnishes?',
  'Is this a private event or public venue?',
];

const BAKER_QUESTIONS = [
  'Pickup or delivery?',
  'Flavor preferences?',
  'Theme or colors?',
  'Allergy notes?',
];

function questionsForCategory(category: string | null | undefined): { title: string; items: string[] }[] {
  const cat = (category || '').toLowerCase();
  const groups: { title: string; items: string[] }[] = [
    { title: 'General', items: GENERAL_QUESTIONS },
  ];
  if (cat.includes('bartender') || cat.includes('bar') || cat.includes('drink')) {
    groups.push({ title: 'Mobile bartender', items: BARTENDER_QUESTIONS });
  }
  if (cat.includes('baker') || cat.includes('dessert') || cat.includes('cake')) {
    groups.push({ title: 'Cottage baker', items: BAKER_QUESTIONS });
  }
  return groups;
}

export function CustomerQuestionsPicker({
  category,
  selected,
  onChange,
}: CustomerQuestionsPickerProps) {
  const groups = questionsForCategory(category);
  const toggle = (q: string) => {
    if (selected.includes(q)) {
      onChange(selected.filter((s) => s !== q));
    } else {
      onChange([...selected, q]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion className="w-4 h-4 text-primary" />
        <Label className="text-base font-semibold">Customer questions</Label>
        {selected.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selected.length} selected
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Pick questions customers must answer when they request this package.
      </p>

      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((q) => {
              const isSelected = selected.includes(q);
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => toggle(q)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/40'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
