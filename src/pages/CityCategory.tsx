import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { BrowsePackageCard } from '@/components/browse/BrowsePackageCard';
import { NoMatchesEmptyState } from '@/components/growth/NoMatchesEmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { serviceCategories } from '@/data/service-categories';
import { useSEO } from '@/hooks/useSEO';

// US cities for internal linking
const NEARBY_CITIES = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin',
  'Miami', 'Atlanta', 'Denver', 'Seattle', 'Boston'
];

// Category-specific FAQs
const CATEGORY_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  'food-truck': [
    { q: 'How much does a food truck cost for an event?', a: 'Food truck prices typically range from $500-$2,500 depending on guest count, menu, and event duration. Most trucks have a minimum spend of $500-$1,000.' },
    { q: 'How far in advance should I book a food truck?', a: 'We recommend booking 2-4 weeks in advance for weekday events and 4-8 weeks for weekend events, especially during peak season.' },
    { q: 'What do I need to provide for a food truck?', a: 'Most food trucks are self-contained and only need a flat, paved surface to park. Some may request access to power or water for extended events.' }
  ],
  'photographer': [
    { q: 'How much does an event photographer cost?', a: 'Event photography typically ranges from $150-$500 per hour depending on experience level and deliverables included.' },
    { q: 'How long does it take to receive photos?', a: 'Most photographers deliver edited photos within 1-3 weeks after your event.' },
    { q: 'What is included in a photography package?', a: 'Packages typically include on-site coverage, editing, and digital delivery. Some include prints, albums, or second shooters.' }
  ],
  'dj': [
    { q: 'How much does a DJ cost for a party?', a: 'DJ services typically range from $300-$1,500 depending on event duration, equipment needs, and experience level.' },
    { q: 'What equipment does a DJ provide?', a: 'Most DJs bring their own sound system, speakers, and lighting. Larger venues may require additional PA equipment.' },
    { q: 'Can the DJ take song requests?', a: 'Most DJs are happy to take requests! Discuss your must-play and do-not-play lists during booking.' }
  ]
};

const DEFAULT_FAQS = [
  { q: 'How does booking work?', a: 'Browse packages, select your date and details, and book instantly or request approval. You only pay after the Event Pro confirms.' },
  { q: 'What if I need to cancel?', a: 'Each package has a cancellation policy (Flexible, Standard, or Strict) shown before booking. Refunds depend on how far in advance you cancel.' },
  { q: 'Are the Event Pros verified?', a: 'All Event Pros complete our verification process and must connect a payment account before accepting bookings.' }
];

function slugToTitle(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function CityCategory() {
  const { citySlug, categorySlug } = useParams<{ citySlug: string; categorySlug: string }>();
  
  const cityName = slugToTitle(citySlug || '');
  const categoryName = slugToTitle(categorySlug || '');
  const categoryInfo = serviceCategories.find(c => c.id === categorySlug || c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug);

  const pageTitle = `${categoryName} in ${cityName} | EventPros`;
  const pageDescription = `Find and book the best ${categoryName.toLowerCase()} services in ${cityName}. Compare packages, read reviews, and book instantly.`;

  // Use SEO hook
  useSEO({
    title: pageTitle,
    description: pageDescription,
    canonical: `/${citySlug}/${categorySlug}`
  });

  // Fetch packages for this city/category
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['city-category-packages', citySlug, categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_packages')
        .select(`
          *,
          vendor_details!inner(city, state, formatted_address, base_location_lat, base_location_lng, travel_radius_miles),
          profiles!inner(display_name, avatar_url, stripe_account_status)
        `)
        .eq('is_published', true)
        .eq('is_active', true)
        .ilike('vendor_details.city', `%${cityName}%`)
        .or(`category.ilike.%${categorySlug}%,name.ilike.%${categoryName}%,description.ilike.%${categoryName}%`);

      if (error) throw error;
      // Hide packages that require online payment when vendor's Stripe is not active
      return (data || []).filter((pkg: any) => {
        const po = pkg.payment_options as 'ONLINE' | 'CASH' | 'BOTH' | null;
        const requiresStripe = po === 'ONLINE' || po === 'BOTH';
        if (!requiresStripe) return true;
        return pkg.profiles?.stripe_account_status === 'active';
      });
    },
    enabled: !!citySlug && !!categorySlug
  });

  // Get FAQs
  const faqs = CATEGORY_FAQS[categorySlug || ''] || DEFAULT_FAQS;

  // Nearby cities for internal linking
  const otherCities = NEARBY_CITIES.filter(c => c.toLowerCase().replace(/\s+/g, '-') !== citySlug).slice(0, 6);

  // Other categories for internal linking
  const otherCategories = serviceCategories.filter(c => c.id !== categorySlug).slice(0, 6);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-16">
          <div className="container max-w-6xl">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{cityName}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {categoryName} in {cityName}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              {categoryInfo?.description || `Find and book professional ${categoryName.toLowerCase()} for your next event in ${cityName}.`}
            </p>

            {packages.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-base py-1 px-3">
                  {packages.length} {packages.length === 1 ? 'package' : 'packages'} available
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Verified Event Pros</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container max-w-6xl py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg: any) => (
                <BrowsePackageCard
                  key={pkg.id}
                  pkg={{
                    ...pkg,
                    vendorName: pkg.profiles?.display_name || 'Event Pro',
                    vendorAvatar: pkg.profiles?.avatar_url,
                    city: pkg.vendor_details?.city,
                    state: pkg.vendor_details?.state
                  }}
                />
              ))}
            </div>
          ) : (
            <NoMatchesEmptyState
              searchCategory={categorySlug}
              searchCity={cityName}
            />
          )}
        </div>

        {/* FAQ Section */}
        <div className="container max-w-3xl py-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Internal Links */}
        <div className="container max-w-6xl py-12 border-t">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Other cities */}
            <div>
              <h3 className="font-semibold mb-4">{categoryName} in Other Cities</h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map(city => (
                  <Link
                    key={city}
                    to={`/${city.toLowerCase().replace(/\s+/g, '-')}/${categorySlug}`}
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      {city}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other categories */}
            <div>
              <h3 className="font-semibold mb-4">Other Services in {cityName}</h3>
              <div className="flex flex-wrap gap-2">
                {otherCategories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/${citySlug}/${cat.id}`}
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      {cat.name}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
