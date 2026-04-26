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
import { StepAvailability, PackageWeeklyAvailability, PackageBlockedDate, getDefaultWeeklyAvailability } from './StepAvailability';
import { StepBookingPayment, BookingMode, PaymentOptions } from './StepBookingPayment';
import { StepPackageType, PackageKind } from './StepPackageType';
import { PackageBasicsExtras } from './PackageBasicsExtras';
import { TimeAndBuffers } from './TimeAndBuffers';
import { CustomerQuestionsPicker } from './CustomerQuestionsPicker';
import { PackagePreview } from './PackagePreview';
import { PackageStatusSelector } from './PackageStatusSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PricingType = 'hourly' | 'daily' | 'flat' | 'per_guest' | 'per_item';

export interface AdditionalFee {
  id: string;
  name: string;
  amount: number;
}

export interface PackageFormData {
  name: string;
  description: string;
  category: string;
  type: 'HOURLY' | 'DAILY';
  pricing_type: PricingType;
  price: number;
  starting_at?: number;
  min_units: number;
  min_hours: number;
  min_days?: number;
  min_guests?: number;
  max_guests?: number;
  min_quantity?: number;
  max_quantity?: number;
  min_spend?: number;
  overtime_rate?: number;
  deposit?: number;
  additional_fees: AdditionalFee[];
  travel_radius: number;
  travel_fee_per_mile: number;
  max_travel_miles?: number;
  included_miles: number;
  fee_per_mile: number;
  pickup_only: boolean;
  cancellation_policy: string;
  includes: string[];
  add_ons: { id: string; name: string; price: number }[];
  requirements: string[];
  instant_book: boolean;
  is_active: boolean;
  sort_order: number;
  images: string[];
  // Package-level availability
  weekly_availability: PackageWeeklyAvailability[];
  blocked_dates: PackageBlockedDate[];
  // Booking & Payment settings
  booking_mode: BookingMode;
  payment_options: PaymentOptions;
  payment_mode: 'full' | 'deposit';
  deposit_percentage: number;
  allow_in_person_balance: boolean;
  // Daily booking time settings
  default_start_time?: string;
  duration_minutes?: number;
  // New: Pull-Up vs Catering model
  package_kind: PackageKind | null;
  cuisine_styles: string[];
  best_for: string[];
  setup_minutes: number;
  cleanup_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  minimum_notice_hours: number | null;
  customer_questions: string[];
  status: 'draft' | 'published' | 'paused' | 'archived';
  // Pull-Up specific
  pull_up_pricing_model?: 'show_up_fee' | 'min_guarantee' | 'show_up_plus_min' | 'no_upfront' | null;
  min_guarantee_amount?: number | null;
  customer_requirements?: string | null;
  // Catering specific
  catering_pricing_model?: 'flat' | 'per_person' | 'base_plus_per_person' | null;
  included_guests?: number | null;
  additional_per_person?: number | null;
  balance_due_timing?: 'before_event' | 'day_of_event' | 'after_event' | 'direct_to_vendor' | null;
  dietary_options?: string[];
  menu_items?: { id: string; name: string; description?: string; included: boolean; price?: number }[];
}

interface PackageFormWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>, availability?: { weekly: PackageWeeklyAvailability[]; blocked: PackageBlockedDate[] }) => Promise<void>;
  initialData?: VendorPackage | null;
}

const STEPS = [
  { id: 'type', label: 'Type', shortLabel: '1' },
  { id: 'basic', label: 'Basics', shortLabel: '2' },
  { id: 'pricing', label: 'Pricing', shortLabel: '3' },
  { id: 'time', label: 'Time', shortLabel: '4' },
  { id: 'inclusions', label: 'Details', shortLabel: '5' },
  { id: 'media', label: 'Photos', shortLabel: '6' },
  { id: 'booking', label: 'Rules', shortLabel: '7' },
  { id: 'availability', label: 'Calendar', shortLabel: '8' },
  { id: 'preview', label: 'Review', shortLabel: '9' },
];

