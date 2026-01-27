import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Share2, MessageSquare, Mail, Twitter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InviteProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: string;
  city?: string;
}

export function InviteProModal({ open, onOpenChange, category, city }: InviteProModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = window.location.origin;
  const inviteUrl = refCode ? `${baseUrl}/become-pro?ref=${refCode}` : '';

  const shareMessage = `Join EventPros by Vendibook—list your packages and get booked by availability. Sign up here: ${inviteUrl}`;

  useEffect(() => {
    if (open && !refCode) {
      generateRefCode();
    }
  }, [open]);

  const generateRefCode = async () => {
    setLoading(true);
    try {
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase.from('referral_invites').insert({
        ref_code: code,
        created_by_user_id: user?.id || null,
        category: category || null,
        city: city || null
      });

      if (error) throw error;
      setRefCode(code);
    } catch (err) {
      console.error('Error creating referral:', err);
      // Use a fallback code
      setRefCode(Math.random().toString(36).substring(2, 10).toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast({ title: 'Link copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleShare = async (platform: 'sms' | 'email' | 'twitter' | 'native') => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(inviteUrl);

    switch (platform) {
      case 'sms':
        window.open(`sms:?body=${encodedMessage}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Join EventPros')}&body=${encodedMessage}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedMessage}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Join EventPros',
              text: 'List your packages and get booked by availability.',
              url: inviteUrl
            });
          } catch {
            // User cancelled
          }
        }
        break;
    }

    // Track click - fire and forget
    if (refCode) {
      supabase
        .from('referral_invites')
        .select('clicks')
        .eq('ref_code', refCode)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase.from('referral_invites').update({ clicks: (data.clicks || 0) + 1 }).eq('ref_code', refCode);
          }
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Invite an Event Pro
          </DialogTitle>
          <DialogDescription>
            Know a photographer, food truck, DJ, or bartender? Invite them to list their packages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Copy link section */}
          <div className="space-y-2">
            <Label>Your invite link</Label>
            <div className="flex gap-2">
              <Input
                value={loading ? 'Generating...' : inviteUrl}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={loading}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="space-y-3">
            <Label>Share via</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleShare('sms')} className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Text Message
              </Button>
              <Button variant="outline" onClick={() => handleShare('email')} className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button variant="outline" onClick={() => handleShare('twitter')} className="gap-2">
                <Twitter className="w-4 h-4" />
                Twitter/X
              </Button>
              {navigator.share && (
                <Button variant="outline" onClick={() => handleShare('native')} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  More...
                </Button>
              )}
            </div>
          </div>

          {/* Copy message */}
          <div className="space-y-2">
            <Label>Or copy this message</Label>
            <div className="relative">
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {shareMessage}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareMessage);
                  toast({ title: 'Message copied!' });
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
