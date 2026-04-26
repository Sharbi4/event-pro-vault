import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Package, BarChart3, Zap, Check, Loader2, Star, Mail, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  loading?: boolean;
  currentPackageCount: number;
}

const benefits = [
  {
    icon: Package,
    title: 'Up to 20 Packages',
    description: 'Create more packages to showcase your full range of services',
  },
  {
    icon: Star,
    title: 'Featured Partner',
    description: 'Your listings appear at the top of search results',
  },
  {
    icon: Mail,
    title: 'Email Newsletter Feature',
    description: 'Get featured in our customer email newsletters',
  },
  {
    icon: Share2,
    title: 'Social Media Spotlight',
    description: 'Featured promotions on our social media channels',
  },
  {
    icon: BarChart3,
    title: 'AI Analytics',
    description: 'Get intelligent insights on your business performance',
  },
];

export default function PremiumUpgradeModal({
  open,
  onClose,
  onUpgrade,
  loading,
  currentPackageCount,
}: PremiumUpgradeModalProps) {
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Vendor Premium</h2>
                    <p className="text-sm text-white/80">Unlock your full potential</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <p className="text-sm">
                    You've reached the <span className="font-bold">5 package limit</span> on the free tier.
                    Upgrade to create up to 20 packages!
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="p-6 space-y-4">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="px-6 pb-6">
                <div className="p-4 bg-secondary/50 rounded-xl mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-foreground">$25</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Current: {currentPackageCount}/5 packages</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onUpgrade}
                  disabled={loading}
                  variant="darkShine"
                  size="lg"
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  Cancel anytime. No long-term commitment.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
