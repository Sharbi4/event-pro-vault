import { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
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
  AlertCircle, CheckCircle, AlertTriangle, TrendingUp,
  Eye, ChevronDown, Repeat
} from 'lucide-react';
import { useMarketDetail, SlotType, InventoryItem } from '@/hooks/useMarketDetail';
import { SlotTypeCard } from '@/components/markets/SlotTypeCard';
import { FomoStrip } from '@/components/markets/FomoStrip';
import { BookingStepper } from '@/components/markets/BookingStepper';
import { SocialProof } from '@/components/markets/SocialProof';
import { useFavorites } from '@/hooks/useFavorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MarketDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Calculate next inventory with remaining slots for FOMO
  const nextInventoryForSlot = useMemo(() => {
    if (!nextAvailable) return null;
    const inv = inventory.find(i => i.id === nextAvailable.id);
    return inv || nextAvailable;
  }, [nextAvailable, inventory]);

  const totalNextSlots = useMemo(() => {
    if (!nextInventoryForSlot) return 0;
    const sameDate = inventory.filter(inv => inv.date === nextInventoryForSlot.date);
    return sameDate.reduce((sum, inv) => sum + inv.totalSlots, 0);
  }, [inventory, nextInventoryForSlot]);

  const remainingNextSlots = useMemo(() => {
    if (!nextInventoryForSlot) return 0;
    const sameDate = inventory.filter(inv => inv.date === nextInventoryForSlot.date);
    return sameDate.reduce((sum, inv) => sum + inv.slotsRemaining, 0);
  }, [inventory, nextInventoryForSlot]);

  // Urgency level
  const urgencyLevel = useMemo(() => {
    if (remainingNextSlots <= 0) return 'sold-out';
    if (remainingNextSlots <= 3) return 'critical';
    if (remainingNextSlots <= 10 || (totalNextSlots > 0 && remainingNextSlots / totalNextSlots <= 0.2)) return 'high';
    return 'normal';
  }, [remainingNextSlots, totalNextSlots]);

  // Days until next market
  const daysUntil = useMemo(() => {
    if (!nextAvailable) return null;
    return differenceInDays(parseISO(nextAvailable.date), new Date());
  }, [nextAvailable]);

  // Filter inventory for selected slot type
  const slotTypeAvailability = useMemo(() => {
    const counts: Record<string, { remaining: number; total: number }> = {};
    inventory.forEach(inv => {
      if (!counts[inv.slotTypeId]) {
        counts[inv.slotTypeId] = { remaining: 0, total: 0 };
      }
      counts[inv.slotTypeId].remaining += inv.slotsRemaining;
      counts[inv.slotTypeId].total += inv.totalSlots;
    });
    return counts;
  }, [inventory]);

  // Format time helper
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Open booking stepper
  const handleOpenBooking = useCallback((slotType?: SlotType) => {
    if (slotType) setSelectedSlotType(slotType);
    setIsBookingOpen(true);
  }, []);

  // Scroll to slots section
  const scrollToSlots = useCallback(() => {
    document.getElementById('slot-types')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[50vh] w-full rounded-2xl mb-8" />
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
          <Link to="/browse?mode=markets">
            <Button variant="gradient">Browse Markets</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Get cover image and gallery
  const coverImage = market.coverImageUrl || market.mediaItems[0]?.url;
  const galleryImages = market.mediaItems.filter(m => m.type === 'image');

  // Get schedule summary
  const scheduleDays = market.weeklySchedule
    .filter(d => d.isEnabled)
    .map(d => dayNames[d.dayOfWeek]);

  // Truncate description
  const descriptionTruncated = market.description?.length > 200 
    ? market.description.slice(0, 200) + '...' 
    : market.description;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-24 left-4 lg:left-8">
          <Link to="/browse?mode=markets">
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

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
          <div className="container mx-auto">
            {/* Market Type & Status */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="gradient" className="text-sm">{market.marketType}</Badge>
              {market.bookingsEnabled && (
                <Badge variant="trust" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Bookings Open
                </Badge>
              )}
              {urgencyLevel === 'critical' && (
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Selling Fast
                </Badge>
              )}
              {urgencyLevel === 'high' && (
                <Badge variant="outline" className="gap-1 bg-trust/10 text-trust border-trust/30">
                  <TrendingUp className="w-3 h-3" />
                  High Demand
                </Badge>
              )}
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {market.name}
            </h1>

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{market.city}, {market.state}</span>
              <span className="hidden md:inline">• {market.formattedAddress}</span>
              <div className="flex items-center gap-1 ml-2">
                <Star className="w-4 h-4 text-trust fill-trust" />
                <span className="font-medium text-foreground">4.8</span>
                <span className="text-muted-foreground">(24)</span>
              </div>
            </div>

            {/* Next Market Highlight Block */}
            {nextAvailable && (
              <Card variant="glass" className="inline-block">
                <CardContent className="p-4 flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Next Market</p>
                      <p className="font-semibold text-foreground">
                        {format(parseISO(nextAvailable.date), 'EEE, MMM d')}
                        {daysUntil !== null && daysUntil <= 7 && (
                          <span className="ml-2 text-xs text-trust font-normal">
                            {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : 'This week'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className={cn(
                      "w-5 h-5",
                      urgencyLevel === 'critical' ? "text-destructive" : "text-trust"
                    )} />
                    <div>
                      <p className="text-xs text-muted-foreground">Spots Left</p>
                      <p className={cn(
                        "font-semibold",
                        urgencyLevel === 'critical' ? "text-destructive" : "text-trust"
                      )}>
                        Only {remainingNextSlots} left
                      </p>
                    </div>
                  </div>
                  
                  {minPrice && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-semibold text-foreground">${minPrice}/spot</p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="gradient" 
                    size="lg"
                    onClick={() => handleOpenBooking()}
                    className="ml-auto"
                  >
                    Reserve a Spot
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* FOMO Strip - Sticky on scroll */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <FomoStrip
            nextInventory={nextAvailable}
            totalSlots={totalNextSlots}
            slotsRemaining={remainingNextSlots}
            minPrice={minPrice}
            onReserve={() => handleOpenBooking()}
            compact={isMobile}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <Card variant="glass" className="p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                About This Market
              </h2>
              
              <div className="space-y-4">
                {/* Description */}
                {market.description && (
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      {showFullDescription ? market.description : descriptionTruncated}
                    </p>
                    {market.description.length > 200 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 -ml-3"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? 'Show less' : 'Read more'}
                        <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showFullDescription && "rotate-180")} />
                      </Button>
                    )}
                  </div>
                )}

                {/* Crowd/Audience Chips */}
                {market.crowdDescription && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Audience</p>
                    <p className="text-sm text-muted-foreground">{market.crowdDescription}</p>
                  </div>
                )}

                {/* Vendor Categories */}
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
              </div>
            </Card>

            {/* Market Details Accordion */}
            <Card variant="glass">
              <Accordion type="multiple" defaultValue={['schedule']} className="px-6">
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

                    {market.operatingSeason === 'seasonal' && market.seasonalMonths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Operating Season</p>
                        <p className="text-sm text-muted-foreground">
                          {market.seasonalMonths.join(', ')}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rules">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Rules & Requirements
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-sm text-muted-foreground">
                      Check with the market host for specific requirements regarding licenses, insurance, and permitted products.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            {/* Slot Types */}
            <div id="slot-types">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Tent className="w-5 h-5" />
                    Available Spots
                  </h2>
                  <Button variant="ghost" size="sm" onClick={scrollToSlots}>
                    <Eye className="w-4 h-4 mr-1" />
                    View all
                  </Button>
                </div>
                
                {slotTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No spot types available yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {slotTypes.map(st => {
                      const availability = slotTypeAvailability[st.id];
                      const urgency = availability 
                        ? availability.remaining <= 3 ? 'critical' 
                          : availability.remaining <= 10 || availability.remaining / availability.total <= 0.2 ? 'high' 
                          : 'normal'
                        : 'normal';
                      
                      return (
                        <div 
                          key={st.id}
                          className={cn(
                            "relative p-5 rounded-xl border cursor-pointer transition-all hover:shadow-lg",
                            urgency === 'critical' && "border-destructive/50 bg-destructive/5",
                            urgency === 'high' && "border-trust/50 bg-trust/5",
                            urgency === 'normal' && "border-border bg-card hover:border-primary/50"
                          )}
                          onClick={() => handleOpenBooking(st)}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{st.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{st.category}</Badge>
                                {st.sizePreset && (
                                  <span className="text-xs text-muted-foreground">{st.sizePreset}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-foreground">${st.price}</div>
                              <div className="text-xs text-muted-foreground">
                                {st.pricingUnit === 'per_day' ? '/day' : st.pricingUnit === 'per_event' ? '/event' : '/weekend'}
                              </div>
                            </div>
                          </div>

                          {st.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {st.amenities.slice(0, 4).map(amenity => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {st.amenities.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{st.amenities.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}

                          {availability && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {urgency === 'critical' && (
                                  <Badge variant="destructive" className="gap-1 text-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    Only {availability.remaining} left
                                  </Badge>
                                )}
                                {urgency === 'high' && (
                                  <Badge variant="trust" className="gap-1 text-xs">
                                    <TrendingUp className="w-3 h-3" />
                                    {availability.remaining} left
                                  </Badge>
                                )}
                                {urgency === 'normal' && availability.remaining > 0 && (
                                  <span className="text-sm text-trust font-medium">
                                    {availability.remaining} spots available
                                  </span>
                                )}
                                {availability.remaining <= 0 && (
                                  <Badge variant="destructive">Sold out</Badge>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                Select
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Weekly recurring callout */}
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Weekly Recurring Available</p>
                    <p className="text-xs text-muted-foreground">Reserve the same spot every week and save time</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Social Proof */}
            <Card variant="glass" className="p-6">
              <SocialProof 
                marketName={market.name}
                galleryImages={galleryImages}
              />
            </Card>
          </div>

          {/* Sidebar - Desktop Booking CTA */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <Card variant="gradient" className="sticky top-40 p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Reserve a Spot</h3>
                
                {nextAvailable && (
                  <div className="space-y-3 mb-4">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Next Available</p>
                      <p className="font-medium text-foreground">
                        {format(parseISO(nextAvailable.date), 'EEE, MMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(nextAvailable.startTime)} – {formatTime(nextAvailable.endTime)}
                      </p>
                    </div>
                    
                    <div className={cn(
                      "p-3 rounded-lg flex items-center gap-2",
                      urgencyLevel === 'critical' && "bg-destructive/10 border border-destructive/30",
                      urgencyLevel === 'high' && "bg-trust/10 border border-trust/30",
                      urgencyLevel === 'normal' && "bg-secondary/50"
                    )}>
                      <Users className={cn(
                        "w-4 h-4",
                        urgencyLevel === 'critical' && "text-destructive",
                        urgencyLevel === 'high' && "text-trust",
                        urgencyLevel === 'normal' && "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        urgencyLevel === 'critical' && "text-destructive",
                        urgencyLevel === 'high' && "text-trust",
                        urgencyLevel === 'normal' && "text-foreground"
                      )}>
                        {remainingNextSlots} of {totalNextSlots} spots left
                      </span>
                    </div>
                  </div>
                )}

                {minPrice && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">From</span>
                    <span className="text-2xl font-bold gradient-text">${minPrice}/spot</span>
                  </div>
                )}

                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="w-full"
                  disabled={!market.bookingsEnabled || totalSlotsRemaining <= 0}
                  onClick={() => handleOpenBooking()}
                >
                  {totalSlotsRemaining <= 0 ? 'Sold Out' : 'Reserve a Spot'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  12.9% booking fee applies • Weekly recurring available
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-50">
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full"
            disabled={!market.bookingsEnabled || totalSlotsRemaining <= 0}
            onClick={() => handleOpenBooking()}
          >
            {totalSlotsRemaining <= 0 ? 'Sold Out' : `Reserve a Spot — From $${minPrice || 0}`}
          </Button>
        </div>
      )}

      {/* Booking Stepper Sheet */}
      <BookingStepper
        marketId={id || ''}
        marketName={market.name}
        slotTypes={slotTypes}
        inventory={inventory}
        bookingsEnabled={market.bookingsEnabled}
        bookingInProgress={bookingInProgress}
        onBook={bookSlot}
        isOpen={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        initialSlotType={selectedSlotType}
        initialInventory={nextAvailable}
      />
    </Layout>
  );
}
