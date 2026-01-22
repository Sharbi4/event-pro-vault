import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, DollarSign } from 'lucide-react';

export interface AdditionalFee {
  id: string;
  name: string;
  amount: number;
}

interface AdditionalFeeInputProps {
  fees: AdditionalFee[];
  onChange: (fees: AdditionalFee[]) => void;
}

export function AdditionalFeeInput({ fees, onChange }: AdditionalFeeInputProps) {
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const amount = parseFloat(newAmount);
    
    if (!name || isNaN(amount) || amount <= 0) return;

    const newFee: AdditionalFee = {
      id: Date.now().toString(),
      name,
      amount,
    };

    onChange([...fees, newFee]);
    setNewName('');
    setNewAmount('');
  };

  const handleRemove = (id: string) => {
    onChange(fees.filter((f) => f.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing fees */}
      {fees.length > 0 && (
        <div className="space-y-2">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 group"
            >
              <span className="flex-1 text-sm truncate">{fee.name}</span>
              <span className="text-sm font-medium text-primary">
                ${fee.amount.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(fee.id)}
                className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new fee */}
      <div className="flex gap-2">
        <Input
          placeholder="Fee name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <div className="relative w-24">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-7"
          />
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleAdd}
          disabled={!newName.trim() || !newAmount}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
