import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'becomeProPopupDismissed';
const DELAY_MS = 10_000;

export function BecomeProPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) sessionStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        <div className="relative bg-gradient-to-br from-primary/15 via-accent/10 to-background p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/30 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> For Food Trucks, Caterers & Pros
            </div>

            <DialogTitle className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-2">
              Get booked. <span className="gradient-text">Get paid.</span>
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mb-5">
              It's <span className="font-semibold text-foreground">free to sign up</span> on EventPro. List your packages and start receiving bookings from hosts ready to pay.
            </DialogDescription>

            <ul className="space-y-2.5 mb-6">
              <li className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>No upfront cost — keep more of what you earn</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>Manage availability & bookings in one place</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                <span>Secure payouts — Stripe-backed</span>
              </li>
            </ul>

            <div className="flex flex-col gap-2">
              <Link to="/become-a-pro" onClick={() => handleClose(false)}>
                <Button variant="gradient" size="lg" className="w-full rounded-full font-bold gap-2">
                  Become an Event Pro
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <button
                onClick={() => handleClose(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
