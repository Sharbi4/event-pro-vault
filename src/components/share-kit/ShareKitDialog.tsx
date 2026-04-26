import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  QrCode,
  Mail,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Sparkles,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { useShareKit } from '@/hooks/useShareKit';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ShareKitDialogProps {
  open: boolean;
  onClose: () => void;
  packageId?: string | null;
  packageName?: string;
}

export function ShareKitDialog({ open, onClose, packageId, packageName }: ShareKitDialogProps) {
  const { link, loading, buildShareUrl, trackShare } = useShareKit(packageId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState(
    `Hey — I'd love to work with you on your next event! Check out my offerings:`
  );
  const [sending, setSending] = useState(false);

  const url = link ? buildShareUrl(link.code) : '';
  const caption = useMemo(
    () =>
      packageName
        ? `Book ${packageName} via my Event Pro page 🎉 ${url}`
        : `Book me via Event Pro 🎉 ${url}`,
    [packageName, url]
  );

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`
    : '';

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    trackShare('copy_link');
    toast({ title: 'Link copied', description: '+5 points earned for sharing!' });
  };

  const shareSocial = (channel: 'twitter' | 'facebook' | 'sms' | 'email' | 'instagram') => {
    if (!url) return;
    const enc = encodeURIComponent(caption);
    const encUrl = encodeURIComponent(url);
    let target = '';
    switch (channel) {
      case 'twitter':
        target = `https://twitter.com/intent/tweet?text=${enc}`;
        break;
      case 'facebook':
        target = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
        break;
      case 'sms':
        target = `sms:?body=${enc}`;
        break;
      case 'email':
        target = `mailto:?subject=${encodeURIComponent('Book me on Event Pro')}&body=${enc}`;
        break;
      case 'instagram':
        // IG has no web share — copy caption + open IG
        navigator.clipboard.writeText(caption);
        toast({ title: 'Caption copied', description: 'Paste it in your Instagram post or story.' });
        target = 'https://www.instagram.com/';
        break;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
    trackShare(channel);
  };

  const sendInvite = async () => {
    if (!user || !link || !inviteEmail.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-share-invite', {
        body: {
          recipient_email: inviteEmail.trim(),
          message: inviteMessage,
          share_code: link.code,
          package_id: packageId ?? null,
          package_name: packageName ?? null,
        },
      });
      if (error) throw error;

      await supabase.from('share_invites').insert({
        vendor_user_id: user.id,
        share_link_id: link.id,
        recipient_email: inviteEmail.trim(),
        channel: 'email',
        message: inviteMessage,
      });
      trackShare('email_invite');
      toast({ title: 'Invite sent', description: `Sent to ${inviteEmail}. +5 points!` });
      setInviteEmail('');
    } catch (err) {
      toast({
        title: 'Could not send invite',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const downloadFlyer = async () => {
    if (!link || !url) return;
    // Build a simple printable flyer in a new window with QR + caption
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${packageName ?? 'Event Pro'} – Flyer</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#111}
      h1{font-size:32px;margin:0 0 8px} h2{font-weight:400;color:#555;margin:0 0 24px}
      img{width:300px;height:300px;margin:24px auto} .code{font:600 24px/1.2 monospace;letter-spacing:2px;background:#f3f4f6;padding:12px 24px;border-radius:12px;display:inline-block;margin-top:12px} .url{color:#666;margin-top:16px;word-break:break-all}
      .badge{display:inline-block;background:#111;color:#fff;padding:6px 14px;border-radius:999px;font-size:12px;letter-spacing:1px;margin-bottom:16px}
      </style></head><body>
      <div class="badge">EVENT PRO • SCAN TO BOOK</div>
      <h1>${packageName ?? 'Book Me on EventPros'}</h1>
      <h2>Scan the QR code or visit the link below</h2>
      <img src="${qrSrc}" alt="QR" />
      <div class="code">${link.code}</div>
      <div class="url">${url}</div>
      <script>setTimeout(()=>window.print(),500)</script>
      </body></html>`);
    w.document.close();
    trackShare('flyer_pdf');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Share Kit
          </DialogTitle>
          <DialogDescription>
            Share to earn points, badges & unlock perks. Every share = +5 pts. Every signup = +25.
            Every booking = +100.
          </DialogDescription>
        </DialogHeader>

        {loading || !link ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="qr">QR / Flyer</TabsTrigger>
              <TabsTrigger value="invite">Invite</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Input value={url} readOnly className="font-mono text-xs" />
                <Button onClick={copy} variant="outline" size="sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Suggested caption</div>
                {caption}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Clicks" value={link.click_count} />
                <Stat label="Signups" value={link.signup_count} />
                <Stat label="Bookings" value={link.booking_count} />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Code: <Badge variant="secondary">{link.code}</Badge>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => shareSocial('instagram')} variant="outline" className="justify-start">
                  <Instagram className="w-4 h-4 mr-2" /> Instagram
                </Button>
                <Button onClick={() => shareSocial('facebook')} variant="outline" className="justify-start">
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </Button>
                <Button onClick={() => shareSocial('twitter')} variant="outline" className="justify-start">
                  <Twitter className="w-4 h-4 mr-2" /> X / Twitter
                </Button>
                <Button onClick={() => shareSocial('sms')} variant="outline" className="justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" /> SMS
                </Button>
                <Button onClick={() => shareSocial('email')} variant="outline" className="justify-start col-span-2">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Instagram posts can't auto-share — we'll copy the caption for you.
              </p>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4 pt-4">
              <div className="flex flex-col items-center">
                {qrSrc && (
                  <img
                    src={qrSrc}
                    alt="QR code"
                    className="w-56 h-56 rounded-lg border border-border bg-white p-3"
                  />
                )}
                <Badge variant="secondary" className="mt-3">{link.code}</Badge>
              </div>
              <Button onClick={downloadFlyer} variant="default" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Print / save flyer PDF
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Hand out at events, tape on your truck, share with venues.
              </p>
            </TabsContent>

            <TabsContent value="invite" className="space-y-3 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Past customer email</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={sendInvite}
                disabled={sending || !inviteEmail.trim()}
                className="w-full"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send invite
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Includes your share link with attribution. SMS invites coming soon.
              </p>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
