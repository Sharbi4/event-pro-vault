import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Clock, Calendar, Check, Plus, Minus, 
  ChevronLeft, Zap, MapPin, AlertCircle, Star, CalendarIcon
} from 'lucide-react';
import { packages, vendors, reviews } from '@/data/vendors';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BlockedDate {
  date: string;
}

export default function PackageDetail() {
  const { id } = useParams();
  const pkg = packages.find(p => p.id === id);
  const vendor = pkg ? vendors.find(v => v.id === pkg.vendorId) : null;
  const vendorReviews = vendor ? reviews.filter(r => r.vendorId === vendor.id).slice(0, 2) : [];

  const [units, setUnits] = useState(pkg?.minUnits || 1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventLocation, setEventLocation] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  // Fetch vendor's blocked dates
  useEffect(() => {
    const fetchBlockedDates = async () => {
      if (!vendor) return;
      
      setLoadingDates(true);
      // Note: In production, you'd fetch by vendor's user_id
      // For now, we fetch all blocked dates as a demo
      const { data } = await supabase
        .from('vendor_availability')
        .select('date')
        .eq('is_blocked', true);
      
      if (data) {
        setBlockedDates(data);
      }
      setLoadingDates(false);
    };

    fetchBlockedDates();
  }, [vendor]);

  const blockedDateSet = new Set(
    blockedDates.map(b => format(new Date(b.date), 'yyyy-MM-dd'))
  );

  const isDateBlocked = (date: Date) => {
    return blockedDateSet.has(format(date, 'yyyy-MM-dd'));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isDateBlocked(date)) {
      setEventDate(date);
      setCalendarOpen(false);
    }
  };

  if (!pkg || !vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Package not found</h1>
          <Link to="/browse">
            <Button variant="gradient">Browse Vendors</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const baseTotal = pkg.price * units;
  const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
    const addOn = pkg.addOns.find(a => a.id === addOnId);
    return sum + (addOn?.price || 0);
  }, 0);
  const estimatedTotal = baseTotal + addOnsTotal;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link to={`/vendor/${vendor.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to {vendor.name}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Header */}
            <Card variant="glass" className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="gradient">
                  {pkg.type === 'HOURLY' ? (
                    <><Clock className="w-3 h-3 mr-1" /> Hourly</>
                  ) : (
                    <><Calendar className="w-3 h-3 mr-1" /> Daily</>
                  )}
                </Badge>
                {pkg.instantBook && (
                  <Badge variant="trust" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Instant Book
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {pkg.name}
              </h1>
              <Link to={`/vendor/${vendor.id}`} className="text-primary hover:underline">
                by {vendor.name}
              </Link>

              <p className="text-muted-foreground mt-4 leading-relaxed">
                {pkg.description}
              </p>

              <div className="flex items-baseline gap-2 mt-6 pt-6 border-t border-border">
                <span className="text-4xl font-bold gradient-text">${pkg.price}</span>
                <span className="text-lg text-muted-foreground">
                  /{pkg.type === 'HOURLY' ? 'hour' : 'day'}
                </span>
                {pkg.minUnits > 1 && (
                  <Badge variant="glass" className="ml-2">
                    {pkg.minUnits} {pkg.type === 'HOURLY' ? 'hour' : 'day'} minimum
                  </Badge>
                )}
              </div>
            </Card>

            {/* What's Included */}
            <Card variant="glass" className="p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                What's Included
              </h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-trust/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-trust" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Add-ons */}
            {pkg.addOns.length > 0 && (
              <Card variant="glass" className="p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Available Add-ons
                </h2>
                <div className="space-y-3">
                  {pkg.addOns.map(addOn => (
                    <button
                      key={addOn.id}
                      onClick={() => toggleAddOn(addOn.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedAddOns.includes(addOn.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAddOns.includes(addOn.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedAddOns.includes(addOn.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-foreground font-medium">{addOn.name}</span>
                      </div>
                      <span className="text-foreground font-semibold">+${addOn.price}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Requirements */}
            {pkg.requirements.length > 0 && (
              <Card variant="glass" className="p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {pkg.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Reviews Preview */}
            {vendorReviews.length > 0 && (
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Reviews
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-trust fill-trust" />
                    <span className="font-bold text-foreground">{vendor.avgRating}</span>
                    <span className="text-muted-foreground">({vendor.reviewCount})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {vendorReviews.map(review => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{review.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-trust fill-trust" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
                <Link to={`/vendor/${vendor.id}`} className="block mt-4 text-center">
                  <Button variant="ghost" size="sm">View all reviews</Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="gradient" className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Book This Package
                </h3>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Date
                  </label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border text-left hover:border-primary/50 transition-colors",
                          !eventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                        {eventDate ? format(eventDate, "PPP") : "Select a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={eventDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => 
                          date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                          isDateBlocked(date)
                        }
                        modifiers={{
                          blocked: (date) => isDateBlocked(date)
                        }}
                        modifiersStyles={{
                          blocked: {
                            backgroundColor: 'hsl(var(--destructive) / 0.2)',
                            color: 'hsl(var(--destructive))',
                            textDecoration: 'line-through'
                          }
                        }}
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="px-3 pb-3 text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-destructive/20" />
                        <span>Unavailable dates</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Location
                  </label>
                  <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter address or city"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration ({pkg.type === 'HOURLY' ? 'hours' : 'days'})
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setUnits(Math.max(pkg.minUnits, units - 1))}
                      className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      disabled={units <= pkg.minUnits}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-foreground w-12 text-center">
                      {units}
                    </span>
                    <button
                      onClick={() => setUnits(units + 1)}
                      className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {pkg.minUnits > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Minimum: {pkg.minUnits} {pkg.type === 'HOURLY' ? 'hours' : 'days'}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${pkg.price} × {units} {pkg.type === 'HOURLY' ? 'hrs' : 'days'}
                    </span>
                    <span className="text-foreground">${baseTotal}</span>
                  </div>
                  {selectedAddOns.map(addOnId => {
                    const addOn = pkg.addOns.find(a => a.id === addOnId);
                    return addOn ? (
                      <div key={addOnId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{addOn.name}</span>
                        <span className="text-foreground">${addOn.price}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-foreground">Estimated Total</span>
                    <span className="gradient-text">${estimatedTotal}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Final price may vary based on travel fees and taxes
                  </p>
                </div>

                <Button variant="gradient" size="lg" className="w-full mb-3">
                  {pkg.instantBook ? 'Book Now' : 'Request Booking'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {pkg.instantBook 
                    ? 'Instant confirmation available'
                    : 'Vendor will confirm within 24 hours'
                  }
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </Layout>
  );
}
