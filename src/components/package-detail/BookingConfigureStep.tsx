import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Truck, Package as PackageIcon, Home, Store } from 'lucide-react';
import type { PackageVariation, MenuItem } from '@/hooks/usePackageDetail';

export interface AddOnSpec { id: string; name: string; price: number }

export interface BookingConfigState {
  selectedVariationId: string | null;
  fulfillmentType: string | null;
  addOnQty: Record<string, number>; // by addon id
  menuQty: Record<string, number>;  // by menu item id
  questionAnswers: Record<string, string>; // keyed by question text
}

export const FULFILLMENT_LABELS: Record<string, { label: string; icon: any; description: string }> = {
  on_site: { label: 'On-site service', icon: Home, description: 'Event Pro comes to your location' },
  delivery: { label: 'Delivery', icon: Truck, description: 'Drop-off to your location' },
  pickup: { label: 'Pickup', icon: Store, description: 'You pick up from the Event Pro' },
};

interface Props {
  variations: PackageVariation[];
  fulfillmentOptions: string[];
  fulfillmentPricing: Record<string, number>;
  addOns: AddOnSpec[];
  menuItems: MenuItem[];
  customerQuestions: string[];
  state: BookingConfigState;
  onChange: (next: BookingConfigState) => void;
}

export function BookingConfigureStep({
  variations,
  fulfillmentOptions,
  fulfillmentPricing,
  addOns,
  menuItems,
  customerQuestions,
  state,
  onChange,
}: Props) {
  const set = (patch: Partial<BookingConfigState>) => onChange({ ...state, ...patch });

  const stepAddon = (id: string, delta: number) => {
    const cur = state.addOnQty[id] || 0;
    const next = Math.max(0, cur + delta);
    set({ addOnQty: { ...state.addOnQty, [id]: next } });
  };

  const stepMenu = (item: MenuItem, delta: number) => {
    const id = String(item.id);
    const cur = state.menuQty[id] || 0;
    const min = item.min_quantity ?? 0;
    const max = item.max_quantity ?? 9999;
    let next = cur + delta;
    if (next > 0 && next < min) next = min;
    if (next > max) next = max;
    if (next < 0) next = 0;
    set({ menuQty: { ...state.menuQty, [id]: next } });
  };

  const sections = {
    variations: variations.length > 0,
    fulfillment: fulfillmentOptions.length > 1,
    addons: addOns.length > 0,
    menu: menuItems.length > 0,
    questions: customerQuestions.length > 0,
  };
  const anySection = Object.values(sections).some(Boolean);

  if (!anySection) return null;

  return (
    <div className="space-y-6">
      {/* Variations / tiers */}
      {sections.variations && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">Choose your option</h3>
            <p className="text-xs text-muted-foreground">Pick the tier that best fits your event.</p>
          </div>
          <RadioGroup
            value={state.selectedVariationId || ''}
            onValueChange={(v) => set({ selectedVariationId: v })}
            className="space-y-2"
          >
            {variations.map((v) => (
              <Card
                key={v.id}
                className={`p-4 cursor-pointer transition-all ${
                  state.selectedVariationId === v.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => set({ selectedVariationId: v.id })}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={v.id} id={`var-${v.id}`} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <Label htmlFor={`var-${v.id}`} className="font-semibold cursor-pointer">
                        {v.name}
                      </Label>
                      <span className="font-bold text-primary">${v.price.toFixed(2)}</span>
                    </div>
                    {v.description && (
                      <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
                    )}
                    {v.includes.length > 0 && (
                      <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {v.includes.map((it, i) => (
                          <li key={i}>• {it}</li>
                        ))}
                      </ul>
                    )}
                    {(v.min_guests || v.max_guests) && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {v.min_guests || 1}–{v.max_guests || '∞'} guests
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </RadioGroup>
        </section>
      )}

      {/* Fulfillment */}
      {sections.fulfillment && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">How would you like the service?</h3>
            <p className="text-xs text-muted-foreground">Choose a fulfillment style.</p>
          </div>
          <RadioGroup
            value={state.fulfillmentType || ''}
            onValueChange={(v) => set({ fulfillmentType: v })}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {fulfillmentOptions.map((opt) => {
              const meta = FULFILLMENT_LABELS[opt] || { label: opt, icon: PackageIcon, description: '' };
              const Icon = meta.icon;
              const surcharge = fulfillmentPricing[opt] || 0;
              const active = state.fulfillmentType === opt;
              return (
                <Card
                  key={opt}
                  onClick={() => set({ fulfillmentType: opt })}
                  className={`p-3 cursor-pointer ${active ? 'border-primary ring-2 ring-primary/20' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value={opt} id={`ff-${opt}`} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <Label htmlFor={`ff-${opt}`} className="font-medium cursor-pointer">
                          {meta.label}
                        </Label>
                      </div>
                      {meta.description && (
                        <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
                      )}
                      {surcharge !== 0 && (
                        <p className="text-xs text-foreground mt-1">
                          {surcharge > 0 ? `+ $${surcharge}` : `– $${Math.abs(surcharge)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </RadioGroup>
        </section>
      )}

      {/* Add-ons */}
      {sections.addons && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">Add-ons</h3>
            <p className="text-xs text-muted-foreground">Optional extras you can include.</p>
          </div>
          <div className="space-y-2">
            {addOns.map((a) => {
              const qty = state.addOnQty[a.id] || 0;
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">{a.name}</div>
                    <div className="text-sm text-muted-foreground">+${a.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => stepAddon(a.id, -1)} disabled={qty === 0}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{qty}</span>
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => stepAddon(a.id, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Menu items */}
      {sections.menu && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">Build your menu</h3>
            <p className="text-xs text-muted-foreground">Pick quantities for the items you want.</p>
          </div>
          <div className="space-y-2">
            {menuItems.map((m) => {
              const id = String(m.id);
              const qty = state.menuQty[id] || 0;
              return (
                <div key={id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{m.name}</div>
                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground mt-1">
                      ${m.price.toFixed(2)}
                      {m.min_quantity ? <span className="ml-2 text-xs">min {m.min_quantity}</span> : null}
                      {m.max_quantity ? <span className="ml-2 text-xs">max {m.max_quantity}</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => stepMenu(m, -1)} disabled={qty === 0}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{qty}</span>
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => stepMenu(m, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Customer questions */}
      {sections.questions && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">A few questions from the Event Pro</h3>
            <p className="text-xs text-muted-foreground">Answers help them prepare for your event.</p>
          </div>
          <div className="space-y-3">
            {customerQuestions.map((q, i) => (
              <div key={i}>
                <Label className="text-sm font-medium text-foreground">{q}</Label>
                <Textarea
                  rows={2}
                  className="mt-1"
                  value={state.questionAnswers[q] || ''}
                  onChange={(e) =>
                    set({ questionAnswers: { ...state.questionAnswers, [q]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Helpers
export function computeConfigExtras(
  state: BookingConfigState,
  args: {
    variations: PackageVariation[];
    fulfillmentPricing: Record<string, number>;
    addOns: AddOnSpec[];
    menuItems: MenuItem[];
    basePrice: number;
  }
) {
  const variation = state.selectedVariationId
    ? args.variations.find(v => v.id === state.selectedVariationId) || null
    : null;
  const baseUnitPrice = variation ? variation.price : args.basePrice;

  const addOnLines = args.addOns
    .map(a => ({ ...a, qty: state.addOnQty[a.id] || 0 }))
    .filter(a => a.qty > 0)
    .map(a => ({ id: a.id, name: a.name, price: a.price, qty: a.qty, total: a.price * a.qty }));

  const menuLines = args.menuItems
    .map(m => {
      const id = String(m.id);
      return { ...m, id, qty: state.menuQty[id] || 0 };
    })
    .filter(m => m.qty > 0)
    .map(m => ({ id: m.id!, name: m.name, price: m.price, qty: m.qty, total: m.price * m.qty }));

  const fulfillmentSurcharge = state.fulfillmentType
    ? (args.fulfillmentPricing[state.fulfillmentType] || 0)
    : 0;

  const addOnsTotal = addOnLines.reduce((s, l) => s + l.total, 0);
  const menuTotal = menuLines.reduce((s, l) => s + l.total, 0);
  const extrasTotal = addOnsTotal + menuTotal + fulfillmentSurcharge;

  return { variation, baseUnitPrice, addOnLines, menuLines, fulfillmentSurcharge, addOnsTotal, menuTotal, extrasTotal };
}
