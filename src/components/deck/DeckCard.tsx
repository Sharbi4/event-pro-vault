import { motion } from 'framer-motion';
import { Zap, Share2 } from 'lucide-react';
import { GlassInfoPane } from './GlassInfoPane';

interface DeckCardProps {
  package: {
    id: string;
    name: string;
    price: number;
    pricing_type?: string;
    type?: string;
    description?: string | null;
    cover_image_url?: string;
    images?: string[];
    instant_book?: boolean;
    booking_mode?: string;
    vendor_name?: string;
    vendor_avatar?: string | null;
    is_verified?: boolean;
  };
  isActive: boolean;
  onSecure: () => void;
  eventDate?: Date;
}

export function DeckCard({ package: pkg, isActive, onSecure, eventDate }: DeckCardProps) {
  const isInstant = pkg.instant_book || pkg.booking_mode === 'INSTANT';
  const coverImage = pkg.cover_image_url || (pkg.images && pkg.images.length > 0 ? pkg.images[0] : null);

  const getPriceDisplay = () => {
    const type = pkg.pricing_type || pkg.type || 'flat';
    switch (type) {
      case 'hourly':
        return `$${pkg.price}/hr`;
      case 'per_guest':
        return `$${pkg.price}/guest`;
      default:
        return `$${pkg.price}`;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg.name,
          text: `Check out ${pkg.name} by ${pkg.vendor_name || 'EventPro'}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  return (
    <motion.div 
      className="min-w-full h-screen snap-center relative flex items-end justify-start overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0">
        {coverImage ? (
          <img src={coverImage} alt={pkg.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {isInstant && (
        <motion.div className="absolute top-24 left-6 md:left-12 z-20" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="instant-badge demand-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            Instant Book
          </div>
        </motion.div>
      )}

      <motion.button onClick={handleShare} className="absolute top-24 right-6 md:right-12 z-20 glass-panel p-3 rounded-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Share2 className="w-5 h-5 text-white" />
      </motion.button>

      <motion.div className="relative z-10 w-full md:w-auto md:max-w-xl p-6 md:p-12 pb-24 md:pb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <GlassInfoPane
          vendorName={pkg.vendor_name || 'Event Pro'}
          vendorAvatar={pkg.vendor_avatar || undefined}
          isVerified={pkg.is_verified}
          packageName={pkg.name}
          price={getPriceDisplay()}
          isInstant={isInstant}
          onSecure={onSecure}
        />
      </motion.div>
    </motion.div>
  );
}
