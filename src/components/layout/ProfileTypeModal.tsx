import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Store, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setAuthIntent, type ProfileType as AuthProfileType } from '@/lib/authIntent';

interface ProfileTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProfileType = 'EVENT_PRO' | 'MARKET_SPACE';

const profileOptions = [
  {
    type: 'EVENT_PRO' as ProfileType,
    title: 'Event Pro',
    subtitle: 'Services & Packages',
    description: 'Create service packages, set your availability, and get booked for events.',
    features: ['Hourly & daily packages', 'Instant book or review requests', 'Accept online & cash payments'],
    icon: Sparkles,
    intent: 'EVENT_PRO_ONBOARDING' as const,
  },
  {
    type: 'MARKET_SPACE' as ProfileType,
    title: 'Market Space',
    subtitle: 'Slots & Vendor Booking',
    description: 'List your market, create slot types, and manage vendor bookings.',
    features: ['Flexible slot types', 'Inventory calendar', 'Recurring weekly bookings'],
    icon: Store,
    intent: 'MARKET_ONBOARDING' as const,
  },
];

export function ProfileTypeModal({ open, onOpenChange }: ProfileTypeModalProps) {
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);

    const selectedOption = profileOptions.find(opt => opt.type === selected);
    if (!selectedOption) return;

    // Store the intent using the new auth intent system
    const profileType: AuthProfileType = selected === 'EVENT_PRO' ? 'EVENT_PRO' : 'MARKET_SPACE';
    
    setAuthIntent({
      intent: selectedOption.intent,
      profileType,
    });

    if (!user) {
      // Redirect to auth with intent params
      const params = new URLSearchParams({
        intent: selectedOption.intent,
        profileType,
      });
      navigate(`/auth?${params.toString()}`);
    } else {
      // User is authenticated, go to post-auth router which will decide the correct destination
      navigate('/post-auth');
    }

    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Create your free profile
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-1">
            Choose how you want to use EventPro
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 grid gap-4 sm:grid-cols-2">
          {profileOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.type;

            return (
              <button
                key={option.type}
                onClick={() => setSelected(option.type)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-secondary/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{option.title}</h3>
                    <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>

                <ul className="space-y-1.5">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="p-6 pt-0">
          <Button
            variant="darkShine"
            size="lg"
            className="w-full"
            disabled={!selected || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              You'll create an account or sign in on the next step
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
