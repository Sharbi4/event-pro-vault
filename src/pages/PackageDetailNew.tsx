import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Package } from 'lucide-react';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { PackageGallery } from '@/components/package-detail/PackageGallery';
import { ProMiniCard } from '@/components/package-detail/ProMiniCard';
import { PackageSummary } from '@/components/package-detail/PackageSummary';
import { PackageDetails } from '@/components/package-detail/PackageDetails';
import { StickyBookingCard } from '@/components/package-detail/StickyBookingCard';
import { MobileBookingBar } from '@/components/package-detail/MobileBookingBar';
import { BookingModal } from '@/components/package-detail/BookingModal';
import { ShareButton } from '@/components/shared/ShareButton';

export default function PackageDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { packageData, reviews, loading, error } = usePackageDetail(id);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cash'>('stripe');

  // Parse date from search params if available
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
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-[21/9] rounded-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !packageData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Package not found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "This package doesn't exist or is not available."}
            </p>
            <Link to="/">
              <Button variant="gradient">Browse Packages</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Back link and Share */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to={searchParams.toString() ? `/?${searchParams.toString()}` : '/'}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to results
          </Link>
          <ShareButton
            url={`/package/${id}`}
            title={packageData.name}
            text={`Check out ${packageData.name} by ${packageData.vendor_display_name || packageData.vendor_name} on Event Pro!`}
          />
        </div>

        {/* Gallery */}
        <div className="mb-8">
          <PackageGallery 
            images={packageData.images}
            coverImage={packageData.cover_image_url}
            packageName={packageData.name}
          />
        </div>

        {/* Pro mini card */}
        <div className="mb-8">
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
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Package info */}
          <div className="lg:col-span-2 space-y-8">
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
              vendorBaseLat={packageData.vendor_base_lat}
              vendorBaseLng={packageData.vendor_base_lng}
              vendorName={packageData.vendor_display_name || packageData.vendor_name}
            />
          </div>

          {/* Right column - Booking card (desktop) */}
          <div className="hidden lg:block">
            <StickyBookingCard
              packageId={packageData.id}
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
