import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, ArrowRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Package {
  id: string;
  name: string;
  price: number;
  cover_image_url?: string;
  vendor_name?: string;
  vendor_avatar?: string;
  category?: string;
  is_verified?: boolean;
  instant_book?: boolean;
  rating?: number;
  review_count?: number;
}

interface ResultsOverlayProps {
  open: boolean;
  onClose: () => void;
  packages: Package[];
  location?: string;
  date?: Date;
  onSelectPackage: (index: number) => void;
  activeIndex: number;
}

export default function ResultsOverlay({
  open,
  onClose,
  packages,
  location,
  date,
  onSelectPackage,
  activeIndex,
}: ResultsOverlayProps) {
  const navigate = useNavigate();

  const handleBrowse = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (date) params.set('date', date.toISOString().split('T')[0]);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/40 backdrop-blur-md"
          />

          {/* Overlay Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex flex-col rounded-3xl overflow-hidden touch-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Swipe Indicator */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {packages.length} Results
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {location}
                    </span>
                  )}
                  {date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Results Grid */}
            <ScrollArea className="flex-1 p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {packages.map((pkg, index) => (
                  <motion.button
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      onSelectPackage(index);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden text-left transition-all ${
                      index === activeIndex 
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' 
                        : 'hover:scale-[1.02]'
                    }`}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {pkg.cover_image_url ? (
                        <img
                          src={pkg.cover_image_url}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {pkg.instant_book && (
                          <span className="px-2 py-0.5 bg-trust text-trust-foreground text-[10px] font-medium rounded-full flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            Instant
                          </span>
                        )}
                      </div>

                      {/* Active indicator */}
                      {index === activeIndex && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground truncate">{pkg.category}</p>
                      <h3 className="font-semibold text-sm text-foreground truncate mt-0.5">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-foreground">
                          ${pkg.price}
                        </span>
                        {pkg.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {pkg.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>

            {/* Footer with Browse Button */}
            <div className="p-4 md:p-6 border-t border-white/10">
              <Button
                onClick={handleBrowse}
                variant="darkShine"
                size="lg"
                className="w-full gap-2"
              >
                Browse All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
