import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketSpaceOnboarding, MarketOnboardingStep } from '@/hooks/useMarketSpaceOnboarding';
import { StepBasics } from '@/components/marketspace-onboarding/StepBasics';
import { StepLocation } from '@/components/marketspace-onboarding/StepLocation';
import { StepMedia } from '@/components/marketspace-onboarding/StepMedia';
import { StepSlotTypes } from '@/components/marketspace-onboarding/StepSlotTypes';
import { StepInventory } from '@/components/marketspace-onboarding/StepInventory';
import { StepReview } from '@/components/marketspace-onboarding/StepReview';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Save,
  Store
} from 'lucide-react';

const STEP_CONFIG: { id: MarketOnboardingStep; label: string; shortLabel: string }[] = [
  { id: 'basics', label: 'Market Basics', shortLabel: 'Basics' },
  { id: 'location', label: 'Location & Time', shortLabel: 'Location' },
  { id: 'media', label: 'Photos & Videos', shortLabel: 'Media' },
  { id: 'slot-types', label: 'Slot Types', shortLabel: 'Slots' },
  { id: 'inventory', label: 'Inventory', shortLabel: 'Inventory' },
  { id: 'review', label: 'Review & Publish', shortLabel: 'Review' },
];

export default function MarketSpaceOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    currentStep,
    state,
    slotTypes,
    inventory,
    marketId,
    loading,
    saving,
    lastSaved,
    updateState,
    setState,
    setSlotTypes,
    setInventory,
    saveProgress,
    saveSlotType,
    deleteSlotType,
    saveInventoryItem,
    deleteInventoryItem,
    bulkCreateInventory,
    publishMarket,
    canPublish,
    nextStep,
    prevStep,
    goToStep,
  } = useMarketSpaceOnboarding();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?returnTo=/marketspace-onboarding');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your market...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const currentStepIndex = STEP_CONFIG.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEP_CONFIG.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return <StepBasics state={state} updateState={updateState} />;
      case 'location':
        return <StepLocation state={state} updateState={updateState} />;
      case 'media':
        return (
          <StepMedia 
            state={state} 
            updateState={updateState}
            onSave={saveProgress}
          />
        );
      case 'slot-types':
        return (
          <StepSlotTypes
            slotTypes={slotTypes}
            setSlotTypes={setSlotTypes}
            saveSlotType={saveSlotType}
            deleteSlotType={deleteSlotType}
            marketId={marketId}
          />
        );
      case 'inventory':
        return (
          <StepInventory
            slotTypes={slotTypes}
            inventory={inventory}
            setInventory={setInventory}
            saveInventoryItem={saveInventoryItem}
            deleteInventoryItem={deleteInventoryItem}
            bulkCreateInventory={bulkCreateInventory}
            weeklySchedule={state.weeklySchedule}
          />
        );
      case 'review':
        return (
          <StepReview
            state={state}
            slotTypes={slotTypes}
            inventory={inventory}
            canPublish={canPublish}
            onPublish={publishMarket}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_CONFIG.length - 1;

  return (
    <Layout>
      <div className="min-h-screen pt-20 lg:pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                  Create Your Market
                </h1>
                <p className="text-sm text-muted-foreground">
                  {STEP_CONFIG[currentStepIndex].label}
                </p>
              </div>
            </div>
            
            {/* Save indicator */}
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Draft saved
                  </>
                )}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {STEP_CONFIG.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    idx <= currentStepIndex
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    idx < currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : idx === currentStepIndex
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx < currentStepIndex ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card variant="glass" className="p-6 lg:p-8 mb-6">
            {renderStep()}
          </Card>

          {/* Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
            <div className="container mx-auto max-w-4xl flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {!isLastStep ? (
                <Button
                  variant="gradient"
                  onClick={nextStep}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={publishMarket}
                  disabled={!canPublish().canPublish || saving}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Market
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
