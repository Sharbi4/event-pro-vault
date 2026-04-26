import { Users } from 'lucide-react';

interface SocialProofProps {
  marketName: string;
  galleryImages?: { url: string; caption?: string }[];
}

// Note: Real testimonials will come from verified Event Pro bookings in future
// For now, we only show the Photos section if gallery images exist

export function SocialProof({ marketName, galleryImages = [] }: SocialProofProps) {
  // Only render if we have gallery images to show
  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* Past Market Photos */}
      {galleryImages.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Photos from Past Markets
          </h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {galleryImages.slice(0, 6).map((img, idx) => (
              <div 
                key={idx} 
                className="shrink-0 w-40 aspect-[4/3] rounded-xl overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.caption || `Market photo ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
