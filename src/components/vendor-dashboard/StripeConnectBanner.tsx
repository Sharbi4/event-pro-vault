import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle2, 
  ExternalLink, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripeConnectBannerProps {
  stripeStatus: string | null;
  onStatusChange?: () => void;
}

export function StripeConnectBanner({ stripeStatus, onStatusChange }: StripeConnectBannerProps) {
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const isConnected = stripeStatus === 'active';

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting Stripe Connect:', error);
      toast({
        title: "Failed to start Stripe setup",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Online payments enabled
                  </p>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Customers can pay securely with card
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />
      
      <CardContent className="p-5 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  Accept payments online
                </h3>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Connect Stripe to accept online payments for your packages and give customers more flexibility at checkout.
              </p>
            </div>
          </div>
          
          <Button 
            variant="gradient" 
            onClick={handleConnectStripe}
            disabled={connecting}
            className="gap-2 flex-shrink-0"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Connect Stripe
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
