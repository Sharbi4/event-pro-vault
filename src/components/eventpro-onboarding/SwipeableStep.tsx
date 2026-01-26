import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';

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

export function SwipeableStep({
  children,
  stepKey,
  direction,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableStepProps) {
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    const velocity = 0.3;

    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      onSwipeLeft?.();
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      onSwipeRight?.();
    }
  };

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
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="w-full touch-pan-y"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
