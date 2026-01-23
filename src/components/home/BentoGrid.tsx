import { motion } from 'framer-motion';
import { BentoCard } from './BentoCard';
import { packages, vendors } from '@/data/vendors';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BentoGrid() {
  // Get featured packages and enrich with vendor data
  const enrichedPackages = packages
    .filter(pkg => pkg.featured)
    .slice(0, 6)
    .map(pkg => {
      const vendor = vendors.find(v => v.id === pkg.vendorId);
      return {
        ...pkg,
        vendorName: vendor?.name || 'Unknown Vendor',
        vendorImage: vendor?.gallery[0] || '',
        rating: vendor?.avgRating || 0,
        reviewCount: vendor?.reviewCount || 0,
        isVerified: vendor?.verificationStatus === 'verified',
      };
    });

  // Assign sizes for bento layout
  const getSize = (index: number): 'default' | 'tall' | 'wide' | 'featured' => {
    const pattern = ['featured', 'default', 'tall', 'wide', 'default', 'tall'];
    return pattern[index % pattern.length] as 'default' | 'tall' | 'wide' | 'featured';
  };

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Curated for you
            </h2>
            <p className="text-muted-foreground text-lg">
              Hand-picked vendors ready to elevate your event
            </p>
          </div>
          <Link to="/browse" className="hidden md:block">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[240px]">
          {enrichedPackages.map((pkg, index) => (
            <BentoCard
              key={pkg.id}
              id={pkg.id}
              title={pkg.name}
              vendorName={pkg.vendorName}
              image={pkg.vendorImage}
              price={pkg.price}
              priceUnit={pkg.type === 'HOURLY' ? 'hr' : 'day'}
              rating={pkg.rating}
              reviewCount={pkg.reviewCount}
              isVerified={pkg.isVerified}
              isInstant={pkg.instantBook}
              size={getSize(index)}
              index={index}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/browse">
            <Button variant="outline" className="gap-2 rounded-full">
              View all packages
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
