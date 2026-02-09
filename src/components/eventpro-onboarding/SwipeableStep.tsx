import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ReactNode, useCallback, useRef } from 'react';

interface SwipeableStepProps {
  children: ReactNode;
  stepKey: string;
  direction: number;
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

// Form elements that should block swipe gestures
const INTERACTIVE_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'];

export function SwipeableStep({
  children,
  stepKey,
  direction,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableStepProps) {
  const isDraggingFromInput = useRef(false);

  const handleDragStart = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent) => {
      // Check if drag started from an interactive element
      const target = event.target as HTMLElement;
      const isInteractive = 
        INTERACTIVE_ELEMENTS.includes(target.tagName) ||
        target.closest('input, textarea, select, button, a, [role="button"], [contenteditable]');
      
      isDraggingFromInput.current = !!isInteractive;
    },
    []
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Don't process swipe if it started from an interactive element
      if (isDraggingFromInput.current) {
        isDraggingFromInput.current = false;
        return;
      }

      // Increased thresholds to prevent accidental swipes
      const offsetThreshold = 150; // Increased from 100
      const velocityThreshold = 0.5; // Increased from 0.3

      if (info.offset.x < -offsetThreshold && info.velocity.x < -velocityThreshold) {
        onSwipeLeft?.();
      } else if (info.offset.x > offsetThreshold && info.velocity.x > velocityThreshold) {
        onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="w-full touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
