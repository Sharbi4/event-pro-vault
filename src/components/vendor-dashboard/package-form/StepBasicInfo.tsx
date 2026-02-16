import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data/categories';
import { PackageFormData } from './PackageFormWizard';
import { FormSection } from './FormSection';
import { Package, FileText, Tag } from 'lucide-react';

interface StepBasicInfoProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepBasicInfo({ formData, updateFormData }: StepBasicInfoProps) {
  // Check if current category is a known one or custom "other"
  const knownIds = categories.map(c => c.id);
  const isCustomCategory = formData.category && !knownIds.includes(formData.category) && formData.category !== 'other';
  const [showCustom, setShowCustom] = useState(isCustomCategory || formData.category === 'other');
  const [customCategory, setCustomCategory] = useState(isCustomCategory ? formData.category : '');

  const handleCategoryChange = (value: string) => {
    if (value === 'other') {
      setShowCustom(true);
      // Don't set category yet — wait for custom input
      if (customCategory) {
        updateFormData({ category: customCategory });
      } else {
        updateFormData({ category: '' });
      }
    } else {
      setShowCustom(false);
      setCustomCategory('');
      updateFormData({ category: value });
    }
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    updateFormData({ category: value });
  };

  return (
    <div className="space-y-5">
      <FormSection
        icon={Package}
        title="Package Name"
        description="Give your package a clear, memorable name"
      >
        <Input
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onTouchStartCapture={(e) => e.stopPropagation()}
          onFocusCapture={(e) => e.stopPropagation()}
          placeholder="e.g., BBQ Feast, Taco Party Package"
          className="text-base"
          autoComplete="off"
        />
      </FormSection>

      <FormSection
        icon={Tag}
        iconColor="text-purple-500"
        title="Category"
        description="Help customers find your package"
      >
        <Select
          value={showCustom ? 'other' : formData.category}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCustom && (
          <Input
            value={customCategory}
            onChange={(e) => handleCustomCategoryChange(e.target.value)}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onTouchStartCapture={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            placeholder="Type your category (e.g., Empanadas, Poke Bowls)"
            className="mt-2 text-base"
            autoFocus
            autoComplete="off"
          />
        )}
      </FormSection>

      <FormSection
        icon={FileText}
        iconColor="text-blue-500"
        title="Description"
        description="Describe what makes this package special"
      >
        <div className="space-y-1.5">
          <Textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onTouchStartCapture={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            placeholder="What's included, what makes it special, and what customers can expect..."
            rows={4}
            className="resize-none text-sm"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground text-right">
            {formData.description.length}/500
          </p>
        </div>
      </FormSection>
    </div>
  );
}
