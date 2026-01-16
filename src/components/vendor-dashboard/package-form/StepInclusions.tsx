import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X, Check, Gift, AlertCircle, DollarSign } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';

interface StepInclusionsProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepInclusions({ formData, updateFormData }: StepInclusionsProps) {
  const [newInclude, setNewInclude] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0 });

  const addInclude = () => {
    if (newInclude.trim()) {
      updateFormData({ includes: [...formData.includes, newInclude.trim()] });
      setNewInclude('');
    }
  };

  const removeInclude = (index: number) => {
    updateFormData({ includes: formData.includes.filter((_, i) => i !== index) });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      updateFormData({ requirements: [...formData.requirements, newRequirement.trim()] });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    updateFormData({ requirements: formData.requirements.filter((_, i) => i !== index) });
  };

  const addAddOn = () => {
    if (newAddOn.name.trim() && newAddOn.price > 0) {
      updateFormData({
        add_ons: [
          ...formData.add_ons,
          { id: `addon_${Date.now()}`, name: newAddOn.name.trim(), price: newAddOn.price }
        ]
      });
      setNewAddOn({ name: '', price: 0 });
    }
  };

  const removeAddOn = (index: number) => {
    updateFormData({ add_ons: formData.add_ons.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">What's included in this package?</h3>
        <p className="text-muted-foreground text-sm">
          List everything customers get with this package, plus any optional add-ons.
        </p>
      </div>

      {/* What's Included */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <Label className="font-medium">What's Included</Label>
        </div>

        <div className="flex gap-2">
          <Input
            value={newInclude}
            onChange={(e) => setNewInclude(e.target.value)}
            placeholder="e.g., Professional sound system, 4 hours of service"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={addInclude}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.includes.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm"
            >
              <Check className="w-3 h-3" />
              {item}
              <button
                type="button"
                onClick={() => removeInclude(i)}
                className="hover:text-destructive ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {formData.includes.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No inclusions added yet</p>
          )}
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-purple-500" />
          <Label className="font-medium">Optional Add-ons</Label>
        </div>

        <div className="flex gap-2">
          <Input
            value={newAddOn.name}
            onChange={(e) => setNewAddOn(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Add-on name"
            className="flex-1"
          />
          <div className="relative w-28">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              value={newAddOn.price || ''}
              onChange={(e) => setNewAddOn(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Price"
              className="pl-7"
            />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={addAddOn}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.add_ons.map((addon, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm"
            >
              <Gift className="w-3 h-3" />
              {addon.name}
              <span className="font-medium">(+${addon.price})</span>
              <button
                type="button"
                onClick={() => removeAddOn(i)}
                className="hover:text-destructive ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {formData.add_ons.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No add-ons added yet</p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <Label className="font-medium">Requirements (optional)</Label>
        </div>

        <div className="flex gap-2">
          <Input
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="e.g., Power outlet within 50ft, Covered area for rain"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={addRequirement}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.requirements.map((req, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm"
            >
              <AlertCircle className="w-3 h-3" />
              {req}
              <button
                type="button"
                onClick={() => removeRequirement(i)}
                className="hover:text-destructive ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {formData.requirements.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No requirements added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
