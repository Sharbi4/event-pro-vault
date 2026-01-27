import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { serviceCategories } from '@/data/service-categories';

interface RequestQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: 'header_cta' | 'package_page' | 'landing_page' | 'homepage';
  prefillCategory?: string;
  prefillDate?: Date;
  prefillCity?: string;
}

export function RequestQuoteModal({
  open,
  onOpenChange,
  source = 'header_cta',
  prefillCategory,
  prefillDate,
  prefillCity
}: RequestQuoteModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState(prefillCategory || '');
  const [eventDate, setEventDate] = useState<Date | undefined>(prefillDate);
  const [city, setCity] = useState(prefillCity || '');
  const [state, setState] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const resetForm = () => {
    setCategory(prefillCategory || '');
    setEventDate(prefillDate);
    setCity(prefillCity || '');
    setState('');
    setBudgetMin('');
    setBudgetMax('');
    setEmail(user?.email || '');
    setPhone('');
    setCustomerName('');
    setNotes('');
    setConsent(false);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
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
      const { error } = await supabase.from('leads').insert({
        category,
        event_start: eventDate?.toISOString().split('T')[0],
        city,
        state,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        email,
        phone,
        customer_name: customerName,
        notes,
        source,
        user_id: user?.id || null
      });

      if (error) throw error;

      setShowSuccess(true);
      
      // Notify matching pros
      supabase.functions.invoke('notify-pros-lead', {
        body: { category, city, state, eventDate: eventDate?.toISOString() }
      });

    } catch (err) {
      console.error('Error submitting lead:', err);
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md text-center">
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              We'll notify you when a matching Event Pro becomes available.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget Min</Label>
              <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="$500" />
            </div>
            <div className="space-y-2">
              <Label>Budget Max</Label>
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
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us about your event..." rows={3} />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} />
            <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
              I agree to receive updates about matching Event Pros.
            </Label>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
