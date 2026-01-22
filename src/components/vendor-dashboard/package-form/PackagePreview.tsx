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
  Play
} from 'lucide-react';
import { categories } from '@/data/categories';
import { PackageFormData } from './PackageFormWizard';

interface PackagePreviewProps {
  formData: PackageFormData;
}

const cancellationLabels: Record<string, string> = {
  flexible: 'Flexible',
  moderate: 'Moderate',
  strict: 'Strict',
  non_refundable: 'Non-refundable'
};

export function PackagePreview({ formData }: PackagePreviewProps) {
  const category = categories.find(c => c.id === formData.category);
  const coverMedia = formData.images[0];
  const isVideo = coverMedia?.toLowerCase().match(/\.(mp4|mov|webm|avi)$/);

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
            {formData.instant_book && (
              <Badge variant="trust" className="text-xs">
                <Zap className="w-3 h-3 mr-0.5" /> Instant
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
                <span className="text-xl font-bold text-white">${formData.price}</span>
                <span className="text-white/70 text-xs">/{formData.type === 'HOURLY' ? 'hr' : 'day'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Quick info row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {formData.type === 'HOURLY' ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formData.min_units} {formData.type === 'HOURLY' ? 'hr' : 'day'} min
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formData.travel_radius} mi
            </span>
            <span className="ml-auto">{cancellationLabels[formData.cancellation_policy]}</span>
          </div>

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

          {/* Requirements */}
          {formData.requirements.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>{formData.requirements.length} requirement{formData.requirements.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* CTA */}
          <Button variant="gradient" size="sm" className="w-full" disabled>
            Book Now — ${formData.price * formData.min_units} min
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
