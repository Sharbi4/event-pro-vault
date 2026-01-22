import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Video, Upload, Loader2, X, GripVertical, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaUploadGridProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxItems?: number;
}

// Sortable media item component
function SortableMediaItem({ 
  id, 
  url, 
  type, 
  index, 
  onRemove 
}: { 
  id: string; 
  url: string; 
  type: 'image' | 'video';
  index: number; 
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-xl overflow-hidden bg-muted ${
        isDragging ? 'z-50 shadow-2xl ring-2 ring-primary scale-105' : ''
      }`}
    >
      {type === 'video' ? (
        <div className="relative w-full h-full">
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={url}
          alt={`Media ${index + 1}`}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <GripVertical className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Cover badge */}
      {index === 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md font-medium shadow-lg">
          Cover
        </div>
      )}

      {/* Type indicator */}
      {type === 'video' && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md font-medium">
          Video
        </div>
      )}

      {/* Position number */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs flex items-center justify-center font-medium group-hover:opacity-0 transition-opacity">
        {index + 1}
      </div>
    </div>
  );
}

export function MediaUploadGrid({ images, onImagesChange, maxItems = 10 }: MediaUploadGridProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((url) => url === active.id);
      const newIndex = images.findIndex((url) => url === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      onImagesChange(newImages);

      toast({
        title: newIndex === 0 ? 'Cover photo updated' : 'Media reordered',
        description: newIndex === 0 ? 'New cover photo set!' : 'Media order updated',
      });
    }
  };

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ? 'video' : 'image';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    setUploadProgress(0);
    const newMedia: string[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload only images or videos',
          variant: 'destructive'
        });
        continue;
      }

      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: isVideo ? 'Videos must be under 50MB' : 'Images must be under 5MB',
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

      newMedia.push(urlData.publicUrl);
      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    if (newMedia.length > 0) {
      onImagesChange([...images, ...newMedia]);
      toast({
        title: 'Upload complete!',
        description: `${newMedia.length} file(s) added`
      });
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = async (index: number) => {
    const mediaUrl = images[index];
    
    try {
      const urlParts = new URL(mediaUrl);
      const pathMatch = urlParts.pathname.match(/\/package-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('package-images')
          .remove([pathMatch[1]]);
      }
    } catch (e) {
      console.error('Failed to delete from storage:', e);
    }

    onImagesChange(images.filter((_, i) => i !== index));
  };

  const remaining = maxItems - images.length;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || remaining <= 0}
      />

      {/* Upload area - compact on mobile */}
      <div
        onClick={() => !uploading && remaining > 0 && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all cursor-pointer ${
          uploading 
            ? 'border-primary bg-primary/5 cursor-wait' 
            : remaining <= 0
            ? 'border-muted bg-muted/50 cursor-not-allowed opacity-60'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ImagePlus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-sm">Add Photos</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-sm">Add Video</p>
                <p className="text-xs text-muted-foreground">MP4, MOV up to 50MB</p>
              </div>
            </div>

            {/* Mobile text */}
            <div className="sm:hidden text-center">
              <p className="font-medium text-sm">Add Photos or Video</p>
              <p className="text-xs text-muted-foreground">{remaining} slots remaining</p>
            </div>
          </div>
        )}
      </div>

      {/* Media grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
              {images.map((url, index) => (
                <SortableMediaItem
                  key={url}
                  id={url}
                  url={url}
                  type={getMediaType(url)}
                  index={index}
                  onRemove={() => removeMedia(index)}
                />
              ))}
              
              {/* Add more button */}
              {remaining > 0 && !uploading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+{remaining}</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        {images.length === 0 
          ? 'Upload photos and videos to showcase your work'
          : 'Drag to reorder • First item is cover'}
      </p>
    </div>
  );
}
