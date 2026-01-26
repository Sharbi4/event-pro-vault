import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { OnboardingStep } from '@/hooks/useEventProOnboarding';

interface OnboardingNavigationProps {
  currentStep: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  isValid: boolean;
  saving: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const stepHints: Record<OnboardingStep, string> = {
  'profile-basics': 'Add your name and bio to continue',
  'categories': 'Select at least one service category',
  'service-area': 'Set your location to continue',
  'media': 'Photos help clients find you (optional for now)',
  'packages': 'Create packages later in your dashboard',
  'availability': 'Set your working hours',
  'payout': 'Choose how you want to get paid',
  'review': '',
};

export function OnboardingNavigation({
  currentStep,
  stepIndex,
  totalSteps,
  isValid,
  saving,
  onPrev,
  onNext,
}: OnboardingNavigationProps) {
  const isFirstStep = stepIndex === 0;
  const isLastContentStep = currentStep === 'payout';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t py-4 -mx-4 px-4 z-20"
    >
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Hint text */}
        {!isValid && stepHints[currentStep] && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center"
          >
            {stepHints[currentStep]}
          </motion.p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirstStep || saving}
            className="flex-1 sm:flex-none h-12"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            variant="gradient"
            onClick={onNext}
            disabled={!isValid || saving}
            className="flex-1 h-12 sm:ml-auto"
          >
            {saving ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center"
                whileHover={{ x: 2 }}
              >
                {isLastContentStep ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Review & Publish
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </motion.div>
            )}
          </Button>
        </div>

        {/* Swipe hint on mobile */}
        <p className="text-[10px] text-muted-foreground/50 text-center lg:hidden">
          Swipe left or right to navigate
        </p>
      </div>
    </motion.div>
  );
}