const defaultFormData: PackageFormData = {
  name: '',
  description: '',
  category: '',
  type: 'HOURLY',
  pricing_type: 'hourly',
  price: 0,
  min_units: 1,
  min_hours: 1,
  min_days: 1,
  min_guests: undefined,
  max_guests: undefined,
  min_quantity: undefined,
  max_quantity: undefined,
  min_spend: undefined,
  additional_fees: [],
  travel_radius: 25,
  travel_fee_per_mile: 0,
  included_miles: 0,
  fee_per_mile: 0,
  pickup_only: false,
  cancellation_policy: 'flexible',
  includes: [],
  add_ons: [],
  requirements: [],
  instant_book: true,
  is_active: true,
  sort_order: 0,
  images: [],
  weekly_availability: getDefaultWeeklyAvailability(),
  blocked_dates: [],
  booking_mode: 'REQUEST',
  payment_options: 'ONLINE',
  payment_mode: 'full',
  deposit_percentage: 50,
  allow_in_person_balance: false,
  default_start_time: undefined,
  duration_minutes: undefined,
  package_kind: null,
  cuisine_styles: [],
  best_for: [],
  setup_minutes: 0,
  cleanup_minutes: 0,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  minimum_notice_hours: null,
  customer_questions: [],
  status: 'draft',
  pull_up_pricing_model: null,
  min_guarantee_amount: null,
  customer_requirements: null,
  catering_pricing_model: null,
  included_guests: null,
  additional_per_person: null,
  balance_due_timing: 'before_event',
  dietary_options: [],
  menu_items: [],
};

