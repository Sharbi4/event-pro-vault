import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { VendorPackageCard } from '@/components/vendors/VendorPackageCard';
import { VendorReviewCard } from '@/components/vendors/VendorReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, MapPin, Zap, ShieldCheck, CheckCircle2,
  Calendar, MessageCircle, ChevronLeft, Share2, Heart,
  Package, Award, TrendingUp, Globe, Building2, Sparkles
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { AskPrivatePackageModal } from '@/components/growth/AskPrivatePackageModal';

export default function VendorProfile() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [askOpen, setAskOpen] = useState(false);
  const { 
    profile, 
    packages, 
    reviews, 
    loading, 
    error,
    avgRating,
    totalReviews,
    ratingBreakdown 
  } = useVendorProfile(id);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="space-y-6">
            <Skeleton className="h-[40vh] w-full rounded-xl" />
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Pro not found</h1>
            <p className="text-muted-foreground mb-6">
              This Event Pro profile doesn't exist or is not available.
            </p>
            <Link to="/browse">
              <Button variant="gradient">Browse Event Pros</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Get cover image - prefer Event Pro's custom cover, fallback to first package image
  const coverImage = profile.coverImageUrl || packages[0]?.images?.[0];

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'V';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      {/* Hero / Gallery */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {coverImage ? (
          <img
            src={coverImage}
            alt={profile.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}
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
          <Button 
            variant="glass" 
            size="icon"
            onClick={() => id && toggleFavorite(id)}
            className={isFavorite(id || '') ? 'text-trust' : ''}
          >
            <Heart className={`w-4 h-4 ${isFavorite(id || '') ? 'fill-current' : ''}`} />
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
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="w-20 h-20 border-4 border-background shadow-lg flex-shrink-0">
                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.businessName} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(profile.displayName || profile.fullName || profile.businessName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {profile.isVerified && (
                        <Badge className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Pro
                        </Badge>
                      )}
                      {profile.stripeAccountStatus === 'active' && (
                        <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                          <CheckCircle2 className="w-3 h-3" />
                          Payments Enabled
                        </Badge>
                      )}
                      {packages.some(p => p.instant_book) && (
                        <Badge variant="gradient" className="gap-1">
                          <Zap className="w-3 h-3" />
                          Instant Book
                        </Badge>
                      )}
                      {avgRating >= 4.5 && totalReviews >= 5 && (
                        <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          <Award className="w-3 h-3" />
                          Top Rated
                        </Badge>
                      )}
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {profile.businessName}
                    </h1>
                  </div>
                </div>
                  
                {/* Rating */}
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-bold text-foreground">
                          {avgRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Short bio */}
              {profile.shortBio && (
                <p className="text-muted-foreground italic mb-4">"{profile.shortBio}"</p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                {profile.businessType && (
                  <span className="capitalize">{profile.businessType.replace(/-/g, ' ')}</span>
                )}
                {profile.serviceArea && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.serviceArea}
                  </span>
                )}
                {profile.websiteUrl && (
                  <a 
                    href={profile.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Description */}
              {profile.businessDescription && (
                <p className="text-muted-foreground leading-relaxed">
                  {profile.businessDescription}
                </p>
              )}

              {/* Categories */}
              {profile.serviceCategories && profile.serviceCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {profile.serviceCategories.map((cat, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {cat.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="packages" className="space-y-6">
              <TabsList className="w-full justify-start bg-card border border-border p-1 gap-1">
                <TabsTrigger value="packages" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Packages ({packages.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Reviews ({totalReviews})
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1 md:flex-none data-[state=active]:gradient-primary data-[state=active]:text-white">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="space-y-6">
                {packages.length > 0 ? (
                  <>
                    {/* Top rated indicator */}
                    {packages[0]?.avgRating && packages[0].avgRating >= 4.5 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>Sorted by highest rated</span>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      {packages.map((pkg, index) => (
                        <div 
                          key={pkg.id} 
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <VendorPackageCard 
                            pkg={pkg} 
                            vendorUserId={profile.userId}
                            rank={index + 1}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card variant="glass" className="p-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No packages yet</h3>
                    <p className="text-muted-foreground text-sm">
                      This Event Pro hasn't added any packages yet.
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {totalReviews > 0 ? (
                  <>
                    {/* Rating Summary */}
                    <Card variant="glass" className="p-6">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="text-center md:text-left">
                          <div className="text-5xl font-bold gradient-text mb-2">
                            {avgRating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(avgRating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on {totalReviews} reviews
                          </p>
                        </div>
                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-8">{rating}★</span>
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                                  style={{ 
                                    width: totalReviews > 0 
                                      ? `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / totalReviews) * 100}%`
                                      : '0%'
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
                      {reviews.map((review, index) => (
                        <div 
                          key={review.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <VendorReviewCard review={review} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card variant="glass" className="p-12 text-center">
                    <Star className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Be the first to review this Event Pro!
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card variant="glass" className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    About {profile.businessName}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.businessDescription || 'No description provided.'}
                  </p>
                </Card>

                {profile.serviceArea && (
                  <Card variant="glass" className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-4">
                      Service Area
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{profile.serviceArea}</p>
                        <p className="text-sm text-muted-foreground">
                          Check individual packages for travel fees
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {profile.isVerified && (
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Verified Professional</h3>
                        <p className="text-sm text-muted-foreground">
                          Identity verified and payments enabled for secure transactions
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
                  Choose a package above, or ask for a private package built for your event.
                </p>
                <Button variant="gradient" size="lg" className="w-full mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setAskOpen(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask about a private package
                </Button>
              </Card>

              {/* Stats Card */}
              <Card variant="glass" className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Packages</span>
                    <span className="font-semibold text-foreground">{packages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Reviews</span>
                    <span className="font-semibold text-foreground">{totalReviews}</span>
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
      {profile && (
        <AskPrivatePackageModal
          open={askOpen}
          onOpenChange={setAskOpen}
          vendorUserId={profile.userId}
          vendorName={profile.displayName || profile.fullName || 'this Vendor'}
        />
      )}
    </Layout>
  );
}
