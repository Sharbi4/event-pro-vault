import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, Calendar, Package, Settings, CalendarX } from 'lucide-react';
import { VendorOverview } from '@/components/vendor-dashboard/VendorOverview';
import { VendorBookings } from '@/components/vendor-dashboard/VendorBookings';
import { VendorListings } from '@/components/vendor-dashboard/VendorListings';
import { VendorAvailability } from '@/components/vendor-dashboard/VendorAvailability';
const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
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
    updateBookingStatus
  } = useVendorDashboard();

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
              Manage your listings, bookings, and earnings
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Customer View
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4 hidden sm:inline" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4 hidden sm:inline" />
              Listings
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
            <VendorOverview
              bookings={bookings}
              packages={packages}
              totalEarnings={totalEarnings}
              pendingEarnings={pendingEarnings}
              upcomingBookings={upcomingBookings}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <VendorBookings
              bookings={bookings}
              onUpdateStatus={updateBookingStatus}
            />
          </TabsContent>

          <TabsContent value="listings">
            <VendorListings
              packages={packages}
              onCreate={createPackage}
              onUpdate={updatePackage}
              onDelete={deletePackage}
              onDuplicate={duplicatePackage}
            />
          </TabsContent>

          <TabsContent value="availability">
            <VendorAvailability />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">Business Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Business Name:</span> {vendorDetails?.business_name || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Business Type:</span> {vendorDetails?.business_type || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Service Area:</span> {vendorDetails?.service_area || 'Not set'}</p>
                  <p><span className="text-muted-foreground">Categories:</span> {vendorDetails?.service_categories?.join(', ') || 'None'}</p>
                </div>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/vendor-onboarding')}>
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
