import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SlotType } from '@/hooks/useMarketSpaceOnboarding';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  DollarSign,
  Ruler,
  Loader2,
  Store
} from 'lucide-react';

interface StepSlotTypesProps {
  slotTypes: SlotType[];
  setSlotTypes: React.Dispatch<React.SetStateAction<SlotType[]>>;
  saveSlotType: (slotType: SlotType) => Promise<string | null>;
  deleteSlotType: (id: string) => Promise<void>;
  marketId: string | null;
}

const SLOT_CATEGORIES = [
  { value: 'booth_tent', label: 'Booth / Tent' },
  { value: 'food_truck', label: 'Food Truck Space' },
  { value: 'trailer', label: 'Trailer Space' },
  { value: 'table', label: 'Table Space' },
  { value: 'indoor_stall', label: 'Indoor Stall' },
  { value: 'other', label: 'Other' },
];

const SIZE_PRESETS = [
  { value: '5x5', label: '5×5 ft' },
  { value: '10x10', label: '10×10 ft' },
  { value: '10x15', label: '10×15 ft' },
  { value: '10x20', label: '10×20 ft' },
  { value: '20x20', label: '20×20 ft' },
  { value: 'custom', label: 'Custom Size' },
];

const PRICING_UNITS = [
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_event', label: 'Per Event' },
  { value: 'per_weekend', label: 'Per Weekend' },
];

const AMENITIES = [
  'Power access',
  'Water access',
  'Wi-Fi',
  'Lighting',
  'Table provided',
  'Chairs provided',
  'Tent allowed',
  'Tent provided',
  'Shade/covered',
  'End-cap / corner spot',
  'High-traffic area',
  'Indoor',
  'Overnight storage',
  'Security',
  'Trash service',
  'Restrooms nearby',
  'Loading zone',
  'Parking pass',
];

const REQUIREMENTS = [
  'Business license',
  'Liability insurance',
  'Food permit',
  'Health department certification',
  'COI (Certificate of Insurance)',
];

const defaultSlotType: Omit<SlotType, 'id'> = {
  name: '',
  category: 'booth_tent',
  sizePreset: '10x10',
  price: 0,
  pricingUnit: 'per_day',
  amenities: [],
  requirements: [],
  notes: '',
  sortOrder: 0,
  isActive: true,
};

export function StepSlotTypes({
  slotTypes,
  setSlotTypes,
  saveSlotType,
  deleteSlotType,
  marketId,
}: StepSlotTypesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotType | null>(null);
  const [formData, setFormData] = useState<Omit<SlotType, 'id'>>(defaultSlotType);
  const [saving, setSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingSlot(null);
    setFormData({ ...defaultSlotType, sortOrder: slotTypes.length });
    setIsDialogOpen(true);
  };

  const openEditDialog = (slot: SlotType) => {
    setEditingSlot(slot);
    setFormData(slot);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    
    setSaving(true);
    try {
      const slotToSave: SlotType = editingSlot 
        ? { ...formData, id: editingSlot.id }
        : formData as SlotType;
      
      const savedId = await saveSlotType(slotToSave);
      
      if (savedId) {
        if (editingSlot) {
          setSlotTypes(prev => prev.map(s => s.id === savedId ? { ...slotToSave, id: savedId } : s));
        } else {
          setSlotTypes(prev => [...prev, { ...slotToSave, id: savedId }]);
        }
        setIsDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSlotType(id);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleRequirement = (req: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(req)
        ? prev.requirements.filter(r => r !== req)
        : [...prev.requirements, req]
    }));
  };

  const getCategoryLabel = (value: string) => 
    SLOT_CATEGORIES.find(c => c.value === value)?.label || value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Slot Types
          </h2>
          <p className="text-sm text-muted-foreground">
            Create different types of Event Pro spaces you offer.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2" disabled={!marketId}>
          <Plus className="w-4 h-4" />
          Add Slot Type
        </Button>
      </div>

      {!marketId && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30">
          <p className="text-sm text-amber-600">
            Complete the previous steps first to create slot types.
          </p>
        </Card>
      )}

      {/* Slot Types List */}
      {slotTypes.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No slot types yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create at least one slot type to define your Event Pro spaces.
          </p>
          <Button onClick={openCreateDialog} variant="outline" className="gap-2" disabled={!marketId}>
            <Plus className="w-4 h-4" />
            Create First Slot Type
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slotTypes.map(slot => (
            <Card key={slot.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{slot.name}</h3>
                    <Badge variant="outline">{getCategoryLabel(slot.category)}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {slot.sizePreset && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {slot.sizePreset}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${slot.price} / {slot.pricingUnit.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {slot.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {slot.amenities.slice(0, 4).map(a => (
                        <Badge key={a} variant="secondary" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                      {slot.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{slot.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(slot)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => slot.id && handleDelete(slot.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? 'Edit Slot Type' : 'Create Slot Type'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Slot Type Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., 10x10 Booth, Premium Corner Spot"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={formData.sizePreset || 'custom'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  sizePreset: value === 'custom' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_PRESETS.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.sizePreset === undefined && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Width (ft)"
                    value={formData.widthFeet || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, widthFeet: parseInt(e.target.value) || undefined }))}
                  />
                  <Input
                    type="number"
                    placeholder="Length (ft)"
                    value={formData.lengthFeet || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lengthFeet: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              )}
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pricing Unit *</Label>
                <Select
                  value={formData.pricingUnit}
                  onValueChange={(value: 'per_day' | 'per_event' | 'per_weekend') => 
                    setFormData(prev => ({ ...prev, pricingUnit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>What's Included</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {formData.amenities.includes(amenity) && <Check className="w-3 h-3 mr-1" />}
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label>Event Pro Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {REQUIREMENTS.map(req => (
                  <Badge
                    key={req}
                    variant={formData.requirements.includes(req) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRequirement(req)}
                  >
                    {formData.requirements.includes(req) && <Check className="w-3 h-3 mr-1" />}
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes / Restrictions</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g., No generators, no amplified music..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.price}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingSlot ? 'Save Changes' : 'Create Slot Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
