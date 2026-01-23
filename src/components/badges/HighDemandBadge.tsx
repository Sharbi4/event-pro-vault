import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighDemandBadgeProps {
  variant?: 'overlay' | 'inline';
  className?: string;
}

export function HighDemandBadge({ variant = 'overlay', className }: HighDemandBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'high-demand-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
        variant === 'overlay' && 'shadow-lg',
        className
      )}
    >
      <Flame className="w-3.5 h-3.5" />
      <span>High Demand</span>
    </motion.div>
  );
}
