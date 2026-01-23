import { motion } from 'framer-motion';

interface DeckNavigationProps {
  total: number;
  active: number;
  onChange: (index: number) => void;
}

export function DeckNavigation({ total, active, onChange }: DeckNavigationProps) {
  // Show max 7 dots, with ellipsis logic for many items
  const maxDots = 7;
  const showEllipsis = total > maxDots;

  const getDots = () => {
    if (!showEllipsis) {
      return Array.from({ length: total }, (_, i) => i);
    }

    // Show first, last, and dots around active
    const dots: (number | 'ellipsis')[] = [];
    
    if (active <= 3) {
      // Near start
      for (let i = 0; i < 5; i++) dots.push(i);
      dots.push('ellipsis');
      dots.push(total - 1);
    } else if (active >= total - 4) {
      // Near end
      dots.push(0);
      dots.push('ellipsis');
      for (let i = total - 5; i < total; i++) dots.push(i);
    } else {
      // Middle
      dots.push(0);
      dots.push('ellipsis');
      dots.push(active - 1);
      dots.push(active);
      dots.push(active + 1);
      dots.push('ellipsis');
      dots.push(total - 1);
    }

    return dots;
  };

  return (
    <motion.div 
      className="fixed bottom-8 left-0 right-0 z-40 flex items-center justify-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {getDots().map((dot, i) => {
        if (dot === 'ellipsis') {
          return (
            <span key={`ellipsis-${i}`} className="text-white/50 px-1">
              ···
            </span>
          );
        }

        const isActive = dot === active;

        return (
          <button
            key={dot}
            onClick={() => onChange(dot)}
            className={`
              transition-all duration-300 rounded-full
              ${isActive 
                ? 'w-8 h-2 bg-white' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }
            `}
            aria-label={`Go to slide ${dot + 1}`}
          />
        );
      })}
    </motion.div>
  );
}
