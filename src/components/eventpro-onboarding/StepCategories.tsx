import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Search } from 'lucide-react';
import { eventProCategories, EventProCategory } from '@/data/eventpro-categories';
import { cn } from '@/lib/utils';

interface StepCategoriesProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function StepCategories({ selected, onChange }: StepCategoriesProps) {
  const [search, setSearch] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const filteredCategories = eventProCategories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(c => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleOtherSelect = () => {
    if (customLabel.trim()) {
      const customId = `other:${customLabel.trim()}`;
      if (!selected.includes(customId)) {
        onChange([...selected, customId]);
        setCustomLabel('');
      }
    }
  };

  const isOtherSelected = selected.some(s => s.startsWith('other:'));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          What services do you offer?
        </h2>
        <p className="text-muted-foreground text-sm">
          Select all categories that apply. This helps customers find you.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="pl-10 h-12"
        />
      </div>

      {/* Selected count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selected.length} selected {selected.length === 0 && <span className="text-destructive">(at least 1 required)</span>}
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCategories.filter(c => c.id !== 'other').map((category) => {
          const Icon = category.icon;
          const isSelected = selected.includes(category.id);

          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200',
                'hover:border-primary/50 hover:shadow-sm',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card'
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                'text-sm font-medium text-left leading-tight',
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Other Category */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Don't see your category?</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Enter your category"
              className="h-10"
              onKeyDown={(e) => e.key === 'Enter' && handleOtherSelect()}
            />
            <button
              onClick={handleOtherSelect}
              disabled={!customLabel.trim()}
              className={cn(
                'px-4 rounded-lg text-sm font-medium transition-all',
                customLabel.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              Add
            </button>
          </div>

          {/* Custom categories */}
          {selected.filter(s => s.startsWith('other:')).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selected.filter(s => s.startsWith('other:')).map(s => (
                <div
                  key={s}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <span>{s.replace('other:', '')}</span>
                  <button
                    onClick={() => onChange(selected.filter(c => c !== s))}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
