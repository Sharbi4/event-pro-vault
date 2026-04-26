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
import { StepPullUpPricing } from './StepPullUpPricing';
import { StepPullUpRequirements } from './StepPullUpRequirements';
import { StepCateringGuestsService } from './StepCateringGuestsService';
import { StepCateringPricing } from './StepCateringPricing';
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
  menu_items?: { id: string; name: string; description?: string; included: boolean; price?: number; category?: 'food' | 'drink' }[];
}

interface PackageFormWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>, availability?: { weekly: PackageWeeklyAvailability[]; blocked: PackageBlockedDate[] }) => Promise<void>;
  initialData?: VendorPackage | null;
}

type StepId =
  | 'type'
  | 'basics'
  | 'pullup_pricing'
  | 'pullup_timing'
  | 'pullup_requirements'
  | 'pullup_media'
  | 'pullup_rules'
  | 'pullup_calendar'
  | 'pullup_review'
  | 'catering_basics'
  | 'catering_guests'
  | 'catering_pricing'
  | 'catering_inclusions'
  | 'catering_timing'
  | 'catering_questions'
  | 'catering_rules'
  | 'catering_media'
  | 'catering_calendar'
  | 'catering_review';

interface StepDef {
  id: StepId;
  label: string;
}

const TYPE_STEP: StepDef = { id: 'type', label: 'Type' };

const PULL_UP_STEPS: StepDef[] = [
  TYPE_STEP,
  { id: 'basics', label: 'Basics' },
  { id: 'pullup_pricing', label: 'Pricing' },
  { id: 'pullup_timing', label: 'Timing' },
  { id: 'pullup_requirements', label: 'Location' },
  { id: 'pullup_media', label: 'Photos' },
  { id: 'pullup_rules', label: 'Rules' },
  { id: 'pullup_calendar', label: 'Calendar' },
  { id: 'pullup_review', label: 'Review' },
];

const CATERING_STEPS: StepDef[] = [
  TYPE_STEP,
  { id: 'catering_basics', label: 'Basics' },
  { id: 'catering_guests', label: 'Guests' },
  { id: 'catering_pricing', label: 'Pricing' },
  { id: 'catering_inclusions', label: 'Menu' },
  { id: 'catering_timing', label: 'Time' },
  { id: 'catering_questions', label: 'Questions' },
  { id: 'catering_rules', label: 'Rules' },
  { id: 'catering_media', label: 'Photos' },
  { id: 'catering_calendar', label: 'Calendar' },
  { id: 'catering_review', label: 'Review' },
];

