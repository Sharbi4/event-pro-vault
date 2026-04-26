import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { useVendorMessages } from '@/hooks/useVendorMessages';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useDisputes } from '@/hooks/useDisputes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, LayoutDashboard, Calendar, Package, Settings, CalendarX, Wallet, ExternalLink, User, ImageIcon, Sparkles, MessageCircle, Bell, AlertTriangle, CalendarRange } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VendorOverview } from '@/components/vendor-dashboard/VendorOverview';
import { VendorBookings } from '@/components/vendor-dashboard/VendorBookings';
import { VendorListings } from '@/components/vendor-dashboard/VendorListings';
import { VendorAvailability } from '@/components/vendor-dashboard/VendorAvailability';
import { VendorEarnings } from '@/components/vendor-dashboard/VendorEarnings';
import { VendorMessages } from '@/components/vendor-dashboard/VendorMessages';
import { PrivatePackagesList } from '@/components/messaging/PrivatePackagesList';
import { VendorDisputes } from '@/components/vendor-dashboard/VendorDisputes';
import { BookingCommandCenter } from '@/components/vendor-dashboard/schedule/BookingCommandCenter';

import { AvatarUpload } from '@/components/vendor-dashboard/AvatarUpload';
import { CoverPhotoUpload } from '@/components/vendor-dashboard/CoverPhotoUpload';
import { ProfileQRCard } from '@/components/vendor-dashboard/ProfileQRCard';
import { StripeConnectBanner } from '@/components/vendor-dashboard/StripeConnectBanner';
import { ApprovalStatusBanner } from '@/components/shared/ApprovalStatusBanner';
import { StripeSetupCard } from '@/components/shared/StripeSetupCard';
import { VerificationCard } from '@/components/vendor-dashboard/VerificationCard';
import { IdentityVerificationTimeline } from '@/components/vendor-dashboard/IdentityVerificationTimeline';
const VendorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const stripeConnectReturn = searchParams.get('stripe_connect');
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
    reorderPackages,
    updateBookingStatus,
    refetch
  } = useVendorDashboard();

  const { totalUnreadCount, getOrCreateConversationForBooking, setActiveConversationId } = useVendorMessages();
  const { unreadCount: notificationUnreadCount } = useRealtimeNotifications();
  const { disputes } = useDisputes('Event Pro');
  const pendingDisputeCount = disputes.filter(d => d.status === 'pending' && !d.vendor_responded_at).length;
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  
  // Handler to message a client from booking card
  const handleMessageClient = async (booking: { id: string; customer_email: string; event_location: string }) => {
    await getOrCreateConversationForBooking(booking);
    setActiveTab('messages');
  };
  
  // Sync avatar and cover URL from profile/vendor details
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
    if (vendorDetails?.cover_image_url) {
      setCoverUrl(vendorDetails.cover_image_url);
    }
  }, [profile?.avatar_url, vendorDetails?.cover_image_url]);

  const { toast } = useToast();

  // Handle Stripe Connect return - check status and refresh
  useEffect(() => {
    if (!stripeConnectReturn || !user) return;
    
    const checkConnectStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) return;

        const { data, error } = await supabase.functions.invoke('check-connect-status', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!error && data) {
          refetch();
          if (data.status === 'active') {
            toast({ title: 'Stripe Connected!', description: 'You can now accept online payments.' });
          } else if (data.detailsSubmitted) {
            toast({ title: 'Almost there!', description: 'Stripe is verifying your account. This usually takes a few minutes.' });
          } else if (stripeConnectReturn === 'refresh') {
            toast({ title: 'Continue setup', description: 'Click "Connect Stripe" to resume where you left off.' });
          }
        }
      } catch (err) {
        console.error('Error checking connect status:', err);
      }
      
      // Clean up URL params
      setSearchParams((prev) => {
        prev.delete('stripe_connect');
        return prev;
      }, { replace: true });
    };

    checkConnectStatus();
  }, [stripeConnectReturn, user]);

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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-bold font-display truncate">
                {vendorDetails?.business_name || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Manage your packages, bookings, and earnings
              </p>
            </div>
            {/* Mobile: Compact actions */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/vendor/${user.id}`)}
                className="h-9 w-9"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="h-9 w-9"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Desktop: Full action bar */}
          <div className="hidden sm:flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/eventpro-best-practices')} 
              className="gap-2 border-primary/30 hover:bg-primary/5"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Best Practices Guide
            </Button>
            <Button variant="outline" onClick={() => navigate(`/vendor/${user.id}`)} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Tabs - Mobile: Horizontal scroll with icons only */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile Tab Bar - Fixed icons, scrollable */}
          <div className="sm:hidden -mx-3 px-3 overflow-x-auto">
            <TabsList className="w-max flex bg-muted/50 p-1 rounded-lg h-auto gap-0.5">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="earnings" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] font-medium">Earnings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <CalendarRange className="w-5 h-5" />
                <span className="text-[10px] font-medium">Schedule</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookings" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] font-medium">Bookings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="disputes" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] relative data-[state=active]:bg-background"
              >
                <div className="relative">
                  <AlertTriangle className="w-5 h-5" />
                  {pendingDisputeCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-4 min-w-4 px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      {pendingDisputeCount > 9 ? '9+' : pendingDisputeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Disputes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] relative data-[state=active]:bg-background"
              >
                <div className="relative">
                  <MessageCircle className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-4 min-w-4 px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Messages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="packages" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <Package className="w-5 h-5" />
                <span className="text-[10px] font-medium">Packages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="availability" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <CalendarX className="w-5 h-5" />
                <span className="text-[10px] font-medium">Availability</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex flex-col items-center gap-1 py-2 px-2 min-w-[56px] data-[state=active]:bg-background"
              >
                <Settings className="w-5 h-5" />
                <span className="text-[10px] font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Tab Bar */}
          <TabsList className="hidden sm:inline-grid w-auto grid-cols-9">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <Wallet className="w-4 h-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <CalendarRange className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="disputes" className="gap-2 relative">
              <AlertTriangle className="w-4 h-4" />
              Disputes
              {pendingDisputeCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] bg-destructive">
                  {pendingDisputeCount > 9 ? '9+' : pendingDisputeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 relative">
              <MessageCircle className="w-4 h-4" />
              Messages
              {totalUnreadCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] bg-destructive">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="w-4 h-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <CalendarX className="w-4 h-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Approval Status Banner */}
              <ApprovalStatusBanner 
                status={profile?.approval_status}
                notes={profile?.approval_notes}
                type="eventpro"
                onEditProfile={() => navigate('/eventpro-onboarding')}
              />
              
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
                onMessageClient={handleMessageClient}
              />
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <VendorEarnings bookings={bookings} />
          </TabsContent>

          <TabsContent value="schedule">
            <BookingCommandCenter
              onMessageClient={handleMessageClient}
              onUpdateStatus={updateBookingStatus}
            />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <VendorBookings
              bookings={bookings}
              onUpdateStatus={updateBookingStatus}
              onMessageClient={handleMessageClient}
            />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Private packages sent</h3>
              </div>
              <PrivatePackagesList role="Event Pro" />
            </div>
          </TabsContent>


          <TabsContent value="disputes">
            <VendorDisputes />
          </TabsContent>

          <TabsContent value="messages">
            <VendorMessages />
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
              {/* QR Code Section - Prominent at top */}
              <ProfileQRCard 
                username={profile?.username}
                userId={user.id}
                displayName={profile?.display_name || profile?.full_name}
              />

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

              {/* Stripe Payouts Setup - Detailed */}
              <StripeSetupCard 
                variant="Event Pro" 
                currentStatus={profile?.stripe_account_status}
                onStatusChange={refetch}
              />

              {/* Optional Identity Verification */}
              <VerificationCard
                status={profile?.identity_verification_status}
                onStatusChange={refetch}
              />

              {/* Webhook-driven verification status timeline */}
              <IdentityVerificationTimeline />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
