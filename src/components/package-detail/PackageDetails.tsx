import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check, Plus, AlertCircle, Truck, Clock,
  FileText, Star, Timer, Shield, ShieldCheck, ShieldAlert,
  Layers, Utensils, MessageSquare, Home, Store, Package as PackageIcon
} from 'lucide-react';
import { ServiceAreaMap } from './ServiceAreaMap';
import {
  CancellationPolicyType,
  CANCELLATION_POLICIES
} from '@/lib/cancellationPolicies';
import type { PackageVariation, MenuItem } from '@/hooks/usePackageDetail';

const FULFILLMENT_META: Record<string, { label: string; icon: any }> = {
  on_site: { label: 'On-site service', icon: Home },
  delivery: { label: 'Delivery', icon: Truck },
  pickup: { label: 'Pickup', icon: Store },
};

interface PackageDetailsProps {
  includes: string[];
  addOns: { id: string; name: string; price: number }[];
  requirements: string[];
  customerRequirements: string | null;
  setupTimeMinutes: number | null;
  breakdownTimeMinutes: number | null;
  travelRadius: number | null;
  travelFeePerMile: number | null;
  includedTravelMiles: number | null;
  pickupOnly: boolean | null;
  cancellationPolicy: string | null;
  avgRating: number;
  reviewCount: number;
  vendorBaseLat: number | null;
  vendorBaseLng: number | null;
  vendorName?: string;
  variations?: PackageVariation[];
  fulfillmentOptions?: string[];
  fulfillmentPricing?: Record<string, number>;
  menuItems?: MenuItem[];
  customerQuestions?: string[];
}

