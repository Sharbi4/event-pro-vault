import { useState } from 'react';
import { Loader2, Package, Plus, Trash2, Sparkles, Users, ChefHat, Moon, Coffee, Wine } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PresetKey = 'small_party' | 'full_service' | 'late_night' | 'corporate' | 'brunch';

interface Preset {
  key: PresetKey;
  label: string;
  icon: typeof Sparkles;
  patch: {
    packageName?: string;
    description?: string;
    guestCount?: number;
    basePrice?: number;
    travelFee?: number;
    depositPercent?: number;
    expiresInDays?: number;
    includedItems?: string[];
    menuDetails?: string;
  };
  /** When true, fields are merged into existing values rather than replacing */
  mergeIncluded?: boolean;
}

const PRESETS: Preset[] = [
  {
    key: 'small_party',
    label: 'Small party',
    icon: Users,
    patch: {
      packageName: 'Small Party Package',
      description: 'Intimate gathering setup for up to 25 guests with core menu and standard service window.',
      guestCount: 25,
      basePrice: 750,
      travelFee: 50,
      depositPercent: 50,
      expiresInDays: 7,
      includedItems: ['Setup & breakdown', '2 hours of service', 'Disposable plates & utensils'],
    },
  },
  {
    key: 'full_service',
    label: 'Full service',
    icon: ChefHat,
    patch: {
      packageName: 'Full-Service Catering',
      description: 'Complete white-glove experience with on-site staff, full menu, and extended service hours.',
      guestCount: 75,
      basePrice: 2400,
      travelFee: 100,
      depositPercent: 50,
      expiresInDays: 14,
      includedItems: [
        'Setup & breakdown',
        '4 hours of service',
        'On-site staff (2 people)',
        'Premium serveware',
        'Beverage station',
      ],
    },
  },
  {
    key: 'late_night',
    label: 'Late-night add-ons',
    icon: Moon,
    mergeIncluded: true,
    patch: {
      basePrice: 350,
      depositPercent: 100,
      expiresInDays: 5,
      includedItems: ['Late-night snack station (10pm–12am)', 'Coffee & dessert refresh', 'Extended cleanup'],
      menuDetails: 'Late-night additions:\n• Slider bar\n• Mini tacos\n• Espresso & churros',
    },
  },
  {
    key: 'corporate',
    label: 'Corporate lunch',
    icon: Coffee,
    patch: {
      packageName: 'Corporate Lunch Package',
      description: 'Boxed or buffet-style lunch delivery for offices and meetings.',
      guestCount: 30,
      basePrice: 600,
      travelFee: 0,
      depositPercent: 25,
      expiresInDays: 5,
      includedItems: ['Individually packaged meals', 'Drinks & condiments', 'Delivery & setup'],
    },
  },
  {
    key: 'brunch',
    label: 'Brunch / bar',
    icon: Wine,
    patch: {
      packageName: 'Brunch & Bar Package',
      description: 'Mimosas, coffee bar, and brunch bites — perfect for showers and weekend events.',
      guestCount: 40,
      basePrice: 1200,
      travelFee: 75,
      depositPercent: 50,
      expiresInDays: 10,
      includedItems: ['Mimosa & coffee bar', 'Brunch buffet', 'Bartender (2 hrs)'],
    },
  },
];


interface CreatePrivatePackageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  customerUserId: string | null;
  customerEmail: string | null;
  onSent?: () => void;
}

export function CreatePrivatePackageDrawer({
  open,
  onOpenChange,
  conversationId,
  customerUserId,
  customerEmail,
  onSent,
}: CreatePrivatePackageDrawerProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [guestCount, setGuestCount] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [menuDetails, setMenuDetails] = useState('');
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [travelFee, setTravelFee] = useState<number | ''>(0);
  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [includedItems, setIncludedItems] = useState<string[]>(['']);
  const [expiresInDays, setExpiresInDays] = useState<number>(7);

  const totalPrice = (Number(basePrice) || 0) + (Number(travelFee) || 0);
  const depositAmount = Math.round(totalPrice * (depositPercent / 100) * 100) / 100;

  const addItem = () => setIncludedItems([...includedItems, '']);
  const updateItem = (i: number, v: string) => {
    const next = [...includedItems];
    next[i] = v;
    setIncludedItems(next);
  };
  const removeItem = (i: number) => setIncludedItems(includedItems.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    if (!user?.id) return;
    if (!packageName.trim() || !basePrice || totalPrice <= 0) {
      toast.error('Add a package name and price');
      return;
    }

    setSubmitting(true);
    try {
      const offerExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

      const { data: pkg, error } = await supabase
        .from('private_packages')
        .insert({
          vendor_user_id: user.id,
          customer_user_id: customerUserId,
          customer_email: customerEmail,
          conversation_id: conversationId,
          package_name: packageName.trim(),
          description: description.trim() || null,
          event_date: eventDate || null,
          start_time: startTime || null,
          guest_count: guestCount === '' ? null : Number(guestCount),
          location: location.trim() || null,
          menu_details: menuDetails.trim() || null,
          included_items: includedItems.filter((s) => s.trim()),
          base_price: Number(basePrice),
          travel_fee: Number(travelFee) || 0,
          total_price: totalPrice,
          deposit_amount: depositAmount,
          offer_expires_at: offerExpiresAt,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Attach as message in thread
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        sender_type: 'vendor',
        content: `📦 Sent a private package: ${packageName} — $${totalPrice.toFixed(2)}`,
        attached_private_package_id: pkg.id,
      });
      if (msgError) throw msgError;

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      toast.success('Private package sent');
      onSent?.();
      onOpenChange(false);
      // reset
      setPackageName('');
      setDescription('');
      setEventDate('');
      setStartTime('');
      setGuestCount('');
      setLocation('');
      setMenuDetails('');
      setBasePrice('');
      setTravelFee(0);
      setIncludedItems(['']);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Private Package
          </SheetTitle>
          <SheetDescription>
            Build a custom offer. The customer can review and book directly inside this thread.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Package name *</Label>
            <Input
              id="pkg-name"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. Birthday Taco Bar for 40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea
              id="pkg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the customer what's included and special touches"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="evt-date">Event date</Label>
              <Input id="evt-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-time">Start time</Label>
              <Input id="evt-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or address" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu">Menu / details</Label>
            <Textarea
              id="menu"
              value={menuDetails}
              onChange={(e) => setMenuDetails(e.target.value)}
              placeholder="Menu items, courses, beverages, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>What's included</Label>
            {includedItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder="e.g. Setup & cleanup"
                />
                {includedItems.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="w-3 h-3" /> Add item
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="base">Base price ($) *</Label>
              <Input
                id="base"
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travel">Travel fee ($)</Label>
              <Input
                id="travel"
                type="number"
                min={0}
                step="0.01"
                value={travelFee}
                onChange={(e) => setTravelFee(e.target.value === '' ? 0 : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit %</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                max={100}
                value={depositPercent}
                onChange={(e) => setDepositPercent(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp">Offer expires (days)</Label>
              <Input
                id="exp"
                type="number"
                min={1}
                max={30}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit ({depositPercent}%)</span>
              <span className="font-medium">${depositAmount.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handleSend} disabled={submitting} className="w-full" size="lg">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send to customer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
