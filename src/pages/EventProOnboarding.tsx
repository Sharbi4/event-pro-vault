import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useEventProOnboarding, OnboardingStep } from '@/hooks/useEventProOnboarding';
import { StepIndicator } from '@/components/eventpro-onboarding/StepIndicator';
import { OnboardingNavigation } from '@/components/eventpro-onboarding/OnboardingNavigation';
import { StepProfileBasics } from '@/components/eventpro-onboarding/StepProfileBasics';
import { StepCategories } from '@/components/eventpro-onboarding/StepCategories';
import { StepServiceArea } from '@/components/eventpro-onboarding/StepServiceArea';
import { StepMedia } from '@/components/eventpro-onboarding/StepMedia';
import { StepPackages } from '@/components/eventpro-onboarding/StepPackages';
import { StepAvailability } from '@/components/eventpro-onboarding/StepAvailability';
import { StepPayout } from '@/components/eventpro-onboarding/StepPayout';
import { StepReview } from '@/components/eventpro-onboarding/StepReview';
import { VendorPackage } from '@/hooks/useVendorDashboard';

// Animation variants for step transitions
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function EventProOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [direction, setDirection] = useState(1);

  const {
    currentStep,
    state,
    loading,
    saving,
    lastSaved,
    steps,
    stepIndex,
    updateState,
    saveProgress,
    saveAvailability,
    savePaymentMethod,
    publishProfile,
    nextStep,
    prevStep,
    goToStep,
    canPublish,
    loadExistingData,
    stripeStatus,
    connectLoading,
    checkStripeStatus,
    connectStripe,
  } = useEventProOnboarding();

  // Load packages
  useEffect(() => {
    if (user) {
      loadPackages();
    }
  }, [user]);

  const loadPackages = async () => {
    if (!user) return;
    setLoadingPackages(true);
    try {
      const { data, error } = await supabase
        .from('vendor_packages')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPackages((data || []) as unknown as VendorPackage[]);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleCreatePackage = async (
    data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const { add_ons, additional_fees, ...rest } = data;
      const insertData = {
        ...rest,
        user_id: user.id,
        add_ons: add_ons ? JSON.parse(JSON.stringify(add_ons)) : [],
        additional_fees: additional_fees ? JSON.parse(JSON.stringify(additional_fees)) : [],
        sort_order: packages.length,
      };

      const { error } = await supabase.from('vendor_packages').insert(insertData as any);

      if (error) throw error;
      toast.success('Package created! Redirecting to your dashboard...');
      navigate('/vendor-dashboard?tab=packages');
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Failed to create package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('vendor_packages')
        .delete()
        .eq('id', packageId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Package deleted');
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handlePublish = async () => {
    const success = await publishProfile();
    if (success) {
      navigate('/vendor-dashboard');
    }
    return success;
  };

  const handleNext = useCallback(async () => {
    if (currentStep === 'availability') {
      await saveAvailability();
    }
    if (currentStep === 'payout') {
      await savePaymentMethod();
    }
    setDirection(1);
    await nextStep();
  }, [currentStep, saveAvailability, savePaymentMethod, nextStep]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  const handleGoToStep = useCallback((step: OnboardingStep) => {
    const targetIndex = steps.indexOf(step);
    setDirection(targetIndex > stepIndex ? 1 : -1);
    goToStep(step);
  }, [steps, stepIndex, goToStep]);

  // Handle swipe gestures
  const handleSwipe = useCallback((swipeDirection: 'left' | 'right') => {
    if (swipeDirection === 'left' && isStepValid() && stepIndex < steps.length - 1) {
      handleNext();
    } else if (swipeDirection === 'right' && stepIndex > 0) {
      handlePrev();
    }
  }, [stepIndex, steps.length, handleNext, handlePrev]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 'profile-basics':
        return (
          state.profileBasics.displayName.trim().length > 0 &&
          state.profileBasics.shortBio.trim().length > 0
        );
      case 'categories':
        return state.categories.length > 0;
      case 'service-area':
        return state.serviceArea.formattedAddress.trim().length > 0;
      default:
        return true;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <Button onClick={() => navigate('/auth/pro?returnTo=/eventpro-onboarding')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'profile-basics':
        return (
          <StepProfileBasics
            data={state.profileBasics}
            onChange={(data) => updateState('profileBasics', data)}
          />
        );
      case 'categories':
        return (
          <StepCategories
            selected={state.categories}
            onChange={(categories) => updateState('categories', categories)}
          />
        );
      case 'service-area':
        return (
          <StepServiceArea
            data={state.serviceArea}
            onChange={(data) => updateState('serviceArea', data)}
          />
        );
      case 'media':
        return (
          <StepMedia
            items={state.mediaItems}
            onChange={(items) => updateState('mediaItems', items)}
          />
        );
      case 'packages':
        return (
          <StepPackages
            packages={packages}
            onCreatePackage={handleCreatePackage}
            onUpdatePackage={async () => {}}
            onDeletePackage={handleDeletePackage}
            selectedCategories={state.categories}
          />
        );
      case 'availability':
        return (
          <StepAvailability
            weeklyAvailability={state.weeklyAvailability}
            bufferSettings={state.bufferSettings}
            timezone={state.timezone}
            onWeeklyChange={(availability) => updateState('weeklyAvailability', availability)}
            onBufferChange={(settings) => updateState('bufferSettings', settings)}
            onTimezoneChange={(tz) => updateState('timezone', tz)}
          />
        );
      case 'payout':
        return (
          <StepPayout
            selectedMethod={state.paymentMethod}
            onMethodChange={(method) => updateState('paymentMethod', method)}
            stripeStatus={stripeStatus}
            onConnectStripe={connectStripe}
            connectLoading={connectLoading}
          />
        );
      case 'review':
        return (
          <StepReview
            state={state}
            packages={packages}
            onPublish={handlePublish}
            canPublish={canPublish()}
            saving={saving}
            stripeStatus={stripeStatus}
            onConnectStripe={connectStripe}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Create Your <span className="gradient-text">EventPro</span> Profile
            </h1>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            steps={steps}
            stepIndex={stepIndex}
            onStepClick={handleGoToStep}
          />

          {/* Auto-save indicator */}
          <AnimatePresence>
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span>
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swipeable Step Content */}
          <div 
            className="mb-6 overflow-hidden touch-pan-y"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.currentTarget as any)._touchStartX = touch.clientX;
            }}
            onTouchEnd={(e) => {
              const touchStartX = (e.currentTarget as any)._touchStartX;
              const touch = e.changedTouches[0];
              const diff = touchStartX - touch.clientX;
              
              if (Math.abs(diff) > 80) {
                handleSwipe(diff > 0 ? 'left' : 'right');
              }
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {currentStep !== 'review' && (
            <OnboardingNavigation
              currentStep={currentStep}
              stepIndex={stepIndex}
              totalSteps={steps.length}
              isValid={isStepValid()}
              saving={saving}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
