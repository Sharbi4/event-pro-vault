import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImagePlus, Upload, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PackageFormData } from './PackageFormWizard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';

interface StepImagesProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
}

export function StepImages({ formData, updateFormData }: StepImagesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.images.findIndex((url) => url === active.id);
      const newIndex = formData.images.findIndex((url) => url === over.id);

      const newImages = arrayMove(formData.images, oldIndex, newIndex);
      updateFormData({ images: newImages });

      toast({
        title: 'Images reordered',
        description: newIndex === 0 ? 'New cover photo set!' : 'Image order updated',
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload only image files',
          variant: 'destructive'
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Images must be under 5MB',
          variant: 'destructive'
        });
        continue;
      }

      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('package-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        toast({
          title: 'Upload failed',
          description: error.message,
          variant: 'destructive'
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('package-images')
        .getPublicUrl(data.path);

      newImages.push(urlData.publicUrl);
    }

    if (newImages.length > 0) {
      updateFormData({ images: [...formData.images, ...newImages] });
      toast({
        title: 'Images uploaded!',
        description: `${newImages.length} image(s) added`
      });
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = formData.images[index];
    
    // Extract path from URL to delete from storage
    try {
      const urlParts = new URL(imageUrl);
      const pathMatch = urlParts.pathname.match(/\/package-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('package-images')
          .remove([pathMatch[1]]);
      }
    } catch (e) {
      console.error('Failed to delete image from storage:', e);
    }

    updateFormData({ images: formData.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Add photos of your work</h3>
        <p className="text-muted-foreground text-sm">
          High-quality images help customers understand what you offer. Upload up to 10 photos.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          uploading ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || formData.images.length >= 10}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Drag & drop or click to upload</p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WEBP up to 5MB each • {10 - formData.images.length} remaining
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={formData.images.length >= 10}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>
        )}
      </div>

      {/* Image Grid with Drag & Drop */}
      {formData.images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Uploaded Images ({formData.images.length}/10)</Label>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Drag to reorder</span>
            </div>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={formData.images} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <SortableImage
                    key={url}
                    id={url}
                    url={url}
                    index={index}
                    onRemove={() => removeImage(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <p className="text-xs text-muted-foreground">
            The first image will be used as the cover photo. Drag images to change the order.
          </p>
        </div>
      )}
    </div>
  );
}
