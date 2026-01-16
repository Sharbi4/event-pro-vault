import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { StepBasicInfo } from './StepBasicInfo';
import { StepPricingTravel } from './StepPricingTravel';
import { StepInclusions } from './StepInclusions';
import { StepImages } from './StepImages';
import { PackagePreview } from './PackagePreview';

export interface PackageFormData {
  name: string;
  description: string;
  category: string;
  type: 'HOURLY' | 'DAILY';
  price: number;
  min_units: number;
  travel_radius: number;
  travel_fee_per_mile: number;
  cancellation_policy: string;
  includes: string[];
  add_ons: { id: string; name: string; price: number }[];
  requirements: string[];
  instant_book: boolean;
  is_active: boolean;
  sort_order: number;
  images: string[];
}

interface PackageFormWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: VendorPackage | null;
}

const STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'pricing', label: 'Pricing & Travel' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'images', label: 'Images' },
  { id: 'preview', label: 'Preview' },
];

const defaultFormData: PackageFormData = {
  name: '',
  description: '',
  category: '',
  type: 'HOURLY',
  price: 0,
  min_units: 1,
  travel_radius: 25,
  travel_fee_per_mile: 0,
  cancellation_policy: 'flexible',
  includes: [],
  add_ons: [],
  requirements: [],
  instant_book: false,
  is_active: true,
  sort_order: 0,
  images: [],
};

export function PackageFormWizard({
  open,
  onClose,
  onSubmit,
  initialData
}: PackageFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category || '',
        type: initialData.type,
        price: initialData.price,
        min_units: initialData.min_units,
        travel_radius: initialData.travel_radius || 25,
        travel_fee_per_mile: initialData.travel_fee_per_mile || 0,
        cancellation_policy: initialData.cancellation_policy || 'flexible',
        includes: initialData.includes || [],
        add_ons: initialData.add_ons || [],
        requirements: initialData.requirements || [],
        instant_book: initialData.instant_book,
        is_active: initialData.is_active,
        sort_order: initialData.sort_order,
        images: initialData.images || [],
      });
    } else {
      setFormData(defaultFormData);
    }
    setCurrentStep(0);
  }, [initialData, open]);

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name.trim().length > 0 && formData.category.length > 0;
      case 1: // Pricing & Travel
        return formData.price > 0;
      case 2: // Inclusions
        return true; // Optional
      case 3: // Images
        return true; // Optional
      case 4: // Preview
        return true;
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl">
            {initialData ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
          
          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  index === currentStep
                    ? 'text-primary font-medium'
                    : index < currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-muted mx-1 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto py-6 min-h-[400px]">
          {currentStep === 0 && (
            <StepBasicInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 1 && (
            <StepPricingTravel formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepInclusions formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepImages formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <PackagePreview formData={formData} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? onClose : handleBack}
          >
            {currentStep === 0 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="gradient"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gradient"
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Package'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
