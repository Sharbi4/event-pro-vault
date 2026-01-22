import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface TagInputProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  tagIcon?: LucideIcon;
  tagColor?: string;
  maxItems?: number;
}

export function TagInput({
  items,
  onItemsChange,
  placeholder = 'Add item...',
  tagIcon: TagIcon,
  tagColor = 'bg-primary/10 text-primary',
  maxItems = 20,
}: TagInputProps) {
  const [value, setValue] = useState('');

  const addItem = () => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed) && items.length < maxItems) {
      onItemsChange([...items, trimmed]);
      setValue('');
    }
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-9"
          disabled={items.length >= maxItems}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addItem}
          disabled={!value.trim() || items.length >= maxItems}
          className="h-9 px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tagColor}`}
            >
              {TagIcon && <TagIcon className="w-3 h-3" />}
              <span className="max-w-[150px] truncate">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="hover:opacity-70 transition-opacity ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
