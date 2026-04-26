import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Asterisk, Check, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerQuestionsPickerProps {
  category: string | null | undefined;
  /**
   * Stored format (text[]):
   *   - "Question text"            → selected as Optional
   *   - "Question text|required"   → selected as Required
   * Anything not present in the array is Off.
   */
  selected: string[];
  onChange: (next: string[]) => void;
}

type QState = 'off' | 'optional' | 'required';

const REQUIRED_SUFFIX = '|required';

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

function questionsForCategory(
  category: string | null | undefined
): { title: string; items: string[] }[] {
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

function getState(question: string, selected: string[]): QState {
  if (selected.includes(`${question}${REQUIRED_SUFFIX}`)) return 'required';
  if (selected.includes(question)) return 'optional';
  return 'off';
}

function setState(
  question: string,
  next: QState,
  selected: string[]
): string[] {
  // Strip both forms first
  const base = selected.filter(
    (s) => s !== question && s !== `${question}${REQUIRED_SUFFIX}`
  );
  if (next === 'optional') return [...base, question];
  if (next === 'required') return [...base, `${question}${REQUIRED_SUFFIX}`];
  return base;
}

function cycle(state: QState): QState {
  if (state === 'off') return 'optional';
  if (state === 'optional') return 'required';
  return 'off';
}

export function CustomerQuestionsPicker({
  category,
  selected,
  onChange,
}: CustomerQuestionsPickerProps) {
  const groups = questionsForCategory(category);

  const counts = selected.reduce(
    (acc, s) => {
      if (s.endsWith(REQUIRED_SUFFIX)) acc.required += 1;
      else acc.optional += 1;
      return acc;
    },
    { required: 0, optional: 0 }
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <MessageCircleQuestion className="w-4 h-4 text-primary" />
        <Label className="text-base font-semibold">Customer questions</Label>
        {counts.required > 0 && (
          <Badge variant="secondary" className="text-xs bg-primary/15 text-primary">
            {counts.required} required
          </Badge>
        )}
        {counts.optional > 0 && (
          <Badge variant="secondary" className="text-xs">
            {counts.optional} optional
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Tap once to add as <span className="font-medium">optional</span>, again to mark{' '}
        <span className="font-medium">required</span>, again to remove.
      </p>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm border border-border bg-background" />
          Off
        </span>
        <span className="inline-flex items-center gap-1">
          <Check className="w-3 h-3 text-primary" />
          Optional
        </span>
        <span className="inline-flex items-center gap-1">
          <Asterisk className="w-3 h-3 text-primary" />
          Required
        </span>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((q) => {
              const state = getState(q, selected);
              const isOptional = state === 'optional';
              const isRequired = state === 'required';

              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => onChange(setState(q, cycle(state), selected))}
                  aria-pressed={state !== 'off'}
                  aria-label={`${q} — ${state}`}
                  className={cn(
                    'group inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full border text-xs transition-all',
                    state === 'off' &&
                      'border-border bg-background hover:border-primary/40',
                    isOptional && 'border-primary/60 bg-primary/5 text-primary',
                    isRequired && 'border-primary bg-primary/15 text-primary font-medium'
                  )}
                >
                  {isRequired ? (
                    <Asterisk className="w-3 h-3" />
                  ) : isOptional ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-muted-foreground/40" />
                  )}
                  <span>{q}</span>
                  {isRequired && (
                    <span className="ml-1 text-[9px] uppercase tracking-wide opacity-80">
                      Required
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {counts.required + counts.optional === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No questions selected — customers can book without extra info.
        </p>
      )}
    </div>
  );
}

/** Helper for downstream consumers (e.g. checkout) to parse stored entries. */
export function parseCustomerQuestion(entry: string): {
  text: string;
  required: boolean;
} {
  if (entry.endsWith(REQUIRED_SUFFIX)) {
    return { text: entry.slice(0, -REQUIRED_SUFFIX.length), required: true };
  }
  return { text: entry, required: false };
}
