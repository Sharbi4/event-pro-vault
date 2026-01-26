import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { DeckCard } from '@/components/deck/DeckCard';
import { DeckNavigation } from '@/components/deck/DeckNavigation';
import { SpatialDrawer } from '@/components/booking/SpatialDrawer';
import ResultsOverlay from '@/components/deck/ResultsOverlay';
import { useBrowsePackages } from '@/hooks/useBrowsePackages';

// Map event types to categories for filtering
const EVENT_TO_CATEGORY: Record<string, string> = {
  'Wedding': 'Wedding',
  'Corporate Event': 'Corporate',
  'Birthday Party': 'Birthday',
  'Baby Shower': 'Baby Shower',
  'Anniversary': 'Anniversary',
  'Graduation': 'Graduation',
  'Holiday Party': 'Holiday',
  'Other': '',
};

export default function PackageDeck() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [resultsOverlayOpen, setResultsOverlayOpen] = useState(false);

  // Get search params from sentence landing
  const eventType = searchParams.get('event') || '';
  const location = searchParams.get('location') || '';
  const dateStr = searchParams.get('date') || '';
  const date = dateStr ? new Date(dateStr) : undefined;

  const { packages, loading: isLoading, updateFilter } = useBrowsePackages();

  // Apply URL filters on mount
  useEffect(() => {
    if (filtersApplied) return;
    
    // Apply location filter
    if (location) {
      updateFilter('location', location);
    }
    
    // Apply date filter
    if (dateStr) {
      updateFilter('date', dateStr);
    }
    
    // Map event type to category
    if (eventType && EVENT_TO_CATEGORY[eventType]) {
      updateFilter('category', EVENT_TO_CATEGORY[eventType]);
    }
    
    setFiltersApplied(true);
  }, [eventType, location, dateStr, updateFilter, filtersApplied]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, packages]);

  const navigateNext = () => {
    if (activeIndex < packages.length - 1) {
      setActiveIndex(prev => prev + 1);
      scrollToIndex(activeIndex + 1);
    }
  };

  const navigatePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      scrollToIndex(activeIndex - 1);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const handleSecure = (pkg: any) => {
    // Transform package data to match drawer expectations
    setSelectedPackage({
      ...pkg,
      pricing_type: pkg.type?.toLowerCase(),
      booking_mode: pkg.instant_book ? 'INSTANT' : 'REQUEST',
      min_hours: pkg.min_units || 1,
      vendor_user_id: pkg.vendor_user_id,
      payment_options: 'BOTH', // Allow both payment methods
      vendor: {
        display_name: pkg.vendor_name,
        avatar_url: pkg.vendor_avatar,
        is_verified: pkg.is_verified,
        stripe_account_status: pkg.is_verified ? 'active' : 'pending',
      }
    });
    setDrawerOpen(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-2 border-foreground border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header with search context */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* See Results Button */}
          <button
            onClick={() => setResultsOverlayOpen(true)}
            className="glass-panel px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>See Results</span>
            <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
              {packages.length}
            </span>
          </button>

          {/* Search context pill */}
          <div className="hidden md:flex glass-panel px-4 py-2 rounded-full text-sm">
            <span className="text-muted-foreground">{eventType || 'All events'}</span>
            {location && <span className="text-muted-foreground"> in {location}</span>}
            {date && <span className="text-muted-foreground"> on {date.toLocaleDateString()}</span>}
          </div>
        </div>
      </motion.header>

      {/* Horizontal Deck */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x-mandatory overflow-x-auto scrollbar-hide h-screen"
      >
        <AnimatePresence mode="wait">
          {packages.map((pkg, index) => (
            <DeckCard
              key={pkg.id}
              package={pkg}
              isActive={index === activeIndex}
              onSecure={() => handleSecure(pkg)}
              eventDate={date}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {packages.length === 0 && (
          <div className="min-w-full h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">No matches found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria
              </p>
              <button 
                onClick={handleBack}
                className="px-6 py-3 bg-foreground text-background rounded-full font-medium"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows (desktop) */}
      {packages.length > 1 && (
        <>
          <button
            onClick={navigatePrev}
            disabled={activeIndex === 0}
            className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={navigateNext}
            disabled={activeIndex === packages.length - 1}
            className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation dots */}
      {packages.length > 1 && (
        <DeckNavigation
          total={packages.length}
          active={activeIndex}
          onChange={(index) => {
            setActiveIndex(index);
            scrollToIndex(index);
          }}
        />
      )}

      {/* Booking Drawer */}
      <SpatialDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        package={selectedPackage}
        eventDate={date}
      />

      {/* Results Overlay */}
      <ResultsOverlay
        open={resultsOverlayOpen}
        onClose={() => setResultsOverlayOpen(false)}
        packages={packages}
        location={location}
        date={date}
        activeIndex={activeIndex}
        onSelectPackage={(index) => {
          setActiveIndex(index);
          scrollToIndex(index);
        }}
      />
    </div>
  );
}
