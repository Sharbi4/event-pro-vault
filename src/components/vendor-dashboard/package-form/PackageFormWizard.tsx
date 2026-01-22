import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { StepBasicInfo } from './StepBasicInfo';
import { StepPricingTravel } from './StepPricingTravel';
import { StepInclusions } from './StepInclusions';
import { StepMedia } from './StepMedia';
import { PackagePreview } from './PackagePreview';
import { useIsMobile } from '@/hooks/use-mobile';

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
  { id: 'basic', label: 'Basics', shortLabel: '1' },
  { id: 'pricing', label: 'Pricing', shortLabel: '2' },
  { id: 'inclusions', label: 'Details', shortLabel: '3' },
  { id: 'media', label: 'Media', shortLabel: '4' },
  { id: 'preview', label: 'Preview', shortLabel: '5' },
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
  const isMobile = useIsMobile();

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
      case 0:
        return formData.name.trim().length > 0 && formData.category.length > 0;
      case 1:
        return formData.price > 0;
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Step indicators component
  const StepIndicators = () => (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-3 mb-1">
      {STEPS.map((step, index) => (
        <button
          key={step.id}
          type="button"
          onClick={() => index < currentStep && setCurrentStep(index)}
          disabled={index > currentStep}
          className={`flex items-center gap-1.5 transition-all ${
            index === currentStep
              ? 'text-primary'
              : index < currentStep
              ? 'text-muted-foreground cursor-pointer hover:text-foreground'
              : 'text-muted-foreground/40 cursor-not-allowed'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              index < currentStep
                ? 'bg-primary text-primary-foreground'
                : index === currentStep
                ? 'bg-primary/20 text-primary ring-2 ring-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
          </div>
          <span className="hidden sm:inline text-xs font-medium">{step.label}</span>
          {index < STEPS.length - 1 && (
            <div className={`w-4 sm:w-8 h-0.5 mx-1 ${
              index < currentStep ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </button>
      ))}
    </div>
  );

  // Navigation buttons component
  const Navigation = () => (
    <div className="flex gap-2 pt-3 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={currentStep === 0 ? onClose : handleBack}
        className="flex-1 sm:flex-none"
      >
        {currentStep === 0 ? 'Cancel' : (
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
          className="flex-1 sm:flex-none sm:ml-auto"
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
          className="flex-1 sm:flex-none sm:ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData ? 'Save Changes' : 'Create Package'}
        </Button>
      )}
    </div>
  );

  // Step content component
  const StepContent = () => (
    <div className="flex-1 overflow-y-auto py-4 min-h-[300px] sm:min-h-[400px]">
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
        <StepMedia formData={formData} updateFormData={updateFormData} />
      )}
      {currentStep === 4 && (
        <PackagePreview formData={formData} />
      )}
    </div>
  );

  // Mobile: Use Drawer, Desktop: Use Dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg">
              {initialData ? 'Edit Package' : 'New Package'}
            </DrawerTitle>
            <StepIndicators />
            <Progress value={progress} className="h-1" />
          </DrawerHeader>
          <div className="px-4 pb-4 flex flex-col overflow-hidden">
            <StepContent />
            <Navigation />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">
            {initialData ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
          <StepIndicators />
          <Progress value={progress} className="h-1.5" />
        </DialogHeader>
        <StepContent />
        <Navigation />
      </DialogContent>
    </Dialog>
  );
}
