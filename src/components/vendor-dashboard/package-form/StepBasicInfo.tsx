import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
          placeholder="e.g., BBQ Essentials, Wedding DJ Package"
          className="text-base"
        />
      </FormSection>

      <FormSection
        icon={Tag}
        iconColor="text-purple-500"
        title="Category"
        description="Help customers find your package"
      >
        <Select
          value={formData.category}
          onValueChange={(value) => updateFormData({ category: value })}
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
            placeholder="What's included, what makes it special, and what customers can expect..."
            rows={4}
            className="resize-none text-sm"
          />
          <p className="text-xs text-muted-foreground text-right">
            {formData.description.length}/500
          </p>
        </div>
      </FormSection>
    </div>
  );
}
