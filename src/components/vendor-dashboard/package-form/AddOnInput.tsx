import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Gift, DollarSign } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface AddOnInputProps {
  addOns: AddOn[];
  onAddOnsChange: (addOns: AddOn[]) => void;
  maxItems?: number;
}

export function AddOnInput({ addOns, onAddOnsChange, maxItems = 10 }: AddOnInputProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const addItem = () => {
    const trimmedName = name.trim();
    const priceNum = parseFloat(price);
    
    if (trimmedName && priceNum > 0 && addOns.length < maxItems) {
      onAddOnsChange([
        ...addOns,
        { id: `addon_${Date.now()}`, name: trimmedName, price: priceNum }
      ]);
      setName('');
      setPrice('');
    }
  };

  const removeItem = (index: number) => {
    onAddOnsChange(addOns.filter((_, i) => i !== index));
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add-on name"
          className="flex-1 h-9"
          disabled={addOns.length >= maxItems}
        />
        <div className="relative w-24">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="pl-6 h-9"
            disabled={addOns.length >= maxItems}
          />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addItem}
          disabled={!name.trim() || !price || parseFloat(price) <= 0 || addOns.length >= maxItems}
          className="h-9 px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {addOns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {addOns.map((addon, i) => (
            <span
              key={addon.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400"
            >
              <Gift className="w-3 h-3" />
              <span className="max-w-[100px] truncate">{addon.name}</span>
              <span className="font-semibold">+${addon.price}</span>
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
