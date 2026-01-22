import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, Users } from 'lucide-react';

interface SocialProofProps {
  marketName: string;
  galleryImages?: { url: string; caption?: string }[];
}

// Placeholder testimonials for MVP
const placeholderTestimonials = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: '',
    rating: 5,
    text: 'Great foot traffic and friendly organizers. My booth was busy all day!',
    vendorType: 'Artisan Jewelry',
  },
  {
    id: '2',
    name: 'Mike R.',
    avatar: '',
    rating: 5,
    text: 'Easy booking process and the setup was exactly as described. Will definitely return.',
    vendorType: 'Food Truck',
  },
  {
    id: '3',
    name: 'Lisa K.',
    avatar: '',
    rating: 4,
    text: 'Solid market with good location. Customers were very engaged.',
    vendorType: 'Vintage Clothing',
  },
];

export function SocialProof({ marketName, galleryImages = [] }: SocialProofProps) {
  return (
    <div className="space-y-6">
      {/* Vendor Testimonials */}
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Quote className="w-5 h-5 text-primary" />
          What Vendors Say
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {placeholderTestimonials.map((testimonial) => (
            <Card key={testimonial.id} variant="glass" className="h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.vendorType}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < testimonial.rating ? 'text-trust fill-trust' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground flex-1">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
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
