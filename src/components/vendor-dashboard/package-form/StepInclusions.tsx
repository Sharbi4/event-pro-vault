import { Check, Gift, AlertCircle } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';
import { FormSection } from './FormSection';
import { TagInput } from './TagInput';
import { AddOnInput } from './AddOnInput';

interface StepInclusionsProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepInclusions({ formData, updateFormData }: StepInclusionsProps) {
  return (
    <div className="space-y-6">
      {/* What's Included */}
      <FormSection
        icon={Check}
        iconColor="text-green-500"
        title="What's Included"
        description="List everything customers get with this package"
      >
        <TagInput
          items={formData.includes}
          onItemsChange={(includes) => updateFormData({ includes })}
          placeholder="e.g., Professional sound system, 4 hours of service"
          tagIcon={Check}
          tagColor="bg-green-500/10 text-green-700 dark:text-green-400"
        />
      </FormSection>

      {/* Add-ons */}
      <FormSection
        icon={Gift}
        iconColor="text-purple-500"
        title="Optional Add-ons"
        description="Extra services customers can purchase"
      >
        <AddOnInput
          addOns={formData.add_ons}
          onAddOnsChange={(add_ons) => updateFormData({ add_ons })}
        />
      </FormSection>

      {/* Requirements */}
      <FormSection
        icon={AlertCircle}
        iconColor="text-amber-500"
        title="Requirements"
        description="What customers need to provide (optional)"
      >
        <TagInput
          items={formData.requirements}
          onItemsChange={(requirements) => updateFormData({ requirements })}
          placeholder="e.g., Power outlet within 50ft, Covered area"
          tagIcon={AlertCircle}
          tagColor="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
      </FormSection>
    </div>
  );
}
