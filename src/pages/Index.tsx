import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedVendors } from '@/components/home/FeaturedVendors';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { VendorCTA } from '@/components/home/VendorCTA';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TrustSection />
      <CategoryGrid />
      <HowItWorks />
      <FeaturedVendors />
      <FeaturedPackages />
      <VendorCTA />
    </Layout>
  );
};

export default Index;
