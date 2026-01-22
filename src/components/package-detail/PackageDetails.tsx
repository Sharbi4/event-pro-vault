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
  FileText, Star, Timer 
} from 'lucide-react';

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
  reviewCount
}: PackageDetailsProps) {
  const formatCancellationPolicy = (policy: string | null) => {
    switch (policy) {
      case 'flexible':
        return 'Free cancellation up to 24 hours before the event';
      case 'moderate':
        return 'Free cancellation up to 5 days before the event. 50% refund within 5 days.';
      case 'strict':
        return 'Free cancellation up to 14 days before the event. 50% refund within 14 days, no refund within 7 days.';
      default:
        return 'Contact the Event Pro for cancellation terms';
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <Accordion type="multiple" defaultValue={['includes', 'add-ons']} className="w-full">
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
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Cancellation Policy */}
        <AccordionItem value="cancellation" className="border-b">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Cancellation Policy</span>
              {cancellationPolicy && (
                <Badge variant="outline" className="text-xs capitalize">{cancellationPolicy}</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <p className="text-muted-foreground">
              {formatCancellationPolicy(cancellationPolicy)}
            </p>
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
