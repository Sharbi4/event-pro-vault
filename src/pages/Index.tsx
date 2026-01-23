import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryRows } from '@/components/home/CategoryRows';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedVendors } from '@/components/home/FeaturedVendors';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { VendorCTA } from '@/components/home/VendorCTA';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoryRows />
      <TrustSection />
      <HowItWorks />
      <FeaturedVendors />
      <FeaturedPackages />
      <VendorCTA />
    </Layout>
  );
};

export default Index;
