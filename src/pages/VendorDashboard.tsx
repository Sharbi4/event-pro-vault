import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { useUserDashboards } from '@/hooks/useUserDashboards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, Calendar, Package, Settings, CalendarX, Wallet, Store, ExternalLink, User } from 'lucide-react';
import { VendorOverview } from '@/components/vendor-dashboard/VendorOverview';
import { VendorBookings } from '@/components/vendor-dashboard/VendorBookings';
import { VendorListings } from '@/components/vendor-dashboard/VendorListings';
import { VendorAvailability } from '@/components/vendor-dashboard/VendorAvailability';
import { VendorEarnings } from '@/components/vendor-dashboard/VendorEarnings';
import { AvatarUpload } from '@/components/vendor-dashboard/AvatarUpload';
import { CoverPhotoUpload } from '@/components/vendor-dashboard/CoverPhotoUpload';
import { StripeConnectBanner } from '@/components/vendor-dashboard/StripeConnectBanner';
import { ImageIcon } from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasMarket } = useUserDashboards();
  const {
    packages,
    bookings,
    profile,
    vendorDetails,
    loading,
    totalEarnings,
    pendingEarnings,
    upcomingBookings,
    createPackage,
    updatePackage,
    deletePackage,
    duplicatePackage,
    reorderPackages,
    updateBookingStatus,
    refetch
  } = useVendorDashboard();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  
  // Sync avatar and cover URL from profile/vendor details
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
    if (vendorDetails?.cover_image_url) {
      setCoverUrl(vendorDetails.cover_image_url);
    }
  }, [profile?.avatar_url, vendorDetails?.cover_image_url]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Redirect non-vendors to regular dashboard
    if (!loading && profile && !profile.is_vendor) {
      navigate('/dashboard');
    }
  }, [profile, loading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">
              {vendorDetails?.business_name || 'Vendor Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Manage your packages, bookings, and earnings
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {hasMarket && (
              <Button variant="outline" onClick={() => navigate('/marketspace-dashboard')} className="gap-2">
                <Store className="w-4 h-4" />
                Market Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/vendor/${user.id}`)} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <Wallet className="w-4 h-4 hidden sm:inline" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4 hidden sm:inline" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="w-4 h-4 hidden sm:inline" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <CalendarX className="w-4 h-4 hidden sm:inline" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4 hidden sm:inline" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Stripe Connect Banner */}
              <StripeConnectBanner 
                stripeStatus={profile?.stripe_account_status || null}
                onStatusChange={refetch}
              />
              
              <VendorOverview
                bookings={bookings}
                packages={packages}
                totalEarnings={totalEarnings}
                pendingEarnings={pendingEarnings}
                upcomingBookings={upcomingBookings}
              />
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <VendorEarnings bookings={bookings} />
          </TabsContent>

          <TabsContent value="bookings">
            <VendorBookings
              bookings={bookings}
              onUpdateStatus={updateBookingStatus}
            />
          </TabsContent>

          <TabsContent value="packages">
            <VendorListings
              packages={packages}
              onCreate={createPackage}
              onUpdate={updatePackage}
              onDelete={deletePackage}
              onDuplicate={duplicatePackage}
              onReorder={reorderPackages}
            />
          </TabsContent>

          <TabsContent value="availability">
            <VendorAvailability />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-6">
              {/* Profile Photo Section */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Profile Photo</h3>
                </div>
                <AvatarUpload
                  currentAvatarUrl={avatarUrl}
                  displayName={profile?.display_name || profile?.full_name}
                  onUploadComplete={(url) => {
                    setAvatarUrl(url || null);
                    refetch();
                  }}
                />
              </div>

              {/* Cover Photo Section */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-6">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Cover Photo</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This image appears as the header background on your public profile.
                </p>
                <CoverPhotoUpload
                  currentCoverUrl={coverUrl}
                  onUploadComplete={(url) => {
                    setCoverUrl(url || null);
                    refetch();
                  }}
                />
              </div>

              {/* Public Profile Section */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Public Profile</h3>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="text-muted-foreground">Display Name:</span> {profile?.display_name || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Bio:</span> {profile?.short_bio || 'Not set'}</p>
                  <p>
                    <span className="text-muted-foreground">Profile Status:</span>{' '}
                    <span className={profile?.is_published ? 'text-trust' : 'text-yellow-500'}>
                      {profile?.is_published ? 'Published' : 'Not Published'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate('/eventpro-onboarding')} className="gap-2">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" onClick={() => navigate(`/vendor/${user.id}`)} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Business Information */}
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">Business Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Business Name:</span> {vendorDetails?.business_name || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Business Type:</span> {vendorDetails?.business_type || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Service Area:</span> {vendorDetails?.service_area || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Categories:</span> {vendorDetails?.service_categories?.join(', ') || 'None'}</p>
                </div>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/eventpro-onboarding')}>
                  Edit Business Info
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">Account Status</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Stripe Status:</span>{' '}
                    <span className={profile?.stripe_account_status === 'active' ? 'text-trust' : 'text-yellow-500'}>
                      {profile?.stripe_account_status || 'Not connected'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">Payout Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your payout preferences and bank account details.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
