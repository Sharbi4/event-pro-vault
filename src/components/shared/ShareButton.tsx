import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: 'icon' | 'button' | 'ghost';
  className?: string;
}

export function ShareButton({ 
  url, 
  title, 
  text,
  variant = 'button',
  className 
}: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    
    const shareData = {
      title,
      text: text || title,
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
        description: 'Share this link with others.',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "p-2 rounded-full hover:bg-secondary/50 transition-colors",
          className
        )}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={cn("gap-2", className)}
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn("gap-2", className)}
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}

// Helper to generate shareable URLs
export function generatePackageShareUrl(packageId: string): string {
  return `${window.location.origin}/package/${packageId}`;
}

export function generateProfileShareUrl(vendorUserId: string, displayName?: string): string {
  // Use display name slug if available, otherwise use user ID
  if (displayName) {
    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${window.location.origin}/pro/${vendorUserId}?name=${encodeURIComponent(slug)}`;
  }
  return `${window.location.origin}/pro/${vendorUserId}`;
}