function getSteps(kind: PackageKind | null): StepDef[] {
  if (kind === 'pull_up') return PULL_UP_STEPS;
  if (kind === 'catering') return CATERING_STEPS;
  return [TYPE_STEP];
}

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
  const [showErrors, setShowErrors] = useState(false);
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
        pull_up_pricing_model: ((initialData as any).pull_up_pricing_model as PackageFormData['pull_up_pricing_model']) ?? null,
        min_guarantee_amount: (initialData as any).min_guarantee_amount ?? null,
        customer_requirements: (initialData as any).customer_requirements ?? null,
        catering_pricing_model: ((initialData as any).catering_pricing_model as PackageFormData['catering_pricing_model']) ?? null,
        included_guests: (initialData as any).included_guests ?? null,
        additional_per_person: (initialData as any).additional_per_person ?? null,
        balance_due_timing: ((initialData as any).balance_due_timing as PackageFormData['balance_due_timing']) ?? 'before_event',
        dietary_options: ((initialData as any).dietary_options as string[]) || [],
        menu_items: ((initialData as any).menu_items as any[]) || [],
      });
    } else {
      setFormData(defaultFormData);
    }
    setCurrentStep(0);
    setShowErrors(false);
  }, [initialData, open]);

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Dynamic steps based on chosen package kind
  const steps = getSteps(formData.package_kind);
  const safeStepIndex = Math.min(currentStep, steps.length - 1);
  const activeStep = steps[safeStepIndex];

  const handleNext = () => {
    const result = validateStep(activeStep?.id);
    if (!result.valid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (safeStepIndex < steps.length - 1) {
      setCurrentStep(safeStepIndex + 1);
    }
  };

  const handleBack = () => {
    setShowErrors(false);
    if (safeStepIndex > 0) {
      setCurrentStep(safeStepIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const availability = {
      weekly: formData.weekly_availability,
      blocked: formData.blocked_dates,
    };

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

    delete submitData.weekly_availability;
    delete submitData.blocked_dates;

    await onSubmit(submitData, availability);
    setLoading(false);
    onClose();
  };

  // Per-step validation by step id (more robust than index)
  const isStepValid = () => {
    switch (activeStep?.id) {
      case 'type':
        return formData.package_kind !== null;
      case 'basics':
      case 'catering_basics':
        return formData.name.trim().length > 0 && formData.category.length > 0;
      case 'pullup_pricing':
        if (!formData.pull_up_pricing_model) return false;
        if (formData.pull_up_pricing_model === 'no_upfront') return true;
        if (formData.pull_up_pricing_model === 'min_guarantee') {
          return (formData.min_guarantee_amount ?? 0) > 0;
        }
        if (formData.pull_up_pricing_model === 'show_up_plus_min') {
          return formData.price > 0 && (formData.min_guarantee_amount ?? 0) > 0;
        }
        return formData.price > 0;
      case 'catering_guests':
        return (formData.min_guests ?? 0) > 0;
      case 'catering_pricing':
        return !!formData.catering_pricing_model && formData.price > 0;
      case 'pullup_timing':
      case 'catering_timing':
        return (formData.duration_minutes ?? 0) > 0;
      case 'pullup_rules':
      case 'catering_rules': {
        const needsStripe =
          formData.payment_options === 'ONLINE' || formData.payment_options === 'BOTH';
        if (needsStripe && !stripeConnected) return false;
        return true;
      }
      case 'pullup_calendar':
      case 'catering_calendar':
        return formData.weekly_availability.some((d) => d.isEnabled);
      default:
        return true;
    }
  };

  const progress = ((safeStepIndex + 1) / steps.length) * 100;

  // ---- JSX variables (NOT nested components — keeps input focus stable) ----

  const stepIndicators = (
    <>
      <div className="sm:hidden flex items-center justify-between mt-2 mb-1 px-1">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          Step {safeStepIndex + 1} of {steps.length}
        </span>
        <span className="text-xs font-semibold text-foreground truncate ml-2">
          {steps[safeStepIndex].label}
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-center gap-2 mt-3 mb-1 flex-wrap">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => index < safeStepIndex && setCurrentStep(index)}
            disabled={index > safeStepIndex}
            className={`flex items-center gap-1.5 transition-all ${
              index === safeStepIndex
                ? 'text-primary'
                : index < safeStepIndex
                ? 'text-muted-foreground cursor-pointer hover:text-foreground'
                : 'text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                index < safeStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : index === safeStepIndex
                  ? 'bg-primary/20 text-primary ring-2 ring-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < safeStepIndex ? <Check className="w-3 h-3" /> : index + 1}
            </div>
            <span className="text-xs font-medium">{step.label}</span>
            {index < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 mx-1 ${
                  index < safeStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </>
  );

  const navigation = (
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
        onClick={safeStepIndex === 0 ? onClose : handleBack}
        className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
      >
        {safeStepIndex === 0 ? 'Cancel' : (
          <>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </>
        )}
      </Button>

      {safeStepIndex < steps.length - 1 ? (
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

  // Render the active step's body based on its id
  const renderStepBody = () => {
    switch (activeStep?.id) {
      case 'type':
        return (
          <StepPackageType
            value={formData.package_kind}
            onChange={(kind) => {
              updateFormData({ package_kind: kind });
              // Auto-advance to step 1 when a kind is picked
              setCurrentStep(1);
            }}
          />
        );

      // ---- BASICS (shared component, slightly different titles) ----
      case 'basics':
      case 'catering_basics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {activeStep.id === 'basics'
                  ? 'Tell customers where you can pull up'
                  : 'Tell customers what this package is for'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Name, short description, category, and food style.
              </p>
            </div>
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
        );

      // ---- PULL-UP FLOW ----
      case 'pullup_pricing':
        return <StepPullUpPricing formData={formData} updateFormData={updateFormData} />;
      case 'pullup_timing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                How long do you need on-site?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                We block your calendar for setup, service, and cleanup.
              </p>
            </div>
            <TimeAndBuffers
              durationMinutes={formData.duration_minutes}
              setupMinutes={formData.setup_minutes}
              cleanupMinutes={formData.cleanup_minutes}
              bufferBeforeMinutes={formData.buffer_before_minutes}
              bufferAfterMinutes={formData.buffer_after_minutes}
              minimumNoticeHours={formData.minimum_notice_hours}
              onChange={(updates) => updateFormData(updates as Partial<PackageFormData>)}
            />
          </div>
        );
      case 'pullup_requirements':
        return <StepPullUpRequirements formData={formData} updateFormData={updateFormData} />;
      case 'pullup_media':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Show what you serve</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add photos and a quick menu preview customers can browse.
              </p>
            </div>
            <StepMedia formData={formData} updateFormData={updateFormData} />
          </div>
        );
      case 'pullup_rules':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Set booking rules</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Approval, cancellation, and travel rules. We recommend reviewing requests first.
              </p>
            </div>
            <StepBookingPayment
              formData={formData}
              updateFormData={updateFormData}
              stripeConnected={stripeConnected}
            />
          </div>
        );
      case 'pullup_calendar':
        return (
          <StepAvailability
            packageId={initialData?.id}
            weeklyAvailability={formData.weekly_availability}
            blockedDates={formData.blocked_dates}
            onWeeklyChange={(weekly) => updateFormData({ weekly_availability: weekly })}
            onBlockedDatesChange={(blocked) => updateFormData({ blocked_dates: blocked })}
          />
        );
      case 'pullup_review':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Review your pull-up booking</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here's how customers will see this package.
              </p>
            </div>
            <PackagePreview formData={formData} />
            <PackageStatusSelector
              value={formData.status}
              onChange={(status) => updateFormData({ status })}
              isNew={!initialData}
            />
          </div>
        );

      // ---- CATERING FLOW ----
      case 'catering_guests':
        return <StepCateringGuestsService formData={formData} updateFormData={updateFormData} />;
      case 'catering_pricing':
        return <StepCateringPricing formData={formData} updateFormData={updateFormData} />;
      case 'catering_inclusions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Build the package menu</h2>
              <p className="text-sm text-muted-foreground mt-1">
                List what's included, then add optional upgrades as add-ons.
              </p>
            </div>
            <StepInclusions formData={formData} updateFormData={updateFormData} />
          </div>
        );
      case 'catering_timing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                How much time does this event package need?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Catering events usually need longer setup and cleanup windows.
              </p>
            </div>
            <TimeAndBuffers
              durationMinutes={formData.duration_minutes}
              setupMinutes={formData.setup_minutes}
              cleanupMinutes={formData.cleanup_minutes}
              bufferBeforeMinutes={formData.buffer_before_minutes}
              bufferAfterMinutes={formData.buffer_after_minutes}
              minimumNoticeHours={formData.minimum_notice_hours}
              onChange={(updates) => updateFormData(updates as Partial<PackageFormData>)}
            />
          </div>
        );
      case 'catering_questions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                What should customers tell you before booking?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pick the questions that help you quote and prep for their event.
              </p>
            </div>
            <CustomerQuestionsPicker
              category={formData.category}
              selected={formData.customer_questions}
              onChange={(qs) => updateFormData({ customer_questions: qs })}
            />
          </div>
        );
      case 'catering_rules':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Set booking and cancellation rules
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                For larger events we recommend Moderate or Strict cancellation.
              </p>
            </div>
            <StepBookingPayment
              formData={formData}
              updateFormData={updateFormData}
              stripeConnected={stripeConnected}
            />
          </div>
        );
      case 'catering_media':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Make your package look bookable
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add at least one photo. 3+ recommended.
              </p>
            </div>
            <StepMedia formData={formData} updateFormData={updateFormData} />
          </div>
        );
      case 'catering_calendar':
        return (
          <StepAvailability
            packageId={initialData?.id}
            weeklyAvailability={formData.weekly_availability}
            blockedDates={formData.blocked_dates}
            onWeeklyChange={(weekly) => updateFormData({ weekly_availability: weekly })}
            onBlockedDatesChange={(blocked) => updateFormData({ blocked_dates: blocked })}
          />
        );
      case 'catering_review':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Review your event package</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here's how customers will see this catering package.
              </p>
            </div>
            <PackagePreview formData={formData} />
            <PackageStatusSelector
              value={formData.status}
              onChange={(status) => updateFormData({ status })}
              isNew={!initialData}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const stepContent = (
    <div className="flex-1 overflow-y-auto py-4 min-h-[300px] sm:min-h-[400px] pb-24 sm:pb-4">
      {renderStepBody()}
    </div>
  );

  // Mobile: Use Drawer, Desktop: Use Dialog
  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
      >
        <DrawerContent className="h-[96vh] max-h-[96vh]">
          <DrawerHeader className="pb-2 px-4 shrink-0">
            <DrawerTitle className="text-lg">
              {initialData ? 'Edit Package' : 'New Package'}
            </DrawerTitle>
            {stepIndicators}
            <Progress value={progress} className="h-1.5" />
          </DrawerHeader>
          <div className="px-4 flex-1 flex flex-col overflow-hidden relative">
            {stepContent}
            {navigation}
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
          {stepIndicators}
          <Progress value={progress} className="h-1.5" />
        </DialogHeader>
        {stepContent}
        {navigation}
      </DialogContent>
    </Dialog>
  );
}
