import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setAuthIntent } from '@/lib/authIntent';

interface ProfileTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventProOption = {
  title: 'Event Pro',
  subtitle: 'Services & Packages',
  description: 'Create service packages, set your availability, and get booked for events.',
  features: ['Hourly & daily packages', 'Instant book or review requests', 'Accept online & cash payments'],
  icon: Sparkles,
};

export function ProfileTypeModal({ open, onOpenChange }: ProfileTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = async () => {
    setIsLoading(true);

    setAuthIntent({
      intent: 'EVENT_PRO_ONBOARDING',
      profileType: 'EVENT_PRO',
    });

    if (!user) {
      const params = new URLSearchParams({
        intent: 'EVENT_PRO_ONBOARDING',
        profileType: 'EVENT_PRO',
      });
      navigate(`/auth?${params.toString()}`);
    } else {
      navigate('/post-auth');
    }

    onOpenChange(false);
    setIsLoading(false);
  };

  const Icon = eventProOption.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Create your free profile
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-1">
            Start getting booked for events
          </p>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="p-5 rounded-xl border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{eventProOption.title}</h3>
                <p className="text-xs text-muted-foreground">{eventProOption.subtitle}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {eventProOption.description}
            </p>

            <ul className="space-y-1.5">
              {eventProOption.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 pt-0">
          <Button
            variant="darkShine"
            size="lg"
            className="w-full"
            disabled={isLoading}
            onClick={handleContinue}
          >
            {isLoading ? 'Loading...' : 'Get Started'}
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
