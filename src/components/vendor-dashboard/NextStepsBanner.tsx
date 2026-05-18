import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PackagePlus,
  ImagePlus,
  ExternalLink,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextStepsBannerProps {
  packageCount: number;
  hasCoverPhoto: boolean;
  publicProfileUrl: string;
  onAddPackage: () => void;
  onAddPhotos: () => void;
}

const DISMISS_KEY = 'eventpro_next_steps_dismissed';

/**
 * Post-publish coach card shown at the top of the vendor dashboard.
 * Surfaces the items that were intentionally deferred from onboarding
 * (packages, photos, public profile) so new Event Pros know what to do next.
 */
export function NextStepsBanner({
  packageCount,
  hasCoverPhoto,
  publicProfileUrl,
  onAddPackage,
  onAddPhotos,
}: NextStepsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const steps = [
    {
      id: 'packages',
      label: 'Create your first package',
      hint: 'Customers need a package to book you',
      icon: PackagePlus,
      done: packageCount > 0,
      cta: 'Add package',
      onClick: onAddPackage,
    },
    {
      id: 'photos',
      label: 'Add photos to your profile',
      hint: 'Profiles with photos get 10× more views',
      icon: ImagePlus,
      done: hasCoverPhoto,
      cta: 'Upload photos',
      onClick: onAddPhotos,
    },
    {
      id: 'preview',
      label: 'Preview your public page',
      hint: 'See exactly what customers will see',
      icon: ExternalLink,
      done: false,
      cta: 'View page',
      onClick: () => window.open(publicProfileUrl, '_blank', 'noopener,noreferrer'),
    },
  ];

  const remaining = steps.filter((s) => !s.done).length;

  if (dismissed || remaining === 0) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mb-4"
      >
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-5">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss next steps"
            className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">You're live — now finish strong</h3>
              <p className="text-xs text-muted-foreground">
                {remaining} quick step{remaining === 1 ? '' : 's'} left to start getting booked
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
                    step.done
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-background border-border hover:border-primary/40',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                      step.done
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight',
                        step.done && 'line-through text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </p>
                    {!step.done && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.hint}</p>
                    )}
                  </div>
                  {!step.done && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={step.onClick}
                      className="gap-1 h-8 text-xs flex-shrink-0"
                    >
                      {step.cta}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
