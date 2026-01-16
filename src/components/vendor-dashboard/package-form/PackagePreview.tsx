import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Zap, 
  Check, 
  Gift,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { categories } from '@/data/categories';
import { PackageFormData } from './PackageFormWizard';

interface PackagePreviewProps {
  formData: PackageFormData;
}

const cancellationLabels: Record<string, string> = {
  flexible: 'Flexible - Full refund up to 24 hours before',
  moderate: 'Moderate - Full refund up to 5 days before',
  strict: 'Strict - 50% refund up to 7 days before',
  non_refundable: 'Non-refundable'
};

export function PackagePreview({ formData }: PackagePreviewProps) {
  const category = categories.find(c => c.id === formData.category);
  const coverImage = formData.images[0];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Preview your package</h3>
        <p className="text-muted-foreground text-sm">
          This is how customers will see your package listing.
        </p>
      </div>

      {/* Preview Card */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        {coverImage ? (
          <div className="aspect-video relative">
            <img
              src={coverImage}
              alt={formData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">{formData.name || 'Package Name'}</h2>
              {category && (
                <Badge variant="secondary" className="mt-2">
                  {category.name}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No cover image</p>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          {/* Pricing Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold gradient-text">
                ${formData.price}
              </span>
              <span className="text-muted-foreground">
                /{formData.type === 'HOURLY' ? 'hr' : 'day'}
              </span>
              {formData.min_units > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({formData.min_units} min)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="gradient">
                {formData.type === 'HOURLY' ? (
                  <><Clock className="w-3 h-3 mr-1" /> Hourly</>
                ) : (
                  <><Calendar className="w-3 h-3 mr-1" /> Daily</>
                )}
              </Badge>
              {formData.instant_book && (
                <Badge variant="trust">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Book
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <p className="text-muted-foreground">{formData.description}</p>
          )}

          {/* Travel Info */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Travel Radius: {formData.travel_radius} miles</p>
              {formData.travel_fee_per_mile > 0 && (
                <p className="text-sm text-muted-foreground">
                  ${formData.travel_fee_per_mile}/mile travel fee
                </p>
              )}
            </div>
          </div>

          {/* What's Included */}
          {formData.includes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                What's Included
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {formData.add_ons.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-500" />
                Optional Add-ons
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.add_ons.map((addon, i) => (
                  <Badge key={i} variant="secondary">
                    {addon.name} (+${addon.price})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {formData.requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Requirements
              </h4>
              <ul className="space-y-1">
                {formData.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="pt-4 border-t">
            <p className="text-sm">
              <span className="font-medium">Cancellation Policy: </span>
              <span className="text-muted-foreground">
                {cancellationLabels[formData.cancellation_policy]}
              </span>
            </p>
          </div>

          {/* Preview CTA */}
          <Button variant="gradient" className="w-full" disabled>
            Book Now — ${formData.price * formData.min_units} minimum
          </Button>
        </CardContent>
      </Card>

      {/* Additional Images Preview */}
      {formData.images.length > 1 && (
        <div className="space-y-3">
          <h4 className="font-medium">Gallery ({formData.images.length} images)</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {formData.images.slice(1).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Gallery image ${index + 2}`}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
