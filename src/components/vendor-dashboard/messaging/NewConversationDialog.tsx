import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NewConversationDialogProps {
  onSubmit: (data: {
    clientEmail: string;
    clientName: string;
    subject?: string;
    initialMessage?: string;
  }) => void;
  isPending: boolean;
}

export function NewConversationDialog({ onSubmit, isPending }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail.trim() || !clientName.trim()) return;

    onSubmit({
      clientEmail: clientEmail.trim(),
      clientName: clientName.trim(),
      subject: subject.trim() || undefined,
      initialMessage: initialMessage.trim() || undefined,
    });

    setOpen(false);
    setClientEmail('');
    setClientName('');
    setSubject('');
    setInitialMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
            <DialogDescription>
              Send a message to a client directly
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Client email *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry about services"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="initialMessage">Message (optional)</Label>
              <Textarea
                id="initialMessage"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Hi! Thanks for reaching out..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !clientEmail.trim() || !clientName.trim()}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Start conversation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
