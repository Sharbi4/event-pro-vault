import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Send, UserPlus, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { serviceCategories } from '@/data/service-categories';
import { InviteProModal } from './InviteProModal';
import { trackNoMatchShown, trackLeadFormOpened, trackLeadSubmitted, trackInviteModalOpened } from '@/lib/trackingAnalytics';

interface NoMatchesEmptyStateProps {
  searchCategory?: string;
  searchDate?: Date;
  searchCity?: string;
  searchState?: string;
  onTryNearby?: () => void;
}

export function NoMatchesEmptyState({
  searchCategory,
  searchDate,
  searchCity,
  searchState,
  onTryNearby
}: NoMatchesEmptyStateProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Track no-match shown on mount
  useEffect(() => {
    trackNoMatchShown({
      category: searchCategory,
      city: searchCity,
      state: searchState,
      date: searchDate?.toISOString(),
    });
  }, [searchCategory, searchCity, searchState, searchDate]);

  // Form state
  const [category, setCategory] = useState(searchCategory || '');
  const [eventDate, setEventDate] = useState<Date | undefined>(searchDate);
  const [city, setCity] = useState(searchCity || '');
  const [state, setState] = useState(searchState || '');
  const [zip, setZip] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const handleSubmitLead = async () => {
    if (!email) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    if (!consent) {
      toast({ title: 'Please agree to receive updates', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('leads').insert({
        category,
        event_start: eventDate?.toISOString().split('T')[0],
        city,
        state,
        zip,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        email,
        phone,
        customer_name: customerName,
        notes,
        source: 'no_matches',
        user_id: user?.id || null,
        search_query: { category: searchCategory, date: searchDate?.toISOString(), city: searchCity }
      }).select('id').single();

      if (error) throw error;

      // Track lead submission
      if (data?.id) {
        trackLeadSubmitted({ leadId: data.id, category, city, state });
      }

      setShowLeadForm(false);
      setShowSuccess(true);

      // Fire and forget: notify matching pros
      supabase.functions.invoke('notify-pros-lead', {
        body: { category, city, state, eventDate: eventDate?.toISOString() }
      });

    } catch (err) {
      console.error('Error submitting lead:', err);
      toast({ title: 'Something went wrong', description: 'Please try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Got it!</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          We'll notify you when a matching package becomes available in your area.
        </p>
        <Button variant="outline" onClick={() => setShowSuccess(false)}>
          Back to search
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          We'll help you find a match
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Tell us what you need and we'll notify pros in your area—or invite one in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button size="lg" onClick={() => {
            trackLeadFormOpened({ category: searchCategory, city: searchCity, state: searchState });
            setShowLeadForm(true);
          }} className="gap-2">
            <Send className="w-4 h-4" />
            Request a quote
          </Button>
          <Button size="lg" variant="outline" onClick={() => {
            trackInviteModalOpened({ category: searchCategory, city: searchCity });
            setShowInviteModal(true);
          }} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invite a pro
          </Button>
        </div>

        {onTryNearby && (
          <Button variant="ghost" onClick={onTryNearby} className="gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            Try nearby cities
          </Button>
        )}
      </div>

      {/* Lead Form Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a Quote</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" maxLength={5} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Min (optional)</Label>
                <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="$500" />
              </div>
              <div className="space-y-2">
                <Label>Budget Max (optional)</Label>
                <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="$2000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us more about your event..." rows={3} />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} />
              <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                I agree to receive updates about matching Vendors and availability notifications.
              </Label>
            </div>

            <Button onClick={handleSubmitLead} disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InviteProModal open={showInviteModal} onOpenChange={setShowInviteModal} category={searchCategory} city={searchCity} />
    </>
  );
}
