import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaUploadGrid } from '@/components/vendor-dashboard/package-form/MediaUploadGrid';
import { MarketOnboardingState, MediaItem } from '@/hooks/useMarketSpaceOnboarding';
import { Camera, ImageIcon, Video, Info } from 'lucide-react';

interface StepMediaProps {
  state: MarketOnboardingState;
  updateState: <K extends keyof MarketOnboardingState>(key: K, value: MarketOnboardingState[K]) => void;
  onSave: () => void;
}

export function StepMedia({ state, updateState, onSave }: StepMediaProps) {
  const handleImagesChange = (images: string[]) => {
    const newMediaItems: MediaItem[] = images.map(url => ({
      url,
      type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image',
    }));
    updateState('mediaItems', newMediaItems);
    
    // Set cover image to first image if not set
    if (images.length > 0 && !state.coverImageUrl) {
      updateState('coverImageUrl', images[0]);
    }
  };

  const imageUrls = state.mediaItems.map(m => m.url);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Photos & Videos
        </h2>
        <p className="text-sm text-muted-foreground">
          Show Event Pros what your market looks like. Great photos attract more Event Pros!
        </p>
      </div>

      {/* Tips Card */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Tips for great photos</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Show the overall market atmosphere and layout</li>
              <li>• Include photos of Event Pro booths and stalls</li>
              <li>• Capture the crowd and customer activity</li>
              <li>• Add photos of parking and entrance areas</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Requirements */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Minimum 1 photo required
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Videos supported
          </span>
        </div>
      </div>

      {/* Upload Grid */}
      <MediaUploadGrid
        images={imageUrls}
        onImagesChange={handleImagesChange}
        maxItems={20}
      />

      {/* Current count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {state.mediaItems.length} of 20 items uploaded
        </span>
        {state.mediaItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={onSave}>
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
