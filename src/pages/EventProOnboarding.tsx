import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useEventProOnboarding, OnboardingStep } from '@/hooks/useEventProOnboarding';
import { OnboardingProgress } from '@/components/eventpro-onboarding/OnboardingProgress';
import { StepProfileBasics } from '@/components/eventpro-onboarding/StepProfileBasics';
import { StepCategories } from '@/components/eventpro-onboarding/StepCategories';
import { StepServiceArea } from '@/components/eventpro-onboarding/StepServiceArea';
import { StepMedia } from '@/components/eventpro-onboarding/StepMedia';
import { StepPackages } from '@/components/eventpro-onboarding/StepPackages';
import { StepAvailability } from '@/components/eventpro-onboarding/StepAvailability';
import { StepPayout } from '@/components/eventpro-onboarding/StepPayout';
import { StepReview } from '@/components/eventpro-onboarding/StepReview';
import { VendorPackage } from '@/hooks/useVendorDashboard';

export default function EventProOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

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
      // Serialize JSON fields for Supabase
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

  const handleUpdatePackage = async (
    data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    packageId: string
  ) => {
    if (!user) return;

    try {
      // Serialize JSON fields for Supabase
      const { add_ons, additional_fees, ...rest } = data;
      const updateData: Record<string, any> = { ...rest };
      if (add_ons !== undefined) {
        updateData.add_ons = JSON.parse(JSON.stringify(add_ons));
      }
      if (additional_fees !== undefined) {
        updateData.additional_fees = JSON.parse(JSON.stringify(additional_fees));
      }

      const { error } = await supabase
        .from('vendor_packages')
        .update(updateData)
        .eq('id', packageId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Package updated!');
      await loadPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
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

  const handleNext = async () => {
    // Save availability on that step
    if (currentStep === 'availability') {
      await saveAvailability();
    }
    // Save payment method on payout step
    if (currentStep === 'payout') {
      await savePaymentMethod();
    }
    await nextStep();
  };

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
          <Button onClick={() => navigate('/auth?returnTo=/eventpro-onboarding')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const stepLabels: Record<OnboardingStep, string> = {
    'profile-basics': 'Profile',
    categories: 'Categories',
    'service-area': 'Service Area',
    media: 'Media',
    packages: 'Packages',
    availability: 'Availability',
    payout: 'Payout',
    review: 'Review',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Create Your <span className="gradient-text">EventPro</span> Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Step {stepIndex + 1} of {steps.length}: {stepLabels[currentStep]}
            </p>
          </div>

          {/* Progress */}
          <OnboardingProgress
            currentStep={currentStep}
            steps={steps}
            stepIndex={stepIndex}
            onStepClick={goToStep}
          />

          {/* Auto-save indicator */}
          {lastSaved && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
              <CheckCircle2 className="w-3 h-3" />
              <span>
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-6">
            {currentStep === 'profile-basics' && (
              <StepProfileBasics
                data={state.profileBasics}
                onChange={(data) => updateState('profileBasics', data)}
              />
            )}

            {currentStep === 'categories' && (
              <StepCategories
                selected={state.categories}
                onChange={(categories) => updateState('categories', categories)}
              />
            )}

            {currentStep === 'service-area' && (
              <StepServiceArea
                data={state.serviceArea}
                onChange={(data) => updateState('serviceArea', data)}
              />
            )}

            {currentStep === 'media' && (
              <StepMedia
                items={state.mediaItems}
                onChange={(items) => updateState('mediaItems', items)}
              />
            )}

            {currentStep === 'packages' && (
              <StepPackages
                packages={packages}
                onCreatePackage={handleCreatePackage}
                onUpdatePackage={async (data) => {
                  // This is handled via edit flow
                }}
                onDeletePackage={handleDeletePackage}
                selectedCategories={state.categories}
              />
            )}

            {currentStep === 'availability' && (
              <StepAvailability
                weeklyAvailability={state.weeklyAvailability}
                bufferSettings={state.bufferSettings}
                timezone={state.timezone}
                onWeeklyChange={(availability) =>
                  updateState('weeklyAvailability', availability)
                }
                onBufferChange={(settings) => updateState('bufferSettings', settings)}
                onTimezoneChange={(tz) => updateState('timezone', tz)}
              />
            )}

            {currentStep === 'payout' && (
              <StepPayout
                selectedMethod={state.paymentMethod}
                onMethodChange={(method) => updateState('paymentMethod', method)}
                stripeStatus={stripeStatus}
                onConnectStripe={connectStripe}
                connectLoading={connectLoading}
              />
            )}

            {currentStep === 'review' && (
              <StepReview
                state={state}
                packages={packages}
                onPublish={handlePublish}
                canPublish={canPublish()}
                saving={saving}
              />
            )}
          </div>

          {/* Navigation */}
          {currentStep !== 'review' && (
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t py-4 -mx-4 px-4">
              <div className="flex gap-3 max-w-2xl mx-auto">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={stepIndex === 0 || saving}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button
                  variant="gradient"
                  onClick={handleNext}
                  disabled={!isStepValid() || saving}
                  className="flex-1 sm:flex-none sm:ml-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {currentStep === 'availability' ? 'Review' : 'Continue'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
