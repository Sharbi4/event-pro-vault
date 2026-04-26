import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, MapPin, ShieldCheck, CheckCircle2, ChevronLeft,
  Package, Award, Globe, Zap, Clock, Calendar
} from 'lucide-react';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/shared/ShareButton';
import { ContactVendorButton } from '@/components/shared/ContactVendorButton';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { generateProSEO, SEO_CONFIG } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function ProProfile() {
  const { id, username } = useParams();
  const location = useLocation();
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(id);
  const [resolvingUsername, setResolvingUsername] = useState(false);

  // If we have a username instead of id, resolve it to user_id
  useEffect(() => {
    if (username && !id) {
      setResolvingUsername(true);
      supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single()
        .then(({ data, error }) => {
          if (data?.user_id) {
            setResolvedUserId(data.user_id);
          }
          setResolvingUsername(false);
        });
    } else if (id) {
      setResolvedUserId(id);
    }
  }, [id, username]);

  const { 
    profile, 
    packages, 
    loading: profileLoading, 
    error,
    avgRating,
    totalReviews
  } = useVendorProfile(resolvedUserId);

  const loading = profileLoading || resolvingUsername;

  // Dynamic SEO for Vendor profile pages
  const proSeo = profile ? generateProSEO({
    displayName: profile.displayName,
    businessName: profile.businessName,
    city: profile.serviceArea?.split(',')[0], // Extract city from service area
    bio: profile.shortBio || profile.businessDescription,
    image: profile.avatarUrl || profile.coverImageUrl,
  }) : null;

  useSEO({
    title: proSeo?.title || 'Vendor Profile | EventPro by Vendibook',
    description: proSeo?.description || 'View packages, reviews, and book this Vendor for your next event.',
    canonical: resolvedUserId ? `${SEO_CONFIG.baseUrl}/pro/${resolvedUserId}` : undefined,
    type: 'profile',
    image: proSeo?.image,
    keywords: [
      profile?.displayName || '',
      ...(profile?.serviceCategories || []),
      'event pro',
      'book Vendor',
      profile?.serviceArea || '',
      'event services marketplace',
    ].filter(Boolean),
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80" />
            ))}
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
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Pro not found</h1>
            <p className="text-muted-foreground mb-6">
              This Vendor profile doesn't exist or is not available.
            </p>
            <Link to="/">
              <Button variant="gradient">Browse Packages</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      {/* Vendor Structured Data */}
      <LocalBusinessJsonLd
        data={{
          id: resolvedUserId || '',
          name: profile.displayName || profile.businessName || 'Vendor',
          description: profile.shortBio || profile.businessDescription || '',
          image: profile.avatarUrl || profile.coverImageUrl,
          city: profile.serviceArea || undefined,
          rating: avgRating > 0 ? avgRating : undefined,
          reviewCount: totalReviews > 0 ? totalReviews : undefined,
          priceRange: '$$',
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://event-pro-vault.lovable.app/' },
          { name: 'Browse', url: 'https://event-pro-vault.lovable.app/browse' },
          { name: profile.displayName || profile.businessName || 'Vendor', url: `https://event-pro-vault.lovable.app/pro/${resolvedUserId}` },
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back link, Contact, and Share */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to browse
          </Link>
          <div className="flex items-center gap-2">
            <ContactVendorButton
              vendorUserId={resolvedUserId!}
              vendorName={profile.displayName || profile.businessName || 'Vendor'}
              variant="gradient"
            />
            <ShareButton
              url={profile.username ? `/eventpro/${profile.username}` : `/pro/${resolvedUserId}`}
              title={profile.displayName || profile.businessName || 'Vendor'}
              text={`Check out ${profile.displayName || profile.businessName} on Vendor!`}
            />
          </div>
        </div>

        {/* Hero section */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8 pb-8 border-b">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.businessName} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(profile.displayName || profile.fullName || profile.businessName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
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

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {profile.displayName || profile.businessName}
            </h1>

            {/* Rating */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({totalReviews} reviews)</span>
              </div>
            )}

            {/* Bio */}
            {profile.shortBio && (
              <p className="text-muted-foreground italic mb-3">"{profile.shortBio}"</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
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

            {/* Categories */}
            {profile.serviceCategories && profile.serviceCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.serviceCategories.map((cat, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {cat.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Packages section */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Packages ({packages.length})
          </h2>

          {packages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <Link 
                  key={pkg.id} 
                  to={`/package/${pkg.id}`}
                  className="block animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {pkg.images && pkg.images[0] ? (
                        <img
                          src={pkg.images[0]}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {pkg.instant_book && (
                          <Badge variant="gradient" className="gap-1 text-xs">
                            <Zap className="w-3 h-3" />
                            Instant
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {pkg.name}
                        </h3>
                        {pkg.avgRating && pkg.avgRating > 0 && (
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>{pkg.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {pkg.category && (
                        <Badge variant="outline" className="text-xs mb-2 capitalize">
                          {pkg.category.replace(/-/g, ' ')}
                        </Badge>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {pkg.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-lg gradient-text">${pkg.price}</span>
                          <span className="text-sm text-muted-foreground">
                            /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                          </span>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs gap-1">
                          {pkg.type === 'HOURLY' ? (
                            <><Clock className="w-3 h-3" /> Hourly</>
                          ) : (
                            <><Calendar className="w-3 h-3" /> Daily</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No packages yet</h3>
              <p className="text-muted-foreground text-sm">
                This Vendor hasn't added any packages yet.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
