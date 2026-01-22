import { Check } from 'lucide-react';
import { OnboardingStep } from '@/hooks/useEventProOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  steps: OnboardingStep[];
  stepIndex: number;
  onStepClick?: (step: OnboardingStep) => void;
}

const stepLabels: Record<OnboardingStep, string> = {
  'profile-basics': 'Profile',
  'categories': 'Categories',
  'service-area': 'Service Area',
  'media': 'Media',
  'packages': 'Packages',
  'availability': 'Availability',
  'payout': 'Payout',
  'review': 'Review',
};

export function OnboardingProgress({
  currentStep,
  steps,
  stepIndex,
  onStepClick,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Mobile: Compact progress bar */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepLabels[currentStep]}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden lg:flex items-center justify-between relative mb-8">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        {/* Progress line filled */}
        <div
          className="absolute top-5 left-0 h-0.5 gradient-primary transition-all duration-500"
          style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isComplete = index < stepIndex;
          const isCurrent = index === stepIndex;
          const isPending = index > stepIndex;

          return (
            <button
              key={step}
              onClick={() => onStepClick?.(step)}
              disabled={isPending}
              className={cn(
                'relative flex flex-col items-center z-10 transition-all',
                isPending ? 'cursor-not-allowed' : 'cursor-pointer group'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isComplete && 'bg-primary text-primary-foreground',
                  isCurrent && 'gradient-primary text-white shadow-lg scale-110',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
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
  );
}
