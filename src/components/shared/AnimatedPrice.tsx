import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  prefix?: string;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Smoothly ticks a number from its previous value to the new one.
 * Uses JetBrains Mono via the .font-mono class for tabular precision.
 */
export function AnimatedPrice({
  value,
  className,
  prefix = '$',
  duration = 0.55,
}: AnimatedPriceProps) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (latest) =>
    `${prefix}${Math.round(latest).toLocaleString()}`
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return (
    <motion.span
      className={cn('font-mono tabular-nums', className)}
      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
    >
      {rounded}
    </motion.span>
  );
}
