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

      {/* Logo - Top Left with Glass Backing */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg">
          <img 
            src={logo} 
            alt="Event Pro" 
            className="h-10 w-auto"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-foreground text-lg">
              Event Pro
            </span>
            <span className="text-muted-foreground text-xs">
              by Vendibook
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
