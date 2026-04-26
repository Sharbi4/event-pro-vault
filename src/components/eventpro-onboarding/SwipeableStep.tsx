import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SwipeableStepProps {
  children: ReactNode;
  stepKey: string;
  direction: number;
  // Kept for API compatibility; no longer wired to swipe gestures.
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
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
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/**
 * Step transition wrapper.
 *
 * Swipe-to-change-step was removed: users reported accidental step changes
 * when scrolling/tapping on mobile. Navigation now happens only via the
 * explicit Back / Next buttons. The animated transition between steps is
 * preserved.
 */
export function SwipeableStep({
  children,
  stepKey,
  direction,
}: SwipeableStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="w-full"
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
