import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ChevronLeft, MapPin, Calendar, Clock, Star, Users, 
  DollarSign, Share2, Heart, Info, Shield, Tent, 
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useMarketDetail, SlotType, InventoryItem } from '@/hooks/useMarketDetail';
import { SlotTypeCard } from '@/components/markets/SlotTypeCard';
import { InventoryPicker } from '@/components/markets/InventoryPicker';
import { BookingPanel } from '@/components/markets/BookingPanel';
import { useFavorites } from '@/hooks/useFavorites';
import { useIsMobile } from '@/hooks/use-mobile';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MarketDetail() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const {
    market,
    slotTypes,
    inventory,
    loading,
    error,
    bookingInProgress,
    nextAvailable,
    minPrice,
    totalSlotsRemaining,
    bookSlot,
  } = useMarketDetail(id);

  const [selectedSlotType, setSelectedSlotType] = useState<SlotType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>();

  // Get selected inventory item
  const selectedInventory = useMemo(() => {
    if (!selectedInventoryId) return null;
    return inventory.find(inv => inv.id === selectedInventoryId) || null;
  }, [inventory, selectedInventoryId]);

  // Filter inventory for selected slot type
  const filteredInventory = useMemo(() => {
    if (!selectedSlotType) return inventory;
    return inventory.filter(inv => inv.slotTypeId === selectedSlotType.id);
  }, [inventory, selectedSlotType]);

  // Get available count for each slot type
  const slotTypeAvailability = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(inv => {
      counts[inv.slotTypeId] = (counts[inv.slotTypeId] || 0) + inv.slotsRemaining;
    });
    return counts;
  }, [inventory]);

  // Handle slot type selection
  const handleSelectSlotType = (st: SlotType) => {
    setSelectedSlotType(st);
    setSelectedDate(undefined);
    setSelectedInventoryId(undefined);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedInventoryId(undefined);
    
    // Auto-select first available time window for the date
    if (date && selectedSlotType) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const available = filteredInventory.find(
        inv => inv.date === dateStr && inv.slotsRemaining > 0
      );
      if (available) {
        setSelectedInventoryId(available.id);
      }
    }
  };

  // Format time helper
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[40vh] w-full rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !market) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Market not found</h1>
          <p className="text-muted-foreground mb-6">{error || "This market doesn't exist or isn't published."}</p>
          <Link to="/markets">
            <Button variant="gradient">Browse Markets</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Get cover image and gallery
  const coverImage = market.coverImageUrl || market.mediaItems[0]?.url;
  const galleryImages = market.mediaItems.filter(m => m.type === 'image').slice(0, 4);

  // Get schedule summary
  const scheduleDays = market.weeklySchedule
    .filter(d => d.isEnabled)
    .map(d => dayNames[d.dayOfWeek]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {coverImage ? (
          <img
            src={coverImage}
            alt={market.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tent className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-24 left-4 lg:left-8">
          <Link to="/markets">
            <Button variant="glass" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-24 right-4 lg:right-8 flex gap-2">
          <Button variant="glass" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="glass" 
            size="icon"
            onClick={() => id && toggleFavorite(id)}
            className={isFavorite(id || '') ? 'text-trust' : ''}
          >
            <Heart className={`w-4 h-4 ${isFavorite(id || '') ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Market Header Card */}
        <Card variant="glass" className="p-6 mb-8">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gradient">{market.marketType}</Badge>
                {market.bookingsEnabled && (
                  <Badge variant="trust" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Bookings Open
                  </Badge>
                )}
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {market.name}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{market.city}, {market.state}</span>
                {market.formattedAddress && (
                  <span className="hidden md:inline">• {market.formattedAddress}</span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {nextAvailable && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Next: {format(parseISO(nextAvailable.date), 'EEE, MMM d')}</span>
                  </div>
                )}
                {totalSlotsRemaining > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-trust" />
                    <span className="text-trust font-medium">{totalSlotsRemaining} spots left</span>
                  </div>
                )}
                {minPrice && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>From <span className="font-semibold">${minPrice}</span>/spot</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-trust fill-trust" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">(24 reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mt-4 leading-relaxed">
            {market.description}
          </p>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 pb-32 lg:pb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Details Accordion */}
            <Card variant="glass">
              <Accordion type="multiple" defaultValue={['details', 'schedule']} className="px-6">
                <AccordionItem value="details">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Market Details
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {market.crowdDescription && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Crowd & Audience</p>
                        <p className="text-sm text-muted-foreground">{market.crowdDescription}</p>
                      </div>
                    )}
                    
                    {market.categoriesAllowed.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Vendor Categories Allowed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {market.categoriesAllowed.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {market.operatingSeason === 'seasonal' && market.seasonalMonths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Operating Season</p>
                        <p className="text-sm text-muted-foreground">
                          Seasonal: {market.seasonalMonths.join(', ')}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="schedule">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Schedule & Setup
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {scheduleDays.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Regular Schedule</p>
                        <div className="space-y-1">
                          {market.weeklySchedule.filter(d => d.isEnabled).map(day => (
                            <div key={day.dayOfWeek} className="flex items-center justify-between text-sm">
                              <span>{dayNames[day.dayOfWeek]}</span>
                              <span className="text-muted-foreground">
                                {formatTime(day.startTime)} – {formatTime(day.endTime)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Setup Window</p>
                        <p className="text-sm text-muted-foreground">
                          {market.setupWindowMinutes} minutes before
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Breakdown Window</p>
                        <p className="text-sm text-muted-foreground">
                          {market.breakdownWindowMinutes} minutes after
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            {/* Slot Types */}
            <Card variant="glass" className="p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Tent className="w-5 h-5" />
                Available Slot Types
              </h2>
              
              {slotTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No slot types available</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {slotTypes.map(st => (
                    <SlotTypeCard
                      key={st.id}
                      slotType={st}
                      isSelected={selectedSlotType?.id === st.id}
                      onSelect={() => handleSelectSlotType(st)}
                      availableCount={slotTypeAvailability[st.id] || 0}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Inventory Picker */}
            <Card variant="glass" className="p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date & Time
              </h2>
              
              <InventoryPicker
                inventory={filteredInventory}
                slotType={selectedSlotType}
                selectedDate={selectedDate}
                selectedInventoryId={selectedInventoryId}
                onDateSelect={handleDateSelect}
                onInventorySelect={setSelectedInventoryId}
              />
            </Card>

            {/* Gallery */}
            {galleryImages.length > 1 && (
              <Card variant="glass" className="p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={img.id || idx} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Panel (Desktop) */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <BookingPanel
                marketName={market.name}
                slotType={selectedSlotType}
                inventoryItem={selectedInventory}
                bookingsEnabled={market.bookingsEnabled}
                bookingInProgress={bookingInProgress}
                onBook={bookSlot}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Booking CTA */}
      {isMobile && (
        <BookingPanel
          marketName={market.name}
          slotType={selectedSlotType}
          inventoryItem={selectedInventory}
          bookingsEnabled={market.bookingsEnabled}
          bookingInProgress={bookingInProgress}
          onBook={bookSlot}
          isMobile
        />
      )}
    </Layout>
  );
}
