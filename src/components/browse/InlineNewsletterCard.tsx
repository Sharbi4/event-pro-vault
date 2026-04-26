import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function InlineNewsletterCard() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    setIsSubmitting(false);
    
    toast({
      title: 'Subscribed!',
      description: 'You\'ll receive updates on new Vendors and exclusive deals.',
    });
  };

  if (isSubscribed) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          You're on the list!
        </h3>
        <p className="text-sm text-muted-foreground">
          We'll keep you updated with the best Vendors and deals.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 flex flex-col justify-between h-full min-h-[280px]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary mb-3">
          <Sparkles className="w-3 h-3" />
          Stay Updated
        </div>
        
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Get notified about new Vendors
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Be the first to discover amazing event pros in your area. No spam, just the good stuff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-background/80 border-border focus:border-primary"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
        
        <p className="text-[10px] text-muted-foreground text-center">
          Unsubscribe anytime. We respect your inbox.
        </p>
      </form>
    </div>
  );
}
