import { PackageFormData } from './PackageFormWizard';
import { MediaUploadGrid } from './MediaUploadGrid';
import { ImageIcon } from 'lucide-react';
import { FormSection } from './FormSection';

interface StepMediaProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepMedia({ formData, updateFormData }: StepMediaProps) {
  return (
    <div className="space-y-4">
      <FormSection
        icon={ImageIcon}
        title="Photos & Videos"
        description="Showcase your work with high-quality media. The first item will be your cover."
      >
        <MediaUploadGrid
          images={formData.images}
          onImagesChange={(images) => updateFormData({ images })}
          maxItems={10}
        />
      </FormSection>
    </div>
  );
}
