import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import foodTruckScene from '@/assets/slideshow/food-truck-scene.jpg';

interface BackgroundSlideshowProps {
  isComplete: boolean;
  interval?: number;
}

// Fallback images if no packages found
const FALLBACK_IMAGES = [
  foodTruckScene,
  'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1920&q=80', // Taco truck serving
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80', // Food truck festival
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80', // Gourmet food platter
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=80', // Pizza close-up
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&q=80', // Gourmet food spread
];

export function BackgroundSlideshow({ isComplete, interval = 7000 }: BackgroundSlideshowProps) {
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch package images from database
  useEffect(() => {
    async function fetchImages() {
      try {
        const { data: packages } = await supabase
          .from('vendor_packages')
          .select('images, cover_image_url')
          .eq('is_active', true)
          .limit(20);

        if (packages && packages.length > 0) {
          const allImages: string[] = [];
          
          packages.forEach(pkg => {
            if (pkg.cover_image_url) {
              allImages.push(pkg.cover_image_url);
            }
            if (pkg.images && Array.isArray(pkg.images)) {
              allImages.push(...pkg.images.slice(0, 2));
            }
          });

          // Deduplicate and limit
          const uniqueImages = [...new Set(allImages)].slice(0, 10);
          if (uniqueImages.length >= 3) {
            setImages(uniqueImages);
          }
        }
      } catch (error) {
        console.error('Error fetching slideshow images:', error);
      }
    }

    fetchImages();
  }, []);

  // Cycle through images
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setNextIndex(prev => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 1000); // Transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  // Ken Burns animation variants
  const kenBurnsVariants = {
    initial: { 
      scale: 1,
      opacity: 0 
    },
    animate: { 
      scale: 1.15,
      opacity: 1,
      transition: { 
        scale: { duration: interval / 1000 + 1, ease: 'linear' },
        opacity: { duration: 1, ease: 'easeIn' }
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 1, ease: 'easeOut' }
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Current image layer */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          variants={kenBurnsVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <img 
            src={images[currentIndex]}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Base overlay - warm tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/30 to-background/50" />
      
      {/* Dynamic blur layer - increases as user completes form */}
      <motion.div 
        className="absolute inset-0"
        initial={{ backdropFilter: 'blur(4px)' }}
        animate={{ 
          backdropFilter: isComplete ? 'blur(16px)' : 'blur(4px)',
          backgroundColor: isComplete ? 'hsla(var(--background) / 0.6)' : 'hsla(var(--background) / 0.35)'
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Gradient vignette for text readability */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/30" />
    </div>
  );
}
