import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Package } from 'lucide-react';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { MasonryGallery } from '@/components/package-detail/MasonryGallery';
import { ProMiniCard } from '@/components/package-detail/ProMiniCard';
import { PackageSummary } from '@/components/package-detail/PackageSummary';
import { PackageDetails } from '@/components/package-detail/PackageDetails';
import { GlassBookingDock } from '@/components/package-detail/GlassBookingDock';
import { MobileBookingBar } from '@/components/package-detail/MobileBookingBar';
import { BookingModal } from '@/components/package-detail/BookingModal';
import { motion } from 'framer-motion';

export default function PackageDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { packageData, reviews, loading, error } = usePackageDetail(id);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cash'>('stripe');

  const dateParam = searchParams.get('date');
  const initialDate = dateParam ? new Date(dateParam) : undefined;

  const handleBookNow = (date?: Date, paymentMethod?: 'stripe' | 'cash') => {
    if (date) setSelectedDate(date);
    if (paymentMethod) setSelectedPaymentMethod(paymentMethod);
    setBookingModalOpen(true);
  };

  const handleMobileBookNow = () => {
    setBookingModalOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="aspect-video rounded-3xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="aspect-square rounded-2xl" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[500px] rounded-3xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !packageData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center pt-32">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Package not found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "This package doesn't exist or is not available."}
            </p>
            <Link to="/browse">
              <Button className="btn-shimmer text-white rounded-full">Browse Packages</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24 pb-24 lg:pb-8">
        {/* Back link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            to="/browse"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to results
          </Link>
        </motion.div>

        {/* Split Screen Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Side - Masonry Gallery (60%) */}
          <div className="lg:col-span-3 space-y-6">
            <MasonryGallery 
              images={packageData.images}
              coverImage={packageData.cover_image_url}
              packageName={packageData.name}
            />

            {/* Pro mini card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ProMiniCard
                vendorUserId={packageData.vendor_user_id}
                vendorName={packageData.vendor_name}
                vendorAvatar={packageData.vendor_avatar}
                vendorDisplayName={packageData.vendor_display_name}
                vendorLocation={packageData.vendor_location}
                vendorCategories={packageData.vendor_categories}
                isVerified={packageData.is_verified}
                avgRating={packageData.avg_rating}
                reviewCount={packageData.review_count}
              />
            </motion.div>

            {/* Package Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <PackageSummary
                name={packageData.name}
                description={packageData.description}
                category={packageData.category}
                type={packageData.type}
                pricingType={packageData.pricing_type}
                price={packageData.price}
                startingAt={packageData.starting_at}
                minUnits={packageData.min_units}
                minHours={packageData.min_hours}
                minGuests={packageData.min_guests}
                durationMinutes={packageData.duration_minutes}
                bookingMode={packageData.booking_mode}
                travelRadius={packageData.travel_radius}
                pickupOnly={packageData.pickup_only}
                setupTime={packageData.setup_time_minutes}
              />

              <PackageDetails
                includes={packageData.includes}
                addOns={packageData.add_ons}
                requirements={packageData.requirements}
                customerRequirements={packageData.customer_requirements}
                setupTimeMinutes={packageData.setup_time_minutes}
                breakdownTimeMinutes={packageData.breakdown_time_minutes}
                travelRadius={packageData.travel_radius}
                travelFeePerMile={packageData.travel_fee_per_mile}
                includedTravelMiles={packageData.included_travel_miles}
                pickupOnly={packageData.pickup_only}
                cancellationPolicy={packageData.cancellation_policy}
                avgRating={packageData.avg_rating}
                reviewCount={packageData.review_count}
              />
            </motion.div>
          </div>

          {/* Right Side - Glass Booking Dock (40%) */}
          <div className="hidden lg:block lg:col-span-2">
            <GlassBookingDock
              packageId={packageData.id}
              packageName={packageData.name}
              price={packageData.price}
              type={packageData.type}
              pricingType={packageData.pricing_type}
              minUnits={packageData.min_units}
              bookingMode={packageData.booking_mode}
              paymentOptions={packageData.payment_options}
              vendorStripeStatus={packageData.vendor_stripe_status}
              onBookNow={handleBookNow}
              initialDate={initialDate}
            />
          </div>
        </div>
      </div>

      {/* Mobile booking bar */}
      <MobileBookingBar
        price={packageData.price}
        type={packageData.type}
        pricingType={packageData.pricing_type}
        bookingMode={packageData.booking_mode}
        onBookNow={handleMobileBookNow}
      />

      {/* Booking modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        packageId={packageData.id}
        packageName={packageData.name}
        price={packageData.price}
        type={packageData.type}
        pricingType={packageData.pricing_type}
        minUnits={packageData.min_units}
        bookingMode={packageData.booking_mode}
        paymentOptions={packageData.payment_options}
        vendorUserId={packageData.vendor_user_id}
        vendorName={packageData.vendor_name}
        vendorStripeStatus={packageData.vendor_stripe_status}
        initialDate={selectedDate || initialDate}
        initialPaymentMethod={selectedPaymentMethod}
      />
    </Layout>
  );
}
