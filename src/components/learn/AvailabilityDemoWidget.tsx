import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, Search, Star, MapPin, 
  Music, Camera, UtensilsCrossed, Sparkles,
  CheckCircle
} from 'lucide-react';

const demoPackages = [
  {
    id: 1,
    name: 'Wedding DJ Package',
    provider: 'DJ Marcus',
    price: '$150/hr',
    rating: 4.9,
    icon: Music,
    available: true,
    availableTimes: ['morning', 'afternoon'],
  },
  {
    id: 2,
    name: 'Event Photography',
    provider: 'Sarah Chen',
    price: '$200/hr',
    rating: 5.0,
    icon: Camera,
    available: true,
    availableTimes: ['morning', 'afternoon', 'evening'],
  },
  {
    id: 3,
    name: 'Catering Service',
    provider: 'Gourmet Events',
    price: '$45/guest',
    rating: 4.8,
    icon: UtensilsCrossed,
    available: true,
    availableTimes: ['afternoon', 'evening'],
  },
  {
    id: 4,
    name: 'Balloon Decor',
    provider: 'Party Studio',
    price: '$350',
    rating: 4.7,
    icon: Sparkles,
    available: true,
    availableTimes: ['morning'],
  },
];

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '9AM - 12PM' },
  { id: 'afternoon', label: 'Afternoon', time: '1PM - 5PM' },
  { id: 'evening', label: 'Evening', time: '6PM - 10PM' },
];

const demoSteps = [
  { label: 'Select date', delay: 0 },
  { label: 'Choose time', delay: 2000 },
  { label: 'See available', delay: 4000 },
];

export function AvailabilityDemoWidget() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visiblePackages, setVisiblePackages] = useState<typeof demoPackages>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-run demo animation
  useEffect(() => {
    const runDemo = () => {
      setIsAnimating(true);
      setCurrentStep(0);
      setSelectedDate(null);
      setSelectedTime(null);
      setVisiblePackages([]);

      // Step 1: Select date
      setTimeout(() => {
        setSelectedDate('Sat, Jan 25');
        setCurrentStep(1);
      }, 1000);

      // Step 2: Select time
      setTimeout(() => {
        setSelectedTime('afternoon');
        setCurrentStep(2);
      }, 2500);

      // Step 3: Show filtered results
      setTimeout(() => {
        const filtered = demoPackages.filter(pkg => 
          pkg.availableTimes.includes('afternoon')
        );
        // Animate packages appearing one by one
        filtered.forEach((pkg, idx) => {
          setTimeout(() => {
            setVisiblePackages(prev => [...prev, pkg]);
          }, idx * 200);
        });
        setCurrentStep(3);
      }, 3500);

      // Reset after showing results
      setTimeout(() => {
        setIsAnimating(false);
      }, 6000);
    };

    runDemo();
    const interval = setInterval(runDemo, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="gradient" className="p-6 lg:p-8 overflow-hidden">
      {/* Demo Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-trust animate-pulse" />
          <span className="text-sm font-medium text-foreground">Live Demo</span>
        </div>
        <div className="flex gap-1">
          {demoSteps.map((step, idx) => (
            <div
              key={step.label}
              className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                idx <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search Bar Mock */}
      <div className="bg-background rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Any category</span>
          </div>
          
          <div className="h-6 w-px bg-border hidden sm:block" />
          
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              selectedDate ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              selectedDate ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {selectedDate || 'Select date'}
            </span>
          </div>
          
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              selectedTime ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary/50'
            }`}
          >
            <Clock className="w-4 h-4 text-primary" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              selectedTime ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {selectedTime 
                ? timeSlots.find(t => t.id === selectedTime)?.time 
                : 'Select time'}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slot Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedTime === slot.id
                ? 'bg-primary text-primary-foreground scale-105'
                : 'bg-secondary/50 text-muted-foreground'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Results Area */}
      <div className="space-y-3 min-h-[200px]">
        {currentStep < 2 && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a date and time to see available packages</p>
            </div>
          </div>
        )}
        
        {currentStep >= 2 && visiblePackages.length === 0 && (
          <div className="flex items-center justify-center h-[200px]">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {visiblePackages.map((pkg, idx) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className="flex items-center gap-4 p-3 bg-background rounded-lg border border-border animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground text-sm truncate">{pkg.name}</h4>
                  <Badge variant="secondary" className="bg-trust/10 text-trust text-xs shrink-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pkg.provider}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground text-sm">{pkg.price}</p>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span>{pkg.rating}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      {visiblePackages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{visiblePackages.length}</span> available packages
            </span>
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Within 25 miles
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}
