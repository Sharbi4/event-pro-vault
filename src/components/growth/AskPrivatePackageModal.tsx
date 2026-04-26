import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MessageSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeAuthIntent } from '@/lib/authIntent';

interface AskPrivatePackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorUserId: string;
  vendorName: string;
  source?: string;
}

/**
 * Customer-facing CTA replacing "Request a Quote".
 * Creates (or reuses) a conversation with the vendor and posts an initial
 * inquiry message describing the event. The vendor then replies with a
 * Private Package the customer can review and book on EventPro.
 */
export function AskPrivatePackageModal({
  open,
  onOpenChange,
  vendorUserId,
  vendorName,
  source = 'vendor_profile',
}: AskPrivatePackageModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [guestCount, setGuestCount] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) {
      storeAuthIntent({
        type: 'ask_private_package',
        vendorUserId,
        vendorName,
        returnTo: window.location.pathname,
      });
      onOpenChange(false);
      navigate('/auth/booking');
      return;
    }

    if (!details.trim()) {
      toast({ title: 'Tell the vendor about your event', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Reuse an existing active conversation if one exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('vendor_user_id', vendorUserId)
        .eq('client_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: convError } = await supabase
          .from('conversations')
          .insert({
            vendor_user_id: vendorUserId,
            client_user_id: user.id,
            client_email: user.email,
            subject: 'Custom event inquiry',
            status: 'active',
            last_message_at: new Date().toISOString(),
            vendor_unread_count: 1,
            client_unread_count: 0,
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = created.id;
      }

      // Build the inquiry message
      const lines = [
        `Hi ${vendorName} — I'd like to ask about a private package for my event.`,
        '',
        eventDate ? `Event date: ${format(eventDate, 'PPP')}` : null,
        guestCount ? `Guest count: ${guestCount}` : null,
        location ? `Location: ${location}` : null,
        '',
        details.trim(),
      ]
        .filter((l) => l !== null)
        .join('\n');

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        sender_type: 'client',
        content: lines,
      });

      if (msgError) throw msgError;

      // Bump conversation
      const { data: convData } = await supabase
        .from('conversations')
        .select('vendor_unread_count')
        .eq('id', conversationId)
        .single();

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          vendor_unread_count: (convData?.vendor_unread_count || 0) + 1,
        })
        .eq('id', conversationId);

      // Notify vendor (fire-and-forget)
      supabase.functions
        .invoke('send-message-notification', {
          body: { conversationId, messageContent: lines, senderType: 'client' },
        })
        .catch((e) => console.warn('notify failed', e));

      toast({
        title: 'Inquiry sent',
        description: `${vendorName} will reply with a private package you can review and book here.`,
      });

      onOpenChange(false);
      navigate('/dashboard?tab=messages');
    } catch (err: any) {
      console.error('AskPrivatePackage error', err);
      toast({
        title: 'Could not send inquiry',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Ask about a private package
          </DialogTitle>
          <DialogDescription>
            Send {vendorName} a quick brief. They'll reply with a custom package you can review
            and book securely on EventPro — no offline back-and-forth.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !eventDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    disabled={(d) => d < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Guests</Label>
              <Input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, venue, or address"
            />
          </div>

          <div className="space-y-2">
            <Label>What you're looking for *</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell the vendor about your event — menu ideas, vibe, budget range, anything important."
              rows={5}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Keep contact info inside EventPro. The vendor will send a private package you can
              accept and pay for here — that's how the booking gets protected.
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Sending…' : 'Send inquiry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
