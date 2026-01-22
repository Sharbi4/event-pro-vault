import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CoverPhotoUploadProps {
  currentCoverUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export function CoverPhotoUpload({ currentCoverUrl, onUploadComplete }: CoverPhotoUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB for cover photos)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cover.${fileExt}`;

      // Delete existing cover first (if any)
      await supabase.storage
        .from('package-images')
        .remove([`${user.id}/cover.jpg`, `${user.id}/cover.png`, `${user.id}/cover.webp`]);

      // Upload new cover
      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('package-images')
        .getPublicUrl(fileName);

      // Add cache-busting timestamp
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update vendor_details in database
      const { error: updateError } = await supabase
        .from('vendor_details')
        .update({ cover_image_url: urlWithTimestamp })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onUploadComplete(urlWithTimestamp);
      toast({
        title: 'Cover photo updated!',
        description: 'Your profile header has been updated',
      });
    } catch (error: any) {
      console.error('Cover photo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload cover photo',
        variant: 'destructive',
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!user) return;

    setUploading(true);
    try {
      // Remove from storage
      await supabase.storage
        .from('package-images')
        .remove([`${user.id}/cover.jpg`, `${user.id}/cover.png`, `${user.id}/cover.webp`]);

      // Update vendor_details
      const { error } = await supabase
        .from('vendor_details')
        .update({ cover_image_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onUploadComplete('');
      toast({
        title: 'Cover photo removed',
        description: 'Your profile header has been reset',
      });
    } catch (error: any) {
      console.error('Cover photo removal error:', error);
      toast({
        title: 'Removal failed',
        description: error.message || 'Failed to remove cover photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentCoverUrl;

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div 
        className="relative w-full h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-border group cursor-pointer"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Upload overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white">
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">
                {displayUrl ? 'Change Cover' : 'Upload Cover'}
              </span>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {displayUrl ? 'Change Cover Photo' : 'Upload Cover Photo'}
        </Button>
        
        {displayUrl && !uploading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCover}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Recommended: 1920x600px. JPG, PNG or WebP. Max 10MB.
      </p>
    </div>
  );
}
