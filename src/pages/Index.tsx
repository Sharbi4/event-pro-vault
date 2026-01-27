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
