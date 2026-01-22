import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Zap, 
  Check, 
  Gift,
  AlertCircle,
  Play,
  Users,
  Package,
  MessageSquare,
  Car,
  DollarSign
} from 'lucide-react';
import { categories } from '@/data/categories';
import { PackageFormData } from './PackageFormWizard';
import { PricingType } from './PricingTypeSelector';

interface PackagePreviewProps {
  formData: PackageFormData;
}

const cancellationLabels: Record<string, string> = {
  flexible: 'Flexible',
  moderate: 'Moderate',
  strict: 'Strict',
  non_refundable: 'Non-refundable'
};

const pricingTypeLabels: Record<PricingType, { suffix: string; icon: React.ReactNode }> = {
  hourly: { suffix: '/hr', icon: <Clock className="w-3 h-3" /> },
  daily: { suffix: '/day', icon: <Calendar className="w-3 h-3" /> },
  flat: { suffix: '', icon: <DollarSign className="w-3 h-3" /> },
  per_guest: { suffix: '/guest', icon: <Users className="w-3 h-3" /> },
  per_item: { suffix: '/item', icon: <Package className="w-3 h-3" /> },
  custom_quote: { suffix: '', icon: <MessageSquare className="w-3 h-3" /> }
};

function getPricingDisplay(formData: PackageFormData) {
  const pricingType = (formData.pricing_type || 'hourly') as PricingType;
  const config = pricingTypeLabels[pricingType];
  
  if (pricingType === 'custom_quote') {
    if (formData.starting_at && formData.starting_at > 0) {
      return { price: `From $${formData.starting_at}`, suffix: '' };
    }
    return { price: 'Request Quote', suffix: '' };
  }
  
  return { price: `$${formData.price}`, suffix: config.suffix };
}

function getMinBookingDisplay(formData: PackageFormData) {
  const pricingType = (formData.pricing_type || 'hourly') as PricingType;
  
  switch (pricingType) {
    case 'hourly':
      const minHours = formData.min_hours || formData.min_units || 1;
      return { value: minHours, label: 'hr min', icon: <Clock className="w-3 h-3" /> };
    case 'daily':
      // For daily, use min_units as it represents days
      const minDays = formData.min_units || 1;
      return { value: minDays, label: 'day min', icon: <Calendar className="w-3 h-3" /> };
    case 'per_guest':
      const minGuests = formData.min_guests || 1;
      return { value: minGuests, label: 'guests min', icon: <Users className="w-3 h-3" /> };
    case 'per_item':
      const minQty = formData.min_quantity || 1;
      return { value: minQty, label: 'items min', icon: <Package className="w-3 h-3" /> };
    case 'flat':
      if (formData.min_spend && formData.min_spend > 0) {
        return { value: `$${formData.min_spend}`, label: 'min spend', icon: <DollarSign className="w-3 h-3" /> };
      }
      return null;
    case 'custom_quote':
      return null;
    default:
      return { value: formData.min_units || 1, label: 'min', icon: <Clock className="w-3 h-3" /> };
  }
}

function getTravelDisplay(formData: PackageFormData) {
  if (formData.pickup_only) {
    return { label: 'Pickup only', icon: <MapPin className="w-3 h-3" /> };
  }
  
  const maxMiles = formData.max_travel_miles || formData.travel_radius;
  if (maxMiles && maxMiles > 0) {
    const includedMiles = formData.included_miles || 0;
    const feePerMile = formData.fee_per_mile || 0;
    
    let travelInfo = `${maxMiles} mi`;
    if (feePerMile > 0 && includedMiles > 0) {
      travelInfo += ` (${includedMiles} free)`;
    }
    
    return { label: travelInfo, icon: <Car className="w-3 h-3" /> };
  }
  
  return null;
}

function calculateMinTotal(formData: PackageFormData): string | null {
  const pricingType = (formData.pricing_type || 'hourly') as PricingType;
  
  if (pricingType === 'custom_quote') {
    return null;
  }
  
  if (pricingType === 'flat') {
    return `$${formData.price}`;
  }
  
  let minUnits = 1;
  switch (pricingType) {
    case 'hourly':
      minUnits = formData.min_hours || formData.min_units || 1;
      break;
    case 'daily':
      // For daily pricing, use min_units as it represents days
      minUnits = formData.min_units || 1;
      break;
    case 'per_guest':
      minUnits = formData.min_guests || 1;
      break;
    case 'per_item':
      minUnits = formData.min_quantity || 1;
      break;
  }
  
  return `$${formData.price * minUnits}`;
}

