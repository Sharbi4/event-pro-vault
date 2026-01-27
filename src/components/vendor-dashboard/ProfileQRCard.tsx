import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProfileQRCardProps {
  username?: string | null;
  userId: string;
  displayName?: string | null;
}

export function ProfileQRCard({ username, userId, displayName }: ProfileQRCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Build the profile URL - prefer username, fallback to user ID
  const baseUrl = window.location.origin;
  const profilePath = username ? `/eventpro/${username}` : `/vendor/${userId}`;
  const profileUrl = `${baseUrl}${profilePath}`;

  // QR Code API URL (larger for download quality)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}&margin=10`;
  const qrCodePreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&margin=10`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName || 'eventpro'}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Your QR Code</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Share your unique QR code at events, on business cards, or anywhere you want people to find you.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="p-4 bg-white rounded-xl shadow-lg border">
              <img 
                src={qrCodePreviewUrl} 
                alt="Your profile QR code"
                className="w-40 h-40 sm:w-48 sm:h-48"
                loading="lazy"
              />
            </div>
            {/* Decorative gradient ring */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/20 to-trust/20 rounded-xl blur-xl scale-110" />
          </motion.div>

          {/* Actions */}
          <div className="flex-1 w-full space-y-4">
            {/* Profile URL display */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Profile URL</p>
              <p className="text-sm font-medium truncate">{profileUrl}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-trust" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleDownloadQR}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Download QR'}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full gap-2"
              onClick={() => window.open(profileUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View Profile
            </Button>

            {!username && (
              <p className="text-xs text-muted-foreground text-center">
                💡 Tip: Set a custom username in your profile settings for a cleaner URL
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
