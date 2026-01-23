import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceBuilder } from '@/components/landing/SentenceBuilder';
import { RevealButton } from '@/components/landing/RevealButton';
import { BackgroundSlideshow } from '@/components/landing/BackgroundSlideshow';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/eventpro-logo.png';

export default function SentenceLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link to="/" className="block transition-transform duration-200 hover:scale-105">
          <img 
            src={logo} 
            alt="Event Pro" 
            className="h-32 md:h-40 w-auto drop-shadow-md"
          />
        </Link>
      </motion.div>

      {/* Sign In - Top Right */}
      {!user && (
        <motion.div 
          className="absolute top-6 right-6 md:top-8 md:right-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-foreground hover:bg-secondary/50"
          >
            Sign In
          </Button>
        </motion.div>
      )}

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
