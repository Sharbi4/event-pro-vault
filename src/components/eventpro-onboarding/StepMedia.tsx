import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Image, 
  Video, 
  Upload, 
  X, 
  Star, 
  GripVertical,
  Loader2,
  Camera,
  Info
} from 'lucide-react';
import { MediaItem } from '@/hooks/useEventProOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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

interface StepMediaProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function StepMedia({ items, onChange }: StepMediaProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    
    const files = Array.from(e.target.files);
    const maxFiles = 10 - items.length;
    
    if (files.length > maxFiles) {
      toast.error(`You can only upload ${maxFiles} more files`);
      return;
    }

    setUploading(true);

    try {
      const newItems: MediaItem[] = [];

      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size > maxSize) {
          toast.error(`${file.name} is too large (max ${isVideo ? '50MB' : '5MB'})`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('package-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('package-images')
          .getPublicUrl(fileName);

        newItems.push({
          id: fileName,
          url: publicUrl,
          type: isVideo ? 'video' : 'image',
          isCover: items.length === 0 && newItems.length === 0,
        });
      }

      onChange([...items, ...newItems]);
      toast.success(`${newItems.length} file(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    try {
      await supabase.storage
        .from('package-images')
        .remove([id]);

      const newItems = items.filter(i => i.id !== id);
      
      // If deleted item was cover, make first remaining image the cover
      if (item.isCover && newItems.length > 0) {
        const firstImage = newItems.find(i => i.type === 'image');
        if (firstImage) {
          firstImage.isCover = true;
        }
      }

      onChange(newItems);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleSetCover = (id: string) => {
    onChange(items.map(item => ({
      ...item,
      isCover: item.id === id,
    })));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, caption } : item
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const imageCount = items.filter(i => i.type === 'image').length;
  const videoCount = items.filter(i => i.type === 'video').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Show off your work
        </h2>
        <p className="text-muted-foreground text-sm">
          Upload photos and videos that showcase your services
        </p>
      </div>

      {/* Guidelines */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Tips for great media:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Upload at least 3 photos for best results</li>
                <li>Set a cover photo that represents your brand</li>
                <li>Include action shots from real events</li>
                <li>Keep videos under 30 seconds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Image className="w-4 h-4 text-muted-foreground" />
                <span>{imageCount} photos</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Video className="w-4 h-4 text-muted-foreground" />
                <span>{videoCount} videos</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {items.length}/10 files
            </span>
          </div>

          {/* Upload Button */}
          <label className={cn(
            'flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all',
            'hover:border-primary/50 hover:bg-primary/5',
            items.length >= 10 && 'opacity-50 cursor-not-allowed'
          )}>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={items.length >= 10 || uploading}
            />
            {uploading ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="text-center">
              <p className="font-medium">
                {uploading ? 'Uploading...' : 'Click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Photos (5MB max) • Videos (50MB max)
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <SortableMediaItem
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onSetCover={handleSetCover}
                  onCaptionChange={handleCaptionChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No media uploaded yet</p>
          <p className="text-xs mt-1">
            At least 1 photo required to publish your profile
          </p>
        </div>
      )}
    </div>
  );
}

function SortableMediaItem({
  item,
  onDelete,
  onSetCover,
  onCaptionChange,
}: {
  item: MediaItem;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group rounded-xl overflow-hidden bg-muted aspect-square',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {item.type === 'video' ? (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
      ) : (
        <img
          src={item.url}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded bg-white/20 hover:bg-white/30 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded bg-destructive/80 hover:bg-destructive"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2">
          {item.type === 'image' && (
            <button
              onClick={() => onSetCover(item.id)}
              className={cn(
                'w-full py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all',
                item.isCover
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              <Star className={cn('w-3 h-3', item.isCover && 'fill-current')} />
              {item.isCover ? 'Cover Photo' : 'Set as Cover'}
            </button>
          )}
          <Input
            value={item.caption || ''}
            onChange={(e) => onCaptionChange(item.id, e.target.value)}
            placeholder="Add caption..."
            className="h-8 text-xs bg-white/20 border-0 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      {/* Cover Badge */}
      {item.isCover && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Cover
        </div>
      )}

      {/* Video Badge */}
      {item.type === 'video' && (
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60">
          <Video className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
