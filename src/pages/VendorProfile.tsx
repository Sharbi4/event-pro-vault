import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PackageCard } from '@/components/vendors/PackageCard';
import { ReviewCard } from '@/components/vendors/ReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, MapPin, Clock, Zap, ShieldCheck, 
  Calendar, MessageCircle, ChevronLeft, Share2, Heart
} from 'lucide-react';
import { vendors, packages, reviews } from '@/data/vendors';

export default function VendorProfile() {
  const { id } = useParams();
  const vendor = vendors.find(v => v.id === id);
  const vendorPackages = packages.filter(p => p.vendorId === id);
  const vendorReviews = reviews.filter(r => r.vendorId === id);

  if (!vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Vendor not found</h1>
          <Link to="/browse">
            <Button variant="gradient">Browse Vendors</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const ratingBreakdown = {
    5: Math.floor(vendorReviews.length * 0.7),
    4: Math.floor(vendorReviews.length * 0.2),
    3: Math.floor(vendorReviews.length * 0.08),
    2: Math.floor(vendorReviews.length * 0.02),
    1: 0
  };

  return (
    <Layout>
      {/* Hero / Gallery */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={vendor.gallery[0]}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-24 left-4 lg:left-8">
          <Link to="/browse">
            <Button variant="glass" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-24 right-4 lg:right-8 flex gap-2">
          <Button variant="glass" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="glass" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header Card */}
            <Card variant="glass" className="p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {vendor.verificationStatus === 'verified' && (
                      <Badge variant="verified" className="gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    {vendor.instantBook && (
                      <Badge variant="gradient" className="gap-1">
                        <Zap className="w-3 h-3" />
                        Instant Book
                      </Badge>
                    )}
                    {vendor.badges.map(badge => (
                      <Badge key={badge} variant="glass">{badge}</Badge>
                    ))}
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {vendor.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <span className="capitalize">{vendor.categories.join(', ').replace(/-/g, ' ')}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {vendor.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Responds {vendor.responseTime}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-6 h-6 text-trust fill-trust" />
                      <span className="text-2xl font-bold text-foreground">{vendor.avgRating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{vendor.reviewCount} reviews</p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {vendor.bio}
              </p>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="packages" className="space-y-6">
              <TabsList className="w-full justify-start bg-card border border-border p-1 gap-1">
                <TabsTrigger value="packages" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Packages ({vendorPackages.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Reviews ({vendorReviews.length})
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {vendorPackages.map((pkg, index) => (
                    <div 
                      key={pkg.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <PackageCard pkg={pkg} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Rating Summary */}
                <Card variant="glass" className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold gradient-text mb-2">{vendor.avgRating}</div>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(vendor.avgRating)
                                ? 'text-trust fill-trust'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on {vendor.reviewCount} reviews
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">{rating}★</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-primary"
                              style={{ 
                                width: `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / vendor.reviewCount) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {ratingBreakdown[rating as keyof typeof ratingBreakdown]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                  {vendorReviews.map((review, index) => (
                    <div 
                      key={review.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card variant="glass" className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    Service Area
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Based in {vendor.location}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Service radius: {vendor.serviceRadius} miles
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vendor.travelFeeRules}
                  </p>
                </Card>

                <Card variant="glass" className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    Cancellation Policy
                  </h3>
                  <p className="text-muted-foreground">
                    {vendor.cancellationPolicy}
                  </p>
                </Card>

                {vendor.insuranceStatus && (
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-trust/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-trust" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Fully Insured</h3>
                        <p className="text-sm text-muted-foreground">
                          This vendor carries liability insurance for your protection
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Book Card */}
              <Card variant="gradient" className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Quick Book
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose a package above or request a custom quote
                </p>
                <Button variant="gradient" size="lg" className="w-full mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Request Custom Quote
                </Button>
              </Card>

              {/* Contact Info */}
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Response Time</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Typically responds {vendor.responseTime}</p>
                    <p className="text-sm text-muted-foreground">Fast responder</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </Layout>
  );
}
