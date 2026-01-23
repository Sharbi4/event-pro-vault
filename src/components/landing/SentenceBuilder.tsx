import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { LocationAutocomplete } from '@/components/browse/LocationAutocomplete';

const EVENT_TYPES = [
  'Wedding',
  'Corporate Event', 
  'Birthday Party',
  'Private Party',
  'Festival',
  'Concert',
  'Conference',
  'Other',
];

interface SentenceBuilderProps {
  eventType: string;
  location: string;
  date: Date | undefined;
  onEventTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDateChange: (value: Date | undefined) => void;
}

export function SentenceBuilder({
  eventType,
  location,
  date,
  onEventTypeChange,
  onLocationChange,
  onDateChange,
}: SentenceBuilderProps) {
  const [eventOpen, setEventOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
      <span className="text-foreground">I am planning a</span>
      
      {/* Event Type Selector */}
      <Popover open={eventOpen} onOpenChange={setEventOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-2 group">
            <span 
              className={cn(
                "border-b-2 pb-1 transition-all",
                eventType 
                  ? "text-foreground border-foreground" 
                  : "text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground"
              )}
            >
              {eventType || 'event type'}
            </span>
            <ChevronDown className={cn(
              "w-6 h-6 transition-transform text-muted-foreground",
              eventOpen && "rotate-180"
            )} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onEventTypeChange(type);
                  setEventOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  eventType === type 
                    ? "bg-foreground text-background" 
                    : "hover:bg-secondary"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <span className="text-foreground">in</span>

      {/* Location Selector */}
      <Popover open={locationOpen} onOpenChange={setLocationOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-2 group">
            <MapPin className="w-6 h-6 text-muted-foreground" />
            <span 
              className={cn(
                "border-b-2 pb-1 transition-all",
                location 
                  ? "text-foreground border-foreground" 
                  : "text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground"
              )}
            >
              {location || 'city'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <LocationAutocomplete
            value={location}
            onChange={(value) => {
              onLocationChange(value);
              setLocationOpen(false);
            }}
            placeholder="Enter city or zip code"
            className="text-base"
          />
        </PopoverContent>
      </Popover>

      <span className="text-foreground">on</span>

      {/* Date Selector */}
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-2 group">
            <Calendar className="w-6 h-6 text-muted-foreground" />
            <span 
              className={cn(
                "border-b-2 pb-1 transition-all font-mono",
                date 
                  ? "text-foreground border-foreground" 
                  : "text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground"
              )}
            >
              {date ? format(date, 'MMM d, yyyy') : 'date'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onDateChange(newDate);
              setDateOpen(false);
            }}
            disabled={(date) => date < new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-foreground">.</span>
    </div>
  );
}