export function PackageDetails({
  includes,
  addOns,
  requirements,
  customerRequirements,
  setupTimeMinutes,
  breakdownTimeMinutes,
  travelRadius,
  travelFeePerMile,
  includedTravelMiles,
  pickupOnly,
  cancellationPolicy,
  avgRating,
  reviewCount,
  vendorBaseLat,
  vendorBaseLng,
  vendorName,
  variations = [],
  fulfillmentOptions = [],
  fulfillmentPricing = {},
  menuItems = [],
  customerQuestions = [],
}: PackageDetailsProps) {
  const policyType = (cancellationPolicy as CancellationPolicyType) || 'standard';
  const policy = CANCELLATION_POLICIES[policyType] || CANCELLATION_POLICIES.standard;

  const getPolicyIcon = () => {
    switch (policyType) {
      case 'flexible':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'standard':
        return <ShieldCheck className="w-5 h-5 text-primary" />;
      case 'strict':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-primary" />;
    }
  };

  const getPolicyBadgeClass = () => {
    switch (policyType) {
      case 'flexible':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'standard':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'strict':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <Accordion
        type="multiple"
        defaultValue={['variations', 'fulfillment', 'includes', 'add-ons', 'menu', 'questions']}
        className="w-full"
      >
        {/* Variations / tiers */}
        {variations.length > 0 && (
          <AccordionItem value="variations" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span className="font-semibold">Package Options</span>
                <Badge variant="secondary" className="text-xs">{variations.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {variations.map((v) => (
                  <div key={v.id} className="p-4 rounded-lg border bg-background">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-semibold text-foreground">{v.name}</span>
                      <span className="font-bold text-primary">${v.price.toFixed(2)}</span>
                    </div>
                    {v.description && (
                      <p className="text-sm text-muted-foreground mb-2">{v.description}</p>
                    )}
                    {v.includes.length > 0 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {v.includes.map((it, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-primary mt-1 shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {(v.min_guests || v.max_guests) && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {v.min_guests || 1}–{v.max_guests || '∞'} guests
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Fulfillment options */}
        {fulfillmentOptions.length > 0 && (
          <AccordionItem value="fulfillment" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-semibold">Service Styles</span>
                <Badge variant="secondary" className="text-xs">{fulfillmentOptions.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {fulfillmentOptions.map((opt) => {
                  const meta = FULFILLMENT_META[opt] || { label: opt, icon: PackageIcon };
                  const Icon = meta.icon;
                  const surcharge = fulfillmentPricing[opt] || 0;
                  return (
                    <div key={opt} className="flex items-center gap-2 px-3 py-2 rounded-full border bg-background">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{meta.label}</span>
                      {surcharge !== 0 && (
                        <span className="text-xs text-muted-foreground">
                          {surcharge > 0 ? `+ $${surcharge}` : `– $${Math.abs(surcharge)}`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* What's Included */}
        {includes.length > 0 && (
          <AccordionItem value="includes" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-semibold">What's Included</span>
                <Badge variant="secondary" className="text-xs">{includes.length} items</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="grid md:grid-cols-2 gap-3">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Add-ons */}
        {addOns.length > 0 && (
          <AccordionItem value="add-ons" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span className="font-semibold">Available Add-ons</span>
                <Badge variant="secondary" className="text-xs">{addOns.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-2">
                {addOns.map((addOn) => (
                  <div key={addOn.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground">{addOn.name}</span>
                    <span className="font-semibold text-primary">+${addOn.price}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Menu items */}
        {menuItems.length > 0 && (
          <AccordionItem value="menu" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span className="font-semibold">Menu</span>
                <Badge variant="secondary" className="text-xs">{menuItems.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-2">
                {menuItems.map((m, i) => (
                  <div key={m.id || i} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground">{m.name}</div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                      )}
                      {(m.min_quantity || m.max_quantity) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.min_quantity ? `min ${m.min_quantity}` : ''}
                          {m.min_quantity && m.max_quantity ? ' • ' : ''}
                          {m.max_quantity ? `max ${m.max_quantity}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-primary shrink-0">${m.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Customer questions */}
        {customerQuestions.length > 0 && (
          <AccordionItem value="questions" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-semibold">Questions From The Event Pro</span>
                <Badge variant="secondary" className="text-xs">{customerQuestions.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-xs text-muted-foreground mb-2">
                You'll answer these in the booking flow.
              </p>
              <ul className="space-y-2">
                {customerQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Setup & Breakdown */}
        {(setupTimeMinutes || breakdownTimeMinutes) && (
          <AccordionItem value="setup" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Setup & Breakdown</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-2 text-muted-foreground">
                {setupTimeMinutes && (
                  <p>Setup time: {setupTimeMinutes} minutes before start</p>
                )}
                {breakdownTimeMinutes && (
                  <p>Breakdown time: {breakdownTimeMinutes} minutes after end</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Requirements */}
        {(requirements.length > 0 || customerRequirements) && (
          <AccordionItem value="requirements" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Requirements</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    {req}
                  </li>
                ))}
                {customerRequirements && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    {customerRequirements}
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Travel / Service Area */}
        {(travelRadius || pickupOnly) && (
          <AccordionItem value="travel" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Travel & Service Area</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-2 text-muted-foreground">
                  {pickupOnly ? (
                    <p>This is a pickup-only service. Customers must arrange their own transportation.</p>
                  ) : (
                    <>
                      {travelRadius && (
                        <p>Will travel up to {travelRadius} miles from their location</p>
                      )}
                      {includedTravelMiles && includedTravelMiles > 0 && (
                        <p>First {includedTravelMiles} miles included free</p>
                      )}
                      {travelFeePerMile && travelFeePerMile > 0 && (
                        <p>${travelFeePerMile}/mile travel fee after included miles</p>
                      )}
                    </>
                  )}
                </div>
                
                {/* Service Area Map */}
                {!pickupOnly && vendorBaseLat && vendorBaseLng && travelRadius && (
                  <ServiceAreaMap
                    lat={vendorBaseLat}
                    lng={vendorBaseLng}
                    radiusMiles={travelRadius}
                    vendorName={vendorName}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Cancellation Policy */}
        <AccordionItem value="cancellation" className="border-b">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              {getPolicyIcon()}
              <span className="font-semibold">Cancellation Policy</span>
              <Badge variant="outline" className={`text-xs ${getPolicyBadgeClass()}`}>
                {policy.name}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{policy.description}</p>
              <div className="space-y-2">
                {policy.tiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{tier.label}</span>
                    <span className={
                      tier.refundPercentage === 100 
                        ? 'font-medium text-green-600' 
                        : tier.refundPercentage > 0 
                          ? 'font-medium text-amber-600' 
                          : 'font-medium text-destructive'
                    }>
                      {tier.refundPercentage}% refund
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Reviews */}
        <AccordionItem value="reviews">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Reviews</span>
              {reviewCount > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            {reviewCount > 0 ? (
              <p className="text-muted-foreground">
                This package has {reviewCount} reviews with an average rating of {avgRating.toFixed(1)} stars.
              </p>
            ) : (
              <p className="text-muted-foreground">
                No reviews yet. Be the first to book and review!
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
