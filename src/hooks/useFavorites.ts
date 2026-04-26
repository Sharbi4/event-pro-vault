import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('vendor_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(data.map(f => f.vendor_id));
    }
    setLoading(false);
  };

  const toggleFavorite = async (vendorId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    const isFavorited = favorites.includes(vendorId);

    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('vendor_id', vendorId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive"
        });
      } else {
        setFavorites(prev => prev.filter(id => id !== vendorId));
        toast({
          title: "Removed from favorites",
          description: "Vendor removed from your favorites"
        });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, vendor_id: vendorId });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive"
        });
      } else {
        setFavorites(prev => [...prev, vendorId]);
        toast({
          title: "Added to favorites",
          description: "Vendor saved to your favorites"
        });
      }
    }
  };

  const isFavorite = (vendorId: string) => favorites.includes(vendorId);

  return { favorites, loading, toggleFavorite, isFavorite };
}