export function PackagePreview({ formData }: PackagePreviewProps) {
  const category = categories.find(c => c.id === formData.category);
  const coverMedia = formData.images[0];
  const isVideo = coverMedia?.toLowerCase().match(/\.(mp4|mov|webm|avi)$/);
  
  const pricingType = (formData.pricing_type || 'hourly') as PricingType;
  const pricing = getPricingDisplay(formData);
  const minBooking = getMinBookingDisplay(formData);
  const travel = getTravelDisplay(formData);
  const minTotal = calculateMinTotal(formData);
  const isCustomQuote = pricingType === 'custom_quote';

  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <h3 className="font-semibold">Preview</h3>
        <p className="text-xs text-muted-foreground">How customers will see your package</p>
      </div>

      {/* Compact Preview Card */}
      <div className="rounded-xl border overflow-hidden bg-card">
        {/* Cover */}
        <div className="aspect-[16/9] relative bg-muted">
          {coverMedia ? (
            isVideo ? (
              <div className="relative w-full h-full">
                <video src={coverMedia} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img src={coverMedia} alt={formData.name} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No cover image
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {formData.instant_book && !isCustomQuote && (
              <Badge variant="trust" className="text-xs">
                <Zap className="w-3 h-3 mr-0.5" /> Instant
              </Badge>
            )}
            {isCustomQuote && (
              <Badge variant="secondary" className="text-xs bg-white/90">
                <MessageSquare className="w-3 h-3 mr-0.5" /> Quote Only
              </Badge>
            )}
          </div>
          
          {/* Price overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">
                  {formData.name || 'Package Name'}
                </h2>
                {category && (
                  <span className="text-white/70 text-xs">{category.name}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">{pricing.price}</span>
                {pricing.suffix && (
                  <span className="text-white/70 text-xs">{pricing.suffix}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Quick info row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {minBooking && (
              <span className="flex items-center gap-1">
                {minBooking.icon}
                {minBooking.value} {minBooking.label}
              </span>
            )}
            {travel && (
              <span className="flex items-center gap-1">
                {travel.icon}
                {travel.label}
              </span>
            )}
            <span className="ml-auto">{cancellationLabels[formData.cancellation_policy]}</span>
          </div>

          {/* Travel fee info */}
          {!formData.pickup_only && formData.fee_per_mile && formData.fee_per_mile > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
              <span className="flex items-center gap-1">
                <Car className="w-3 h-3" />
                ${formData.fee_per_mile}/mi after {formData.included_miles || 0} free miles
              </span>
            </div>
          )}

          {/* Description */}
          {formData.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{formData.description}</p>
          )}

          {/* Includes */}
          {formData.includes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.includes.slice(0, 4).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3" />
                  <span className="max-w-[80px] truncate">{item}</span>
                </span>
              ))}
              {formData.includes.length > 4 && (
                <span className="text-xs text-muted-foreground">+{formData.includes.length - 4} more</span>
              )}
            </div>
          )}

          {/* Optional pricing extras */}
          {(formData.overtime_rate || formData.deposit) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {formData.overtime_rate && formData.overtime_rate > 0 && (pricingType === 'hourly' || pricingType === 'daily') && (
                <span className="text-muted-foreground">
                  Overtime: ${formData.overtime_rate}/hr
                </span>
              )}
              {formData.deposit && formData.deposit > 0 && (
                <span className="text-muted-foreground">
                  Deposit: ${formData.deposit}
                </span>
              )}
            </div>
          )}

          {/* Add-ons */}
          {formData.add_ons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.add_ons.slice(0, 3).map((addon, i) => (
                <Badge key={i} variant="secondary" className="text-xs py-0 h-5">
                  <Gift className="w-2.5 h-2.5 mr-0.5 text-purple-500" />
                  {addon.name} +${addon.price}
                </Badge>
              ))}
              {formData.add_ons.length > 3 && (
                <span className="text-xs text-muted-foreground">+{formData.add_ons.length - 3}</span>
              )}
            </div>
          )}

          {/* Additional fees */}
          {formData.additional_fees && formData.additional_fees.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.additional_fees.slice(0, 2).map((fee, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0 h-5">
                  +${fee.amount} {fee.name}
                </Badge>
              ))}
              {formData.additional_fees.length > 2 && (
                <span className="text-xs text-muted-foreground">+{formData.additional_fees.length - 2} fees</span>
              )}
            </div>
          )}

          {/* Requirements */}
          {formData.requirements.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>{formData.requirements.length} requirement{formData.requirements.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* CTA */}
          <Button variant="default" size="sm" className="w-full" disabled>
            {isCustomQuote ? (
              'Request a Quote'
            ) : (
              <>Book Now {minTotal && `— ${minTotal} min`}</>
            )}
          </Button>
        </div>
      </div>

      {/* Gallery thumbnails */}
      {formData.images.length > 1 && (
        <div className="flex gap-1.5 justify-center">
          {formData.images.slice(0, 6).map((url, i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-lg overflow-hidden ${i === 0 ? 'ring-2 ring-primary' : 'opacity-60'}`}
            >
              {url.toLowerCase().match(/\.(mp4|mov|webm|avi)$/) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-4 h-4" />
                </div>
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
          {formData.images.length > 6 && (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium">
              +{formData.images.length - 6}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
