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
          {/* Features */}
          <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Event Pro</h3>
                <p className="text-xs text-muted-foreground">Services & Packages</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {['Hourly & daily packages', 'Instant book or review requests', 'Accept online & cash payments'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
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