export function PackageFormWizard({
  open,
  onClose,
  onSubmit,
  initialData
}: PackageFormWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);
  const [stripeConnected, setStripeConnected] = useState(false);
  const isMobile = useIsMobile();

  // Check Stripe status on mount
  useEffect(() => {
    const checkStripeStatus = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('stripe_account_status')
        .eq('user_id', user.id)
        .single();
      setStripeConnected(data?.stripe_account_status === 'active');
    };
    checkStripeStatus();
  }, [user]);

  useEffect(() => {
    if (initialData) {
      // Map legacy type to pricing_type
      const pricingType = (initialData.pricing_type as PricingType) || 
        (initialData.type === 'HOURLY' ? 'hourly' : 'daily');
      
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category || '',
        type: initialData.type,
        pricing_type: pricingType,
        price: initialData.price,
        starting_at: initialData.starting_at || undefined,
        min_units: initialData.min_units,
        min_hours: initialData.min_hours || 1,
        min_days: (initialData as any).min_days || 1,
        min_guests: initialData.min_guests || undefined,
        min_quantity: initialData.min_quantity || undefined,
        min_spend: initialData.min_spend || undefined,
        overtime_rate: initialData.overtime_rate || undefined,
        deposit: initialData.deposit || undefined,
        additional_fees: (initialData.additional_fees as AdditionalFee[]) || [],
        travel_radius: initialData.travel_radius || 25,
        travel_fee_per_mile: initialData.travel_fee_per_mile || 0,
        max_travel_miles: initialData.max_travel_miles || undefined,
        included_miles: initialData.included_miles || 0,
        fee_per_mile: initialData.fee_per_mile || 0,
        pickup_only: initialData.pickup_only || false,
        cancellation_policy: initialData.cancellation_policy || 'flexible',
        includes: initialData.includes || [],
        add_ons: initialData.add_ons || [],
        requirements: initialData.requirements || [],
        instant_book: initialData.instant_book,
        is_active: initialData.is_active,
        sort_order: initialData.sort_order,
        images: initialData.images || [],
        weekly_availability: getDefaultWeeklyAvailability(),
        blocked_dates: [],
        booking_mode: ((initialData as any).booking_mode as BookingMode) || 'INSTANT',
        payment_options: ((initialData as any).payment_options as PaymentOptions) || 'ONLINE',
        payment_mode: ((initialData as any).payment_mode as 'full' | 'deposit') || 'full',
        deposit_percentage: (initialData as any).deposit_percentage ?? 50,
        allow_in_person_balance: (initialData as any).allow_in_person_balance ?? false,
        default_start_time: (initialData as any).default_start_time || undefined,
        duration_minutes: initialData.duration_minutes || undefined,
        package_kind: ((initialData as any).package_kind as PackageKind) ?? null,
        cuisine_styles: ((initialData as any).cuisine_styles as string[]) || [],
        best_for: ((initialData as any).best_for as string[]) || [],
        setup_minutes: (initialData as any).setup_minutes ?? 0,
        cleanup_minutes: (initialData as any).cleanup_minutes ?? 0,
        buffer_before_minutes: (initialData as any).buffer_before_minutes ?? 0,
        buffer_after_minutes: (initialData as any).buffer_after_minutes ?? 0,
        minimum_notice_hours: (initialData as any).minimum_notice_hours ?? null,
        customer_questions: ((initialData as any).customer_questions as string[]) || [],
        status: ((initialData as any).status as PackageFormData['status']) || (initialData.is_active ? 'published' : 'draft'),
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
    // Extract availability data separately
    const availability = {
      weekly: formData.weekly_availability,
      blocked: formData.blocked_dates,
    };
    
    // Cast formData to match expected type, providing defaults for nullable fields
    const submitData = {
      ...formData,
      pricing_type: formData.pricing_type,
      starting_at: formData.starting_at ?? null,
      min_hours: formData.min_hours ?? null,
      min_days: formData.min_days ?? null,
      min_guests: formData.min_guests ?? null,
      max_guests: formData.max_guests ?? null,
      min_quantity: formData.min_quantity ?? null,
      max_quantity: formData.max_quantity ?? null,
      min_spend: formData.min_spend ?? null,
      overtime_rate: formData.overtime_rate ?? null,
      deposit: formData.deposit ?? null,
      additional_fees: formData.additional_fees ?? null,
      max_travel_miles: formData.max_travel_miles ?? null,
      included_miles: formData.included_miles ?? null,
      fee_per_mile: formData.fee_per_mile ?? null,
      pickup_only: formData.pickup_only ?? null,
      default_start_time: formData.default_start_time ?? null,
      duration_minutes: formData.duration_minutes ?? null,
    } as any;
    
    // Remove availability fields from package data (stored separately)
    delete submitData.weekly_availability;
    delete submitData.blocked_dates;
    
    await onSubmit(submitData, availability);
    setLoading(false);
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        // Package Type required
        return formData.package_kind !== null;
      case 1:
        // Basics: name + category
        return formData.name.trim().length > 0 && formData.category.length > 0;
      case 2:
        return formData.price > 0;
      case 3:
        // Time step: at least a service duration
        return (formData.duration_minutes ?? 0) > 0;
      case 6: {
        // Booking rules: if online payment selected, require Stripe
        const needsStripe = formData.payment_options === 'ONLINE' || formData.payment_options === 'BOTH';
        if (needsStripe && !stripeConnected) return false;
        return true;
      }
      case 7:
        // Availability: at least one day enabled
        return formData.weekly_availability.some(d => d.isEnabled);
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Step indicators component
  const StepIndicators = () => (
    <>
      {/* Mobile: compact step counter + label */}
      <div className="sm:hidden flex items-center justify-between mt-2 mb-1 px-1">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          Step {currentStep + 1} of {STEPS.length}
        </span>
        <span className="text-xs font-semibold text-foreground truncate ml-2">
          {STEPS[currentStep].label}
        </span>
      </div>

      {/* Desktop: full dot trail */}
      <div className="hidden sm:flex items-center justify-center gap-2 mt-3 mb-1">
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
            <span className="text-xs font-medium">{step.label}</span>
            {index < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </button>
        ))}
      </div>
    </>
  );

  // Navigation buttons component — sticky bottom bar on mobile
  const Navigation = () => (
    <div
      className="
        flex gap-2 pt-3 border-t bg-background
        sticky bottom-0 left-0 right-0
        -mx-4 sm:mx-0 px-4 sm:px-0 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:pb-3
        z-10
      "
    >
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={currentStep === 0 ? onClose : handleBack}
        className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
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
          size="lg"
          onClick={handleNext}
          disabled={!isStepValid()}
          className="flex-1 sm:flex-none sm:ml-auto h-12 sm:h-10 text-base sm:text-sm font-semibold"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="gradient"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !isStepValid()}
          className="flex-1 sm:flex-none sm:ml-auto h-12 sm:h-10 text-base sm:text-sm font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            (() => {
              const labels: Record<typeof formData.status, string> = {
                draft: initialData ? 'Save as draft' : 'Save draft',
                published: initialData ? 'Save & publish' : 'Publish package',
                paused: initialData ? 'Save & pause' : 'Save (paused)',
                archived: 'Archive package',
              };
              return labels[formData.status];
            })()
          )}
        </Button>
      )}
    </div>
  );

  // Step content component
  const StepContent = () => (
    <div className="flex-1 overflow-y-auto py-4 min-h-[300px] sm:min-h-[400px] pb-24 sm:pb-4">
      {currentStep === 0 && (
        <StepPackageType
          value={formData.package_kind}
          onChange={(kind) => updateFormData({ package_kind: kind })}
        />
      )}
      {currentStep === 1 && (
        <div className="space-y-6">
          <StepBasicInfo formData={formData} updateFormData={updateFormData} />
          <PackageBasicsExtras
            kind={formData.package_kind}
            category={formData.category}
            cuisineStyles={formData.cuisine_styles}
            bestFor={formData.best_for}
            minGuests={formData.min_guests ?? undefined}
            maxGuests={formData.max_guests ?? undefined}
            packageName={formData.name}
            onChange={(updates) => updateFormData(updates as Partial<PackageFormData>)}
          />
        </div>
      )}
      {currentStep === 2 && (
        <StepPricingTravel formData={formData} updateFormData={updateFormData} />
      )}
      {currentStep === 3 && (
        <TimeAndBuffers
          durationMinutes={formData.duration_minutes}
          setupMinutes={formData.setup_minutes}
          cleanupMinutes={formData.cleanup_minutes}
          bufferBeforeMinutes={formData.buffer_before_minutes}
          bufferAfterMinutes={formData.buffer_after_minutes}
          minimumNoticeHours={formData.minimum_notice_hours}
          onChange={(updates) => updateFormData(updates as Partial<PackageFormData>)}
        />
      )}
      {currentStep === 4 && (
        <StepInclusions formData={formData} updateFormData={updateFormData} />
      )}
      {currentStep === 5 && (
        <StepMedia formData={formData} updateFormData={updateFormData} />
      )}
      {currentStep === 6 && (
        <div className="space-y-6">
          <StepBookingPayment
            formData={formData}
            updateFormData={updateFormData}
            stripeConnected={stripeConnected}
          />
          <CustomerQuestionsPicker
            category={formData.category}
            selected={formData.customer_questions}
            onChange={(qs) => updateFormData({ customer_questions: qs })}
          />
        </div>
      )}
      {currentStep === 7 && (
        <StepAvailability
          packageId={initialData?.id}
          weeklyAvailability={formData.weekly_availability}
          blockedDates={formData.blocked_dates}
          onWeeklyChange={(weekly) => updateFormData({ weekly_availability: weekly })}
          onBlockedDatesChange={(blocked) => updateFormData({ blocked_dates: blocked })}
        />
      )}
      {currentStep === 8 && (
        <div className="space-y-6">
          <PackagePreview formData={formData} />
          <PackageStatusSelector
            value={formData.status}
            onChange={(status) => updateFormData({ status })}
            isNew={!initialData}
          />
        </div>
      )}
    </div>
  );

  // Mobile: Use Drawer, Desktop: Use Dialog
  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          // Prevent Vaul/Radix from toggling state during internal interactions (inputs, selects).
          // Only close when the drawer is explicitly dismissed.
          if (!nextOpen) onClose();
        }}
      >
        <DrawerContent className="h-[96vh] max-h-[96vh]">
          <DrawerHeader className="pb-2 px-4 shrink-0">
            <DrawerTitle className="text-lg">
              {initialData ? 'Edit Package' : 'New Package'}
            </DrawerTitle>
            <StepIndicators />
            <Progress value={progress} className="h-1.5" />
          </DrawerHeader>
          <div className="px-4 flex-1 flex flex-col overflow-hidden relative">
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
