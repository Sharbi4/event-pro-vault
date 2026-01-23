import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MasonryGalleryProps {
  images: string[];
  coverImage?: string | null;
  packageName: string;
}

export function MasonryGallery({ images, coverImage, packageName }: MasonryGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine cover image with other images, removing duplicates
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images;

  if (allImages.length === 0) {
    return (
      <div className="aspect-video bg-secondary rounded-3xl flex items-center justify-center">
        <p className="text-muted-foreground">No photos available</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Masonry pattern for varying heights
  const getImageHeight = (index: number) => {
    const pattern = ['tall', 'short', 'medium', 'short', 'tall', 'medium'];
    const heights = {
      tall: 'row-span-2',
      medium: 'row-span-1',
      short: 'row-span-1',
    };
    return heights[pattern[index % pattern.length] as keyof typeof heights];
  };

  return (
    <>
      {/* Masonry Grid */}
      <div className="grid grid-cols-2 auto-rows-[180px] gap-3">
        {allImages.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn(
              "relative overflow-hidden rounded-2xl cursor-pointer group",
              index === 0 ? "col-span-2 row-span-2" : getImageHeight(index)
            )}
            onClick={() => {
              setCurrentIndex(index);
              setLightboxOpen(true);
            }}
          >
            <img
              src={img}
              alt={`${packageName} ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95">
          <DialogTitle className="sr-only">Photo gallery for {packageName}</DialogTitle>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 text-white/80 text-sm font-medium">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Main image */}
          <div className="flex items-center justify-center h-full px-16">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={allImages[currentIndex]}
              alt={`${packageName} ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={cn(
                  "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all",
                  i === currentIndex 
                    ? "ring-2 ring-white opacity-100" 
                    : "opacity-50 hover:opacity-80"
                )}
                onClick={() => setCurrentIndex(i)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
