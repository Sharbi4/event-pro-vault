import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactVendorButtonProps {
  vendorUserId: string;
  vendorName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
  size?: 'default' | 'sm' | 'lg';
}

export function ContactVendorButton({
  vendorUserId,
  vendorName,
  className,
  variant = 'outline',
  size = 'default',
}: ContactVendorButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);

  // Fetch user profile for display name
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setClientName(data.display_name || data.full_name || user.email?.split('@')[0] || 'Customer');
          }
        });
    }
  }, [user]);

  const handleContact = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      toast.info('Please sign in to contact this Vendor');
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Don't allow Vendors to message themselves
    if (user.id === vendorUserId) {
      toast.error("You can't message yourself");
      return;
    }

    setIsCreating(true);

    try {
      // Check if conversation already exists between this client and Vendor
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_user_id', user.id)
        .eq('vendor_user_id', vendorUserId)
        .is('booking_id', null) // Only check general conversations, not booking-specific ones
        .maybeSingle();

      if (existingConvo) {
        // Navigate to messages tab
        toast.success('Opening your existing conversation');
        navigate(`/dashboard?tab=messages`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          vendor_user_id: vendorUserId,
          client_user_id: user.id,
          client_name: clientName || user.email?.split('@')[0] || 'Customer',
          client_email: user.email,
          subject: `Inquiry about your services`,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Conversation started! You can now message this Event Pro.');
      
      // Navigate to the customer dashboard messages tab
      navigate(`/dashboard?tab=messages`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleContact}
      disabled={isCreating}
      className={className}
    >
      {isCreating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      Contact
    </Button>
  );
}
