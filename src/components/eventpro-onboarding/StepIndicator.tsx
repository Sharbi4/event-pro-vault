import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { OnboardingStep } from '@/hooks/useEventProOnboarding';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  steps: OnboardingStep[];
  stepIndex: number;
  onStepClick?: (step: OnboardingStep) => void;
}

const stepIcons: Record<OnboardingStep, string> = {
  'profile-basics': '👤',
  'categories': '🎯',
  'service-area': '📍',
  'media': '📸',
  'packages': '📦',
  'availability': '📅',
  'payout': '💳',
  'review': '✅',
};

const stepLabels: Record<OnboardingStep, string> = {
  'profile-basics': 'About You',
  'categories': 'Services',
  'service-area': 'Location',
  'media': 'Photos',
  'packages': 'Packages',
  'availability': 'Schedule',
  'payout': 'Payments',
  'review': 'Review',
};

export function StepIndicator({
  currentStep,
  steps,
  stepIndex,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: Pill-style dots with label */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center gap-3 mb-6">
          {/* Current step label with emoji */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="text-lg">{stepIcons[currentStep]}</span>
            <span className="text-sm font-semibold text-primary">
              {stepLabels[currentStep]}
            </span>
          </motion.div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step}
                onClick={() => index <= stepIndex && onStepClick?.(step)}
                disabled={index > stepIndex}
                className={cn(
                  'transition-all duration-300',
                  index > stepIndex && 'cursor-not-allowed'
                )}
              >
                <motion.div
                  className={cn(
                    'rounded-full transition-colors',
                    index === stepIndex
                      ? 'w-8 h-2 bg-primary'
                      : index < stepIndex
                      ? 'w-2 h-2 bg-primary/60'
                      : 'w-2 h-2 bg-muted'
                  )}
                  layoutId={`dot-${index}`}
                  initial={false}
                  animate={{
                    scale: index === stepIndex ? 1 : 0.9,
                  }}
                  whileTap={{ scale: 0.95 }}
                />
              </button>
            ))}
          </div>

          {/* Progress text */}
          <p className="text-xs text-muted-foreground">
            {stepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Desktop: Enhanced horizontal stepper */}
      <div className="hidden lg:block mb-8">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-border" />
          
          {/* Animated progress line */}
          <motion.div
            className="absolute top-6 left-8 h-0.5 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: stepIndex / (steps.length - 1),
            }}
            style={{
              width: `calc(100% - 64px)`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {steps.map((step, index) => {
            const isComplete = index < stepIndex;
            const isCurrent = index === stepIndex;
            const isPending = index > stepIndex;

            return (
              <button
                key={step}
                onClick={() => !isPending && onStepClick?.(step)}
                disabled={isPending}
                className={cn(
                  'relative flex flex-col items-center z-10 group',
                  isPending ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <motion.div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-lg',
                    'transition-all duration-300 shadow-sm',
                    isComplete && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                  whileHover={!isPending ? { scale: 1.05 } : {}}
                  whileTap={!isPending ? { scale: 0.95 } : {}}
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span>{stepIcons[step]}</span>
                  )}
                </motion.div>
                
                <span
                  className={cn(
                    'text-xs mt-2 font-medium transition-colors',
                    isCurrent && 'text-primary',
                    isComplete && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {stepLabels[step]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
