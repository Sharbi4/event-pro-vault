import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AskPartnerButtonProps {
  packageName: string;
  vendorName: string;
  price: string;
  packageId?: string;
}

export function AskPartnerButton({
  packageName,
  vendorName,
  price,
  packageId,
}: AskPartnerButtonProps) {
  const { toast } = useToast();

  const handleAskPartner = async () => {
    const shareUrl = packageId 
      ? `${window.location.origin}/package/${packageId}`
      : window.location.href;

    const shareData = {
      title: `What do you think about ${packageName}?`,
      text: `Check out ${packageName} by ${vendorName} - ${price}. Let me know if you like it!`,
      url: shareUrl,
    };

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed - fallback to clipboard
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Share it with your partner to get their opinion.',
      });
    } catch {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.button
      onClick={handleAskPartner}
      className="w-full py-3 rounded-xl font-medium text-base
        bg-white/20 text-white border border-white/30
        flex items-center justify-center gap-2
        hover:bg-white/30 transition-colors"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Heart className="w-4 h-4" />
      <span>Ask Partner</span>
    </motion.button>
  );
}
