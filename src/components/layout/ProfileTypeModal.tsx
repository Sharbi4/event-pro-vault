import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, UserPlus, Share2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { eventProCategories } from '@/data/eventpro-categories';

interface ProfileTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEW_COUNT = 6;

const highlightCategories = [
  'food-truck', 'caterer', 'bakery', 'cake-baker', 'event-rentals', 'dj',
];

export function ProfileTypeModal({ open, onOpenChange }: ProfileTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = async () => {
    setIsLoading(true);
    onOpenChange(false);

    if (!user) {
      navigate('/auth/pro');
    } else {
      navigate('/eventpro-onboarding');
    }

    setIsLoading(false);
  };

  // Put highlighted ones first, then the rest
  const highlighted = highlightCategories
    .map(id => eventProCategories.find(c => c.id === id))
    .filter(Boolean) as typeof eventProCategories;
  const rest = eventProCategories.filter(c => !highlightCategories.includes(c.id));
  const ordered = [...highlighted, ...rest];
  const visible = showAll ? ordered : ordered.slice(0, PREVIEW_COUNT);
  const hiddenCount = ordered.length - PREVIEW_COUNT;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setShowAll(false); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Become an Event Pro
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-1">
            Start getting booked for events
          </p>
        </DialogHeader>

        <div className="px-6 pb-2 overflow-y-auto flex-1">
          {/* How it works — 3 steps */}
          <div className="space-y-2 mb-4">
            {[
              { icon: UserPlus, title: 'Create a free account', copy: 'Set up your Event Pro profile in minutes — no upfront cost.' },
              { icon: Share2, title: 'Share your booking page', copy: 'Send your link to customers or get discovered on the EventPro marketplace.' },
              { icon: Wallet, title: 'Get booked & paid', copy: 'Accept online or cash payments and manage everything in one dashboard.' },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary flex-shrink-0 relative">
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{step.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Great for food trucks, caterers, cottage bakers, event rentals & more
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {visible.map((cat) => {
                const Icon = cat.icon;
                return (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"
                  >
                    <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                    {cat.name}
                  </span>
                );
              })}
            </div>
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                +{hiddenCount} more categories
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
            {showAll && (
              <button
                onClick={() => setShowAll(false)}
                className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Show less
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 pt-3 border-t border-border">
          <Button
            variant="darkShine"
            size="lg"
            className="w-full"
            disabled={isLoading}
            onClick={handleContinue}
          >
            {isLoading ? 'Loading...' : user ? 'Get Started' : 'Sign Up to Get Started'}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              You'll create an account or sign in first
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
