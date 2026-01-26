import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Calendar, CreditCard, TrendingUp, Bell, 
  DollarSign, Users, Star, CheckCircle2
} from 'lucide-react';

const bookings = [
  {
    id: 1,
    title: 'Wedding DJ Package',
    date: 'Saturday, Feb 15',
    time: '6:00 PM',
    amount: '$600',
    icon: Calendar,
    color: 'primary',
  },
  {
    id: 2,
    title: 'Corporate Event',
    date: 'Friday, Feb 21',
    time: '2:00 PM',
    amount: '$1,200',
    icon: CreditCard,
    color: 'trust',
  },
  {
    id: 3,
    title: 'Birthday Party',
    date: 'Sunday, Feb 23',
    time: '4:00 PM',
    amount: '$350',
    icon: Users,
    color: 'accent',
  },
];

const stats = [
  { label: 'This Month', endValue: 4280, prefix: '$', trend: '+12%' },
  { label: 'Bookings', endValue: 23, prefix: '', trend: '+8%' },
  { label: 'Rating', endValue: 4.9, prefix: '', trend: '★', isDecimal: true },
];

function AnimatedCounter({ 
  endValue, 
  prefix = '', 
  duration = 2000,
  isDecimal = false 
}: { 
  endValue: number; 
  prefix?: string; 
  duration?: number;
  isDecimal?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = easeOutQuart * endValue;
      
      setCount(isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration, isDecimal]);

  return <span>{prefix}{isDecimal ? count.toFixed(1) : count.toLocaleString()}</span>;
}

export default function AnimatedDashboardPreview() {
  const [activeBooking, setActiveBooking] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Cycle through bookings
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBooking((prev) => (prev + 1) % bookings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show notification periodically
  useEffect(() => {
    const timeout = setTimeout(() => setShowNotification(true), 2000);
    const interval = setInterval(() => {
      setShowNotification(false);
      setTimeout(() => setShowNotification(true), 500);
    }, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative">
      {/* Notification Badge */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            className="absolute -right-2 -top-2 z-20"
          >
            <div className="bg-trust text-trust-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
              <Bell className="w-3 h-3" />
              <span>New booking request!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card variant="glass" className="p-6 border-border/30 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Pro Dashboard</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-trust">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Pro</span>
          </div>
        </motion.div>

        {/* Animated Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.15 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter 
                  endValue={stat.endValue} 
                  prefix={stat.prefix}
                  duration={2000 + idx * 300}
                  isDecimal={stat.isDecimal}
                />
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + idx * 0.2 }}
                  className="text-xs text-trust font-medium"
                >
                  {stat.trend}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated Booking Cards */}
        <div className="space-y-3 relative h-[140px]">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, idx) => {
              const isActive = idx === activeBooking;
              const isPrev = idx === (activeBooking - 1 + bookings.length) % bookings.length;
              const Icon = booking.icon;
              
              if (!isActive && !isPrev) return null;

              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 60,
                    scale: isActive ? 1 : 0.95,
                    zIndex: isActive ? 10 : 0,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  className="absolute inset-x-0"
                >
                  <div className={`flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50 ${
                    isActive ? 'shadow-lg' : ''
                  }`}>
                    <motion.div 
                      className={`w-10 h-10 rounded-lg bg-${booking.color}/10 flex items-center justify-center`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Icon className={`w-5 h-5 text-${booking.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{booking.title}</p>
                      <p className="text-xs text-muted-foreground">{booking.date} • {booking.time}</p>
                    </div>
                    <motion.span 
                      className="text-sm font-semibold text-foreground"
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {booking.amount}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-1.5 mt-4">
          {bookings.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === activeBooking ? 'bg-primary w-6' : 'bg-border w-1.5'
              }`}
              animate={idx === activeBooking ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-trust" />
            <span>Revenue up <span className="text-trust font-medium">12%</span> this month</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">$2,140 pending</span>
          </div>
        </motion.div>
      </Card>

      {/* Floating Growth Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.5, type: 'spring' }}
        className="absolute -right-4 bottom-8"
      >
        <div className="bg-gradient-to-r from-trust to-trust/80 text-trust-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Growing 12% this month
        </div>
      </motion.div>
    </div>
  );
}
