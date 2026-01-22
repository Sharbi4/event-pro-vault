import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Grid3X3, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageGalleryProps {
  images: string[];
  coverImage?: string | null;
  packageName: string;
}

export function PackageGallery({ images, coverImage, packageName }: PackageGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine cover image with other images, removing duplicates
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images;

  if (allImages.length === 0) {
    return (
      <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="relative rounded-xl overflow-hidden">
        {allImages.length === 1 ? (
          // Single image
          <div className="aspect-[16/9] md:aspect-[21/9]">
            <img
              src={allImages[0]}
              alt={packageName}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setShowAllPhotos(true)}
            />
          </div>
        ) : allImages.length === 2 ? (
          // Two images side by side
          <div className="grid grid-cols-2 gap-1 aspect-[16/9] md:aspect-[21/9]">
            {allImages.slice(0, 2).map((img, i) => (
              <div key={i} className="relative overflow-hidden">
                <img
                  src={img}
                  alt={`${packageName} ${i + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => { setCurrentIndex(i); setShowAllPhotos(true); }}
                />
              </div>
            ))}
          </div>
        ) : (
          // 3+ images: hero + grid
          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-1 aspect-[16/9] md:aspect-[21/9]">
            {/* Main image */}
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden">
              <img
                src={allImages[0]}
                alt={packageName}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => { setCurrentIndex(0); setShowAllPhotos(true); }}
              />
            </div>
            {/* Secondary images */}
            {allImages.slice(1, 5).map((img, i) => (
              <div key={i} className={cn(
                "relative overflow-hidden hidden md:block",
                i === 3 && allImages.length > 5 && "relative"
              )}>
                <img
                  src={img}
                  alt={`${packageName} ${i + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => { setCurrentIndex(i + 1); setShowAllPhotos(true); }}
                />
                {i === 3 && allImages.length > 5 && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <span className="text-white font-semibold">+{allImages.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show all photos button */}
        {allImages.length > 1 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 gap-2 shadow-lg"
            onClick={() => setShowAllPhotos(true)}
          >
            <Grid3X3 className="w-4 h-4" />
            Show all {allImages.length} photos
          </Button>
        )}
      </div>

      {/* Full Screen Gallery Modal */}
      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95">
          <DialogTitle className="sr-only">Photo gallery for {packageName}</DialogTitle>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setShowAllPhotos(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 text-white/80 text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Main image */}
          <div className="flex items-center justify-center h-full px-16">
            <img
              src={allImages[currentIndex]}
              alt={`${packageName} ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={cn(
                  "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                  i === currentIndex 
                    ? "border-white opacity-100" 
                    : "border-transparent opacity-60 hover:opacity-100"
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
