import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GlassInfoPaneProps {
  vendorName: string;
  vendorAvatar?: string;
  isVerified?: boolean;
  packageName: string;
  price: string;
  isInstant: boolean;
  onSecure: () => void;
}

export function GlassInfoPane({
  vendorName,
  vendorAvatar,
  isVerified,
  packageName,
  price,
  isInstant,
  onSecure,
}: GlassInfoPaneProps) {
  return (
    <div className="glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6">
      {/* Vendor Info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-white/20">
          <AvatarImage src={vendorAvatar} alt={vendorName} />
          <AvatarFallback className="bg-foreground text-background text-sm font-medium">
            {vendorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{vendorName}</span>
            {isVerified && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-black">
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Package Name */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {packageName}
        </h2>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20" />

      {/* Price */}
      <div className="font-mono text-3xl md:text-4xl font-semibold text-white">
        {price}
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={onSecure}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg
          flex items-center justify-center gap-3
          ${isInstant 
            ? 'shimmer-button bg-white text-black' 
            : 'bg-white/20 text-white border border-white/30'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <span>{isInstant ? 'Secure This Date' : 'Request Booking'}</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Social Proof */}
      <p className="text-sm text-white/70 text-center">
        Booked by 14 couples this month
      </p>
    </div>
  );
}
