import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, TrendingUp, Star, DollarSign, Users
} from 'lucide-react';

const stats = [
  { label: 'Revenue', value: '$4.2k', icon: DollarSign },
  { label: 'Bookings', value: '23', icon: Calendar },
  { label: 'Rating', value: '4.9', icon: Star },
];

const bookings = [
  { title: 'Wedding DJ', amount: '$600', color: 'primary' },
  { title: 'Corporate Event', amount: '$1,200', color: 'trust' },
  { title: 'Birthday Party', amount: '$350', color: 'accent' },
];

export default function MobileDashboardPreview() {
  const [activeBooking, setActiveBooking] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBooking((prev) => (prev + 1) % bookings.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Compact Stats Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-secondary/30 rounded-xl border border-border/30 backdrop-blur-sm mb-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className="flex items-center gap-2 flex-1"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Animated Booking Ticker */}
      <div className="relative h-10 overflow-hidden rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-trust/5 border border-border/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBooking}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-between px-3"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${bookings[activeBooking].color} animate-pulse`} />
              <span className="text-xs font-medium text-foreground">
                {bookings[activeBooking].title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {bookings[activeBooking].amount}
              </span>
              <TrendingUp className="w-3 h-3 text-trust" />
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress dots */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {bookings.map((_, idx) => (
            <div
              key={idx}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                idx === activeBooking ? 'bg-primary w-3' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-[11px] text-muted-foreground mt-2"
      >
        Join 1,000+ pros managing their bookings
      </motion.p>
    </motion.div>
  );
}
