import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FoodTruckPullUpStrip } from '@/components/home/FoodTruckPullUpStrip';
import { CategoryCuisineChips } from '@/components/home/CategoryCuisineChips';
import { AIConciergeStrip } from '@/components/home/AIConciergeStrip';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { FlexibleDatesSection } from '@/components/home/FlexibleDatesSection';
import { OccasionGrid } from '@/components/home/OccasionGrid';
import { BookingTypeCards } from '@/components/home/BookingTypeCards';
import { TrustRow } from '@/components/home/TrustRow';
import { VendorCTA } from '@/components/home/VendorCTA';
import { FinalCTA } from '@/components/home/FinalCTA';
import { BecomeProPopup } from '@/components/home/BecomeProPopup';
import { CustomerJourneyStrip } from '@/components/book-or-get-booked/CustomerJourneyStrip';
import { useSEO } from '@/hooks/useSEO';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';
import { generatePageSEO, SEO_CONFIG } from '@/lib/seoConfig';

const Index = () => {
  const seo = generatePageSEO('home');

  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
    keywords: SEO_CONFIG.keywords,
  });

  return (
    <Layout>
      <WebsiteJsonLd />
      <OrganizationJsonLd />

      <HeroSection />
      <FoodTruckPullUpStrip />
      <CategoryCuisineChips />
      <AIConciergeStrip />
      <CustomerJourneyStrip compact title="From search to served" />
      <FeaturedPackages />
      <FlexibleDatesSection />
      <OccasionGrid />
      <BookingTypeCards />
      <TrustRow />
      <VendorCTA />
      <FinalCTA />
      <BecomeProPopup />
    </Layout>
  );
};

export default Index;
