import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryRows } from '@/components/home/CategoryRows';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedVendors } from '@/components/home/FeaturedVendors';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { Testimonials } from '@/components/home/Testimonials';
import { VendorCTA } from '@/components/home/VendorCTA';
import { useSEO } from '@/hooks/useSEO';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

const Index = () => {
  // SEO for homepage
  useSEO({
    title: 'EventPro by Vendibook — Book Premium Event Vendors',
    description: 'Book photographers, DJs, caterers, food trucks and more for your next event. Instant booking, secure payments, trusted professionals.',
    canonical: 'https://event-pro-vault.lovable.app/',
    type: 'website',
    keywords: [
      'event vendors',
      'book photographer',
      'hire DJ',
      'catering service',
      'food truck rental',
      'wedding vendors',
      'party services',
      'event planning',
      'book vendors online',
    ],
  });

  return (
    <Layout>
      {/* Structured Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      
      <HeroSection />
      <CategoryRows />
      <TrustSection />
      <HowItWorks />
      <FeaturedVendors />
      <FeaturedPackages />
      <Testimonials />
      <VendorCTA />
    </Layout>
  );
};

export default Index;
