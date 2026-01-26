import { useState } from 'react';
import { 
  Share2, Copy, Check, Link2, 
  Twitter, Facebook, Linkedin, Mail, MessageCircle,
  QrCode, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: 'icon' | 'button' | 'ghost' | 'menu';
  className?: string;
  showLabel?: boolean;
}

interface ShareOption {
  name: string;
  icon: React.ElementType;
  color: string;
  action: (url: string, title: string, text: string) => void;
}

const shareOptions: ShareOption[] = [
  {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]',
    action: (url, title) => {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        '_blank',
        'width=550,height=420'
      );
    },
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2]',
    action: (url) => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'width=550,height=420'
      );
    },
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]',
    action: (url, title) => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank',
        'width=550,height=420'
      );
    },
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]',
    action: (url, title, text) => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`,
        '_blank'
      );
    },
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'hover:bg-primary/10 hover:text-primary',
    action: (url, title, text) => {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    },
  },
];

export function ShareButton({ 
  url, 
  title, 
  text,
  variant = 'menu',
  className,
  showLabel = true
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const shareText = text || title;

  const handleNativeShare = async () => {
    const shareData = {
      title,
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return false;
      }
    }
    return false;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with others.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    const shared = await handleNativeShare();
    if (!shared) {
      copyToClipboard();
    }
  };

  // QR Code generation using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  // Simple icon variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "p-2 rounded-full hover:bg-secondary/50 transition-colors hover-scale",
          className
        )}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>
    );
  }

  // Ghost button variant
  if (variant === 'ghost') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={cn("gap-2", className)}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && 'Share'}
      </Button>
    );
  }

  // Simple button variant
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className={cn("gap-2", className)}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && 'Share'}
      </Button>
    );
  }

  // Enhanced menu variant (default)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2 group", className)}
          >
            <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            {showLabel && 'Share'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-scale-in">
          {/* Copy Link */}
          <DropdownMenuItem 
            onClick={copyToClipboard}
            className="gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-4 h-4 text-trust" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Link2 className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="font-medium">{copied ? 'Copied!' : 'Copy link'}</span>
          </DropdownMenuItem>

          {/* QR Code */}
          <DropdownMenuItem 
            onClick={() => setShowQR(true)}
            className="gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-medium">QR Code</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Social Share Options */}
          {shareOptions.map((option) => (
            <DropdownMenuItem
              key={option.name}
              onClick={() => option.action(shareUrl, title, shareText)}
              className={cn("gap-3 cursor-pointer transition-colors", option.color)}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <option.icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{option.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Scan to share</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-white rounded-xl shadow-lg"
            >
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </motion.div>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {title}
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg max-w-full">
              <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{shareUrl}</span>
            </div>
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper to generate shareable URLs
export function generatePackageShareUrl(packageId: string): string {
  return `${window.location.origin}/package/${packageId}`;
}

export function generateProfileShareUrl(vendorUserId: string, displayName?: string): string {
  if (displayName) {
    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${window.location.origin}/pro/${vendorUserId}?name=${encodeURIComponent(slug)}`;
  }
  return `${window.location.origin}/pro/${vendorUserId}`;
}

export function generateMarketShareUrl(marketId: string): string {
  return `${window.location.origin}/markets/${marketId}`;
}
