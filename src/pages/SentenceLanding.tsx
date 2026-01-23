import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceBuilder } from '@/components/landing/SentenceBuilder';
import { RevealButton } from '@/components/landing/RevealButton';

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
      {/* Subtle background gradient on interaction */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isComplete ? 0.03 : 0,
          background: 'radial-gradient(ellipse at center, hsl(0 0% 0%) 0%, transparent 70%)'
        }}
        transition={{ duration: 0.8 }}
      />

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

      {/* Minimal footer */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-sm text-muted-foreground">
          EventPro by Vendibook
        </p>
      </motion.div>
    </div>
  );
}
