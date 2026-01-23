import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceBuilder } from '@/components/landing/SentenceBuilder';
import { RevealButton } from '@/components/landing/RevealButton';
import { BackgroundSlideshow } from '@/components/landing/BackgroundSlideshow';
import logo from '@/assets/eventpro-logo.png';

export default function SentenceLanding() {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const complete = Boolean(eventType && location && date);
    setIsComplete(complete);
  }, [eventType, location, date]);

  const handleReveal = () => {
    const params = new URLSearchParams();
    if (eventType) params.set('event', eventType);
    if (location) params.set('location', location);
    if (date) params.set('date', date.toISOString().split('T')[0]);
    
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Cinematic Background Slideshow */}
      <BackgroundSlideshow isComplete={isComplete} interval={7000} />

      {/* Main content */}
      <motion.div 
        className="relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The Sentence */}
        <div className="text-center mb-16">
          <SentenceBuilder
            eventType={eventType}
            location={location}
            date={date}
            onEventTypeChange={setEventType}
            onLocationChange={setLocation}
            onDateChange={setDate}
          />
        </div>

        {/* Reveal Button - fades in when complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <RevealButton onClick={handleReveal} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Logo - Top Left, Clean (no background) */}
      <motion.div 
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <img 
          src={logo} 
          alt="Event Pro" 
          className="h-22 md:h-28 w-auto"
        />
      </motion.div>

      {/* Footer - Bottom Center */}
      <motion.div 
        className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[16px] text-muted-foreground">
          by Vendibook
        </span>
      </motion.div>
    </div>
  );
}
