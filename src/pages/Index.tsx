import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { BentoGrid } from '@/components/home/BentoGrid';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedPackages } from '@/components/home/FeaturedPackages';
import { VendorCTA } from '@/components/home/VendorCTA';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BentoGrid />
      <TrustSection />
      <HowItWorks />
      <FeaturedPackages />
      <VendorCTA />
    </Layout>
  );
};

export default Index;
