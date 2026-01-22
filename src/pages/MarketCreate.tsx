import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';
import { 
  Store, 
  Loader2, 
  MapPin, 
  FileText, 
  Tag,
  Image as ImageIcon,
  X,
  Upload,
  CheckCircle
} from 'lucide-react';

const MARKET_TYPES = [
  { id: 'farmers-market', label: "Farmer's Market", icon: '🥬' },
  { id: 'flea-market', label: 'Flea Market', icon: '🛍️' },
  { id: 'craft-fair', label: 'Craft Fair', icon: '🎨' },
  { id: 'food-festival', label: 'Food Festival', icon: '🍔' },
  { id: 'artisan-market', label: 'Artisan Market', icon: '✨' },
  { id: 'night-market', label: 'Night Market', icon: '🌙' },
  { id: 'pop-up-market', label: 'Pop-up Market', icon: '⚡' },
  { id: 'other', label: 'Other', icon: '📍' },
];

const VENDOR_CATEGORIES = [
  'Food & Beverage',
  'Fresh Produce',
  'Baked Goods',
  'Arts & Crafts',
  'Jewelry',
  'Clothing',
  'Home Goods',
  'Plants & Flowers',
  'Vintage & Antiques',
  'Health & Beauty',
  'Pet Products',
  'Services',
];

export default function MarketCreate() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [marketType, setMarketType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    formattedAddress: '',
    city: '',
    state: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Check if user already has a market
  useEffect(() => {
    const checkExistingMarket = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('markets')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // User already has a market, redirect to dashboard
          navigate('/marketspace-dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking existing market:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingMarket();
  }, [user, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?returnTo=/marketspace/create');
    }
  }, [user, authLoading, navigate]);

  const toggleCategory = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue; // 10MB limit

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('package-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('package-images')
          .getPublicUrl(fileName);

        setImages(prev => [...prev, publicUrl]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      toast({ title: 'Market name is required', variant: 'destructive' });
      return;
    }
    if (!marketType) {
      toast({ title: 'Please select a market type', variant: 'destructive' });
      return;
    }
    if (!location.formattedAddress) {
      toast({ title: 'Location is required', variant: 'destructive' });
      return;
    }
    if (!description.trim()) {
      toast({ title: 'Description is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('markets')
        .insert({
          user_id: user.id,
          name: name.trim(),
          market_type: marketType,
          description: description.trim(),
          formatted_address: location.formattedAddress,
          city: location.city,
          state: location.state,
          lat: location.lat,
          lng: location.lng,
          categories_allowed: categories,
          media_items: images.map(url => ({ url, type: 'image' })),
          cover_image_url: images[0] || null,
          is_published: false,
          market_status: 'draft',
          booking_mode: 'instant',
        } as any)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Market limit reached',
            description: 'You can only manage one market per account.',
            variant: 'destructive'
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Market created!',
        description: 'Now add slot types and inventory to start accepting bookings.',
      });

      navigate('/marketspace-dashboard');
    } catch (error) {
      console.error('Error creating market:', error);
      toast({
        title: 'Failed to create market',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const isValid = name.trim() && marketType && location.formattedAddress && description.trim();

  if (authLoading || checkingExisting) {
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
      <div className="min-h-screen pt-20 lg:pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Create Your Market
            </h1>
            <p className="text-muted-foreground">
              Set up your market listing in minutes. You can add slot types and inventory after.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Market Name */}
            <Card>
              <CardContent className="p-6">
                <Label htmlFor="name" className="text-base font-medium flex items-center gap-2 mb-3">
                  <Store className="w-4 h-4 text-primary" />
                  Market Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Venice Beach Sunday Market"
                  className="h-12"
                />
              </CardContent>
            </Card>

            {/* Market Type */}
            <Card>
              <CardContent className="p-6">
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  Market Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MARKET_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMarketType(type.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        marketType === type.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location <span className="text-destructive">*</span>
                </Label>
                <div className="border border-input rounded-lg p-3">
                  <LocationAutocomplete
                    value={location.formattedAddress}
                    onChange={(value) => setLocation(prev => ({ ...prev, formattedAddress: value }))}
                    onPlaceSelect={(place) => {
                      if (place.geometry?.location) {
                        const addressComponents = place.formatted_address?.split(', ') || [];
                        const city = addressComponents[0] || '';
                        const state = addressComponents.length > 2 ? addressComponents[addressComponents.length - 2] : '';
                        setLocation({
                          formattedAddress: place.formatted_address || place.name || '',
                          city,
                          state,
                          lat: place.geometry.location.lat(),
                          lng: place.geometry.location.lng(),
                        });
                      }
                    }}
                    placeholder="Search for your market location..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <Label htmlFor="description" className="text-base font-medium flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your market, what vendors can expect, the vibe, crowd..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Vendor Categories */}
            <Card>
              <CardContent className="p-6">
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  Vendor Categories Allowed
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {VENDOR_CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={categories.includes(category) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        categories.includes(category) 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'hover:border-primary'
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardContent className="p-6">
                <Label className="text-base font-medium flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Photos
                  <span className="text-xs text-muted-foreground font-normal">(at least 1 recommended)</span>
                </Label>
                
                <div className="grid grid-cols-3 gap-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                      </>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
            <div className="container mx-auto max-w-2xl flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSubmit}
                disabled={!isValid || saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Market
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
