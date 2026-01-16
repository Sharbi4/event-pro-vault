import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';

interface PackageFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: VendorPackage | null;
}

export function PackageFormDialog({
  open,
  onClose,
  onSubmit,
  initialData
}: PackageFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'HOURLY' as 'HOURLY' | 'DAILY',
    price: 0,
    min_units: 1,
    includes: [] as string[],
    add_ons: [] as { id: string; name: string; price: number }[],
    requirements: [] as string[],
    instant_book: false,
    is_active: true,
    sort_order: 0
  });

  const [newInclude, setNewInclude] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0 });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type,
        price: initialData.price,
        min_units: initialData.min_units,
        includes: initialData.includes || [],
        add_ons: initialData.add_ons || [],
        requirements: initialData.requirements || [],
        instant_book: initialData.instant_book,
        is_active: initialData.is_active,
        sort_order: initialData.sort_order
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'HOURLY',
        price: 0,
        min_units: 1,
        includes: [],
        add_ons: [],
        requirements: [],
        instant_book: false,
        is_active: true,
        sort_order: 0
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const addInclude = () => {
    if (newInclude.trim()) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()]
      }));
      setNewInclude('');
    }
  };

  const removeInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addAddOn = () => {
    if (newAddOn.name.trim() && newAddOn.price > 0) {
      setFormData(prev => ({
        ...prev,
        add_ons: [...prev.add_ons, { 
          id: `addon_${Date.now()}`, 
          name: newAddOn.name.trim(), 
          price: newAddOn.price 
        }]
      }));
      setNewAddOn({ name: '', price: 0 });
    }
  };

  const removeAddOn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      add_ons: prev.add_ons.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., BBQ Essentials"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this package offers..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Pricing Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'HOURLY' | 'DAILY') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="min_units">Minimum Units</Label>
              <Input
                id="min_units"
                type="number"
                min="1"
                value={formData.min_units}
                onChange={(e) => setFormData(prev => ({ ...prev, min_units: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="instant_book"
                  checked={formData.instant_book}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, instant_book: checked }))}
                />
                <Label htmlFor="instant_book">Instant Book</Label>
              </div>
            </div>
          </div>

          {/* Includes */}
          <div>
            <Label>What's Included</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newInclude}
                onChange={(e) => setNewInclude(e.target.value)}
                placeholder="e.g., Professional DJ"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
              />
              <Button type="button" variant="outline" onClick={addInclude}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.includes.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  {item}
                  <button type="button" onClick={() => removeInclude(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <Label>Add-ons</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newAddOn.name}
                onChange={(e) => setNewAddOn(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Add-on name"
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                value={newAddOn.price || ''}
                onChange={(e) => setNewAddOn(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Price"
                className="w-24"
              />
              <Button type="button" variant="outline" onClick={addAddOn}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.add_ons.map((addon, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  {addon.name} (${addon.price})
                  <button type="button" onClick={() => removeAddOn(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <Label>Requirements</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="e.g., Power outlet within 50ft"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requirements.map((req, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  {req}
                  <button type="button" onClick={() => removeRequirement(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
