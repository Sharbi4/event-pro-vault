import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, X, DollarSign, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  price?: number;
  category?: 'food' | 'drink';
}

interface Props {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  category: 'food' | 'drink';
  placeholder?: string;
  maxItems?: number;
  /** Show inline error border on the empty/required state */
  required?: boolean;
  hasError?: boolean;
}

const MAX_NAME = 80;
const MAX_DESC = 200;

export function MenuItemsEditor({
  items,
  onChange,
  category,
  placeholder,
  maxItems = 50,
  hasError = false,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [included, setIncluded] = useState(true);
  const [price, setPrice] = useState('');

  const filtered = items.filter((i) => (i.category ?? 'food') === category);

  const addItem = () => {
    const trimmed = name.trim().slice(0, MAX_NAME);
    if (!trimmed || filtered.length >= maxItems) return;
    const priceNum = parseFloat(price);
    const newItem: MenuItem = {
      id: `mi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      description: description.trim().slice(0, MAX_DESC) || undefined,
      included,
      price: !included && !isNaN(priceNum) && priceNum > 0 ? priceNum : undefined,
      category,
    };
    onChange([...items, newItem]);
    setName('');
    setDescription('');
    setPrice('');
    setIncluded(true);
  };

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    onChange(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              ...patch,
              // Clear price if switched back to included
              price: patch.included === true ? undefined : patch.price ?? i.price,
            }
          : i
      )
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing items */}
      {filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((it) => (
            <li
              key={it.id}
              className="rounded-xl border bg-background p-3 flex items-start gap-2"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-1 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm break-words">{it.name}</span>
                  {it.included ? (
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      Included
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      Upgrade · ${it.price?.toFixed(2)}
                    </span>
                  )}
                </div>
                {it.description && (
                  <p className="text-xs text-muted-foreground break-words">{it.description}</p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <Switch
                      checked={it.included}
                      onCheckedChange={(checked) => updateItem(it.id, { included: checked })}
                    />
                    Included in package
                  </label>
                  {!it.included && (
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-7 w-24 pl-6 text-xs"
                        placeholder="Price"
                        value={it.price ?? ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          updateItem(it.id, { price: isNaN(v) ? undefined : v });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeItem(it.id)}
                aria-label={`Remove ${it.name}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div
        className={cn(
          'rounded-xl border border-dashed p-3 space-y-2 bg-muted/30',
          hasError && filtered.length === 0 && 'border-destructive/60 bg-destructive/5'
        )}
      >
        <div className="flex gap-2">
          <Input
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? (category === 'drink' ? 'e.g. Iced tea' : 'e.g. Pulled pork sliders')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addItem}
            disabled={!name.trim()}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <Textarea
          value={description}
          maxLength={MAX_DESC}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          rows={2}
          className="text-sm"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Switch checked={included} onCheckedChange={setIncluded} />
            Included in package
          </label>
          {!included && (
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.01"
                className="h-8 w-28 pl-6 text-xs"
                placeholder="Upgrade $"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {filtered.length}/{maxItems} {category === 'drink' ? 'drinks' : 'menu items'}
      </p>
    </div>
  );
}
