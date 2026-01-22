import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Store, 
  Calendar, 
  Users, 
  Package, 
  MapPin,
  Check,
  ArrowRight,
  Loader2
} from 'lucide-react';

type ProfileType = 'EVENT_PRO' | 'MARKET_SPACE';

interface AccountTypeOption {
  type: ProfileType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  route: string;
  badge?: string;
}

const accountTypes: AccountTypeOption[] = [
  {
    type: 'EVENT_PRO',
    title: 'Event Pro',
    subtitle: 'Bookable services & packages',
    description: 'Perfect for DJs, photographers, caterers, florists, and other event service providers who offer packages and services.',
    features: [
      'Create service packages with pricing',
      'Manage your availability calendar',
      'Accept bookings and deposits',
      'Build your portfolio with photos & videos'
    ],
    icon: <Sparkles className="w-8 h-8" />,
    route: '/eventpro-onboarding',
    badge: 'Most Popular'
  },
  {
    type: 'MARKET_SPACE',
    title: 'Market Space',
    subtitle: 'Vendor slots & booth rentals',
    description: 'Ideal for farmers markets, flea markets, pop-up events, and festivals looking to rent out vendor spaces.',
    features: [
      'List your market or event venue',
      'Create different slot types & sizes',
      'Manage slot inventory by date',
      'Accept vendor reservations'
    ],
    icon: <Store className="w-8 h-8" />,
    route: '/marketspace-onboarding'
  }
];

export default function Onboarding() {
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has a profile type
    const checkExistingProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.profile_type) {
        // Redirect to appropriate onboarding if they've already selected
        if (profile.profile_type === 'EVENT_PRO') {
          navigate('/eventpro-onboarding');
        } else if (profile.profile_type === 'MARKET_SPACE') {
          navigate('/marketspace-onboarding');
        }
      }
    };
    
    checkExistingProfile();
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!selectedType) return;
    
    // If not authenticated, redirect to auth with return URL
    if (!user) {
      const selectedOption = accountTypes.find(t => t.type === selectedType);
      const returnUrl = selectedOption?.route || '/onboarding';
      navigate(`/auth?returnTo=${encodeURIComponent(returnUrl)}&profileType=${selectedType}`);
      return;
    }
    
    setSaving(true);
    try {
      // Save profile type
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          profile_type: selectedType,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      // Navigate to appropriate onboarding
      const selectedOption = accountTypes.find(t => t.type === selectedType);
      if (selectedOption) {
        navigate(selectedOption.route);
      }
    } catch (error) {
      console.error('Error saving profile type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your selection. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Step 1 of 2
            </Badge>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
              What are you listing?
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the type of account that best describes what you'll be offering. 
              This helps us customize your experience.
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {accountTypes.map((option) => (
              <Card
                key={option.type}
                variant={selectedType === option.type ? 'default' : 'glass'}
                className={`relative p-6 cursor-pointer transition-all duration-300 ${
                  selectedType === option.type
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(option.type)}
              >
                {option.badge && (
                  <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                    {option.badge}
                  </Badge>
                )}
                
                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedType === option.type
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedType === option.type && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  selectedType === option.type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                }`}>
                  {option.icon}
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-primary font-medium mb-3">
                  {option.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {option.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="gradient"
              size="xl"
              className="w-full max-w-md gap-2"
              disabled={!selectedType || saving}
              onClick={handleContinue}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
            
            {!user && selectedType && (
              <p className="text-sm text-muted-foreground text-center">
                You'll be asked to sign in or create an account to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
