import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface RevealButtonProps {
  onClick: () => void;
}

export function RevealButton({ onClick }: RevealButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full text-lg font-semibold overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Shimmer effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut"
        }}
      />
      
      <span className="relative z-10">Reveal Matches</span>
      
      <motion.span
        className="relative z-10"
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <ArrowRight className="w-5 h-5" />
      </motion.span>
    </motion.button>
  );
}
