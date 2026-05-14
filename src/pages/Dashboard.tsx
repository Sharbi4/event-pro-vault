import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useBookings, BookingData } from '@/hooks/useBookings';
import { useUserDashboards } from '@/hooks/useUserDashboards';
import { useAdminReview } from '@/hooks/useAdminReview';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useCustomerMessages } from '@/hooks/useCustomerMessages';
import { AdminReviewTab } from '@/components/dashboard/AdminReviewTab';
import { AdminDisputesTab } from '@/components/dashboard/AdminDisputesTab';
import { CustomerMessages } from '@/components/dashboard/CustomerMessages';
import { PrivatePackagesList } from '@/components/messaging/PrivatePackagesList';
import { CancellationDialog } from '@/components/shared/CancellationDialog';
import { DepositRefundIndicator } from '@/components/shared/DepositRefundIndicator';
import { ReportIssueDialog } from '@/components/shared/ReportIssueDialog';
import { ReportIssueButton } from '@/components/shared/ReportIssueButton';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { EventCountdown } from '@/components/booking/EventCountdown';
import { BookingChecklist, generateBookingChecklist } from '@/components/booking/BookingChecklist';
import { AddToCalendarButton } from '@/components/booking/AddToCalendarButton';
import { BookingReceipt } from '@/components/booking/BookingReceipt';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { deriveBookingState, getBookingTab } from '@/lib/bookingState';
import { vendors, packages } from '@/data/vendors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { parseISO, isFuture } from 'date-fns';
import { 
  Calendar, MapPin, Clock, Heart, Package, 
  User, LogOut, ChevronRight, Loader2, Star, Search,
  CreditCard, CheckCircle, AlertCircle, Banknote, Users, ExternalLink, ShieldCheck, XCircle,
  MessageCircle, AlertTriangle, Bell, CalendarPlus, FileText
} from 'lucide-react';

interface ExtendedBooking extends BookingData {
  payment_status?: string;
  stripe_checkout_session_id?: string;
  deposit_amount?: number;
  final_amount?: number;
  deposit_paid_at?: string;
  final_paid_at?: string;
  deposit_percentage?: number;
  payment_method?: 'stripe' | 'cash';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, toggleFavorite } = useFavorites();
  const { bookings, loading: bookingsLoading, refetch } = useBookings();
  const { hasVendorPackages, loading: dashboardsLoading } = useUserDashboards();
  const { isAdmin, pendingEventPros } = useAdminReview();
  const { unreadCount: notificationCount } = useRealtimeNotifications();
  const { totalUnreadCount: messageUnreadCount } = useCustomerMessages();
  const { toast: toastHook } = useToast();
  const [payingBooking, setPayingBooking] = useState<string | null>(null);
  const [messagingBooking, setMessagingBooking] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string; is_vendor?: boolean; is_published?: boolean } | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<ExtendedBooking | null>(null);
  const [reportIssueDialogOpen, setReportIssueDialogOpen] = useState(false);
  const [bookingToReport, setBookingToReport] = useState<ExtendedBooking | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<ExtendedBooking | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [bookingConversations, setBookingConversations] = useState<Set<string>>(new Set());

  // Check which bookings have conversations
  useEffect(() => {
    if (user && bookings.length > 0) {
      const bookingIds = bookings.map(b => b.id);
      supabase
        .from('conversations')
        .select('booking_id')
        .eq('client_user_id', user.id)
        .in('booking_id', bookingIds)
        .then(({ data }) => {
          if (data) {
            setBookingConversations(new Set(data.map(c => c.booking_id).filter(Boolean) as string[]));
          }
        });
    }
  }, [user, bookings]);

  useEffect(() => {
    if (user && bookings.length > 0) {
      const bookingIds = bookings.map(b => b.id);
      supabase
        .from('reviews')
        .select('booking_id')
        .eq('reviewer_user_id', user.id)
        .in('booking_id', bookingIds)
        .then(({ data }) => {
          if (data) {
            setReviewedBookings(new Set(data.map(r => r.booking_id).filter(Boolean) as string[]));
          }
        });
    }
  }, [user, bookings]);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('display_name, is_vendor, is_published')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  // Handle payment success/cancelled from URL params
  useEffect(() => {
    const payment = searchParams.get('payment');
    const bookingId = searchParams.get('booking');
    const paymentType = searchParams.get('type') || 'deposit';
    
    if (payment === 'success' && bookingId) {
      verifyPayment(bookingId, paymentType);
    } else if (payment === 'cancelled') {
      toastHook({
        title: "Payment cancelled",
        description: "You can complete your payment later from your dashboard.",
        variant: "destructive"
      });
    }
    
    if (payment) {
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams]);

  const verifyPayment = async (bookingId: string, paymentType: string = 'deposit') => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-booking-payment', {
        body: { booking_id: bookingId, payment_type: paymentType }
      });

      if (error) throw error;

      if (data?.paid) {
        const isDeposit = data.payment_type === 'deposit';
        toastHook({
          title: isDeposit ? "Deposit paid!" : "Payment complete!",
          description: isDeposit 
            ? "Your booking is confirmed. Remaining balance due on event day."
            : "Your booking is fully paid.",
        });
        refetch();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handlePayNow = async (booking: ExtendedBooking) => {
    setPayingBooking(booking.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: { booking_id: booking.id }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toastHook({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setPayingBooking(null);
    }
  };

  const handleMessageVendor = async (booking: ExtendedBooking) => {
    if (!user || !booking.vendor_user_id) {
      toast.error('Unable to start conversation');
      return;
    }

    setMessagingBooking(booking.id);

    try {
      // Check if conversation already exists for this booking
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_user_id', user.id)
        .eq('vendor_user_id', booking.vendor_user_id)
        .eq('booking_id', booking.id)
        .maybeSingle();

      if (existingConvo) {
        // Navigate to messages tab - the CustomerMessages component will handle the conversation
        toast.success('Opening your conversation');
        navigate(`/dashboard?tab=messages`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          vendor_user_id: booking.vendor_user_id,
          client_user_id: user.id,
          client_name: profile?.display_name || user.email?.split('@')[0] || 'Customer',
          client_email: user.email,
          booking_id: booking.id,
          subject: `Booking: ${booking.package_name || 'Package'} - ${new Date(booking.event_date).toLocaleDateString()}`,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Conversation started! The vendor will be notified.');
      
      // Navigate to messages tab
      navigate(`/dashboard?tab=messages`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setMessagingBooking(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const favoriteVendors = vendors.filter(v => favorites.includes(v.id));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (booking: ExtendedBooking) => {
    const status = booking.status;
    const depositPaid = booking.deposit_paid_at;
    const finalPaid = booking.final_paid_at;
    
    if (status === 'awaiting_payment') {
      return (
        <Badge variant="glass" className="text-[10px] px-2 py-0.5 flex-shrink-0 gap-1 bg-amber-500/20 text-amber-500 border-amber-500/30">
          <CreditCard className="w-3 h-3" />
          Pay Deposit
        </Badge>
      );
    }
    
    if (finalPaid) {
      return (
        <Badge variant="verified" className="text-[10px] px-2 py-0.5 flex-shrink-0 gap-1">
          <CheckCircle className="w-3 h-3" />
          Fully Paid
        </Badge>
      );
    }
    
    if (depositPaid) {
      return (
        <Badge variant="trust" className="text-[10px] px-2 py-0.5 flex-shrink-0 gap-1">
          <CheckCircle className="w-3 h-3" />
          Deposit Paid
        </Badge>
      );
    }
    
    return (
      <Badge 
        variant={
          status === 'confirmed' ? 'verified' :
          status === 'completed' ? 'trust' :
          status === 'cancelled' || status === 'declined' ? 'destructive' :
          'glass'
        }
        className="text-[10px] px-2 py-0.5 flex-shrink-0"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {profile?.display_name || 'My Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {hasVendorPackages && (
            <Button variant="outline" size="sm" onClick={() => navigate('/vendor-dashboard')} className="gap-2">
              <Users className="w-4 h-4" />
              vendor Dashboard
            </Button>
          )}
          {profile?.is_published && profile?.is_vendor && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/vendor/${user.id}`)} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Button>
          )}
          {!hasVendorPackages && (
            <Button variant="gradient" size="sm" onClick={() => navigate('/eventpro-onboarding')} className="gap-2">
              <Star className="w-4 h-4" />
              Become an Event Pro
            </Button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold gradient-text">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold gradient-text">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Favorites</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold gradient-text">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="w-full bg-secondary/50 border border-border/50 p-1 gap-1 flex-wrap h-auto">
            <TabsTrigger 
              value="bookings" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Messages
              {messageUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 min-w-4 p-0 text-[10px] flex items-center justify-center">
                  {messageUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger 
                  value="admin" 
                  className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Review
                  {pendingEventPros.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                      {pendingEventPros.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="disputes" 
                  className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Disputes
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Custom offers from vendors</h3>
              </div>
              <PrivatePackagesList role="customer" />
            </div>

            <div className="pt-2 border-t">
              <h3 className="text-sm font-semibold text-foreground mb-3 mt-2">Your bookings</h3>
            </div>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <Card variant="glass" className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">No bookings yet</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Find and book amazing event vendors
                </p>
                <Link to="/browse">
                  <Button variant="gradient" size="sm" className="gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Browse vendors
                  </Button>
                </Link>
              </Card>
            ) : (() => {
              const grouped = { pending: [] as ExtendedBooking[], upcoming: [] as ExtendedBooking[], past: [] as ExtendedBooking[], cancelled: [] as ExtendedBooking[] };
              for (const b of bookings) {
                const tab = getBookingTab(deriveBookingState(b as ExtendedBooking));
                grouped[tab].push(b as ExtendedBooking);
              }
              const renderList = (list: ExtendedBooking[], emptyLabel: string) =>
                list.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{emptyLabel}</p>
                ) : (
                  <div className="space-y-3">
                    {list.map((b) => (
                      <BookingCard
                        key={b.id}
                        booking={b}
                        isPaying={payingBooking === b.id}
                        isMessaging={messagingBooking === b.id}
                        onMessage={handleMessageVendor}
                        onPayNow={handlePayNow}
                        onCancel={(bk) => { setBookingToCancel(bk); setCancelDialogOpen(true); }}
                        onLeaveReview={reviewedBookings.has(b.id) ? undefined : (bk) => { setBookingToReview(bk); setReviewDialogOpen(true); }}
                      />
                    ))}
                  </div>
                );
              return (
                <Tabs defaultValue="upcoming" className="space-y-3">
                  <TabsList className="w-full bg-secondary/50 border border-border/50 p-1 gap-1">
                    <TabsTrigger value="pending" className="flex-1 text-xs gap-1.5">
                      Pending {grouped.pending.length > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{grouped.pending.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="flex-1 text-xs gap-1.5">
                      Upcoming {grouped.upcoming.length > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{grouped.upcoming.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex-1 text-xs">Past</TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex-1 text-xs">Cancelled</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending">{renderList(grouped.pending, 'No pending bookings.')}</TabsContent>
                  <TabsContent value="upcoming">{renderList(grouped.upcoming, 'No upcoming bookings.')}</TabsContent>
                  <TabsContent value="past">{renderList(grouped.past, 'No past bookings yet.')}</TabsContent>
                  <TabsContent value="cancelled">{renderList(grouped.cancelled, 'No cancelled bookings.')}</TabsContent>
                </Tabs>
              );
            })()}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <CustomerMessages />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-3">
            {favLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : favoriteVendors.length === 0 ? (
              <Card variant="glass" className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-trust/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-trust" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">No favorites yet</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Save vendors to find them later
                </p>
                <Link to="/browse">
                  <Button variant="gradient" size="sm" className="gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Browse vendors
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-3">
                {favoriteVendors.map(vendor => (
                  <Card key={vendor.id} variant="glow" className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={vendor.gallery[0]}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize truncate">
                          {vendor.categories[0].replace('-', ' ')}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-trust fill-trust" />
                          <span className="text-xs text-foreground font-medium">{vendor.avgRating}</span>
                          <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(vendor.id)}
                          className="w-8 h-8 rounded-full bg-trust/10 flex items-center justify-center text-trust hover:bg-trust/20 transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <Link to={`/vendor/${vendor.id}`}>
                          <Button variant="gradient" size="sm" className="h-8 text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card variant="glass" className="p-4">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">Member since</span>
                  <span className="text-sm text-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Total bookings</span>
                  <span className="text-sm font-medium gradient-text">{bookings.length}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Admin Review Tab */}
          {isAdmin && (
            <>
              <TabsContent value="admin">
                <AdminReviewTab />
              </TabsContent>
              <TabsContent value="disputes">
                <AdminDisputesTab />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Cancellation Dialog */}
        {bookingToCancel && (
          <CancellationDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            bookingId={bookingToCancel.id}
            bookingType="booking"
            totalPaid={
              ((bookingToCancel.deposit_amount || 0) + 
              (bookingToCancel.final_amount || 0)) / 100 || 
              bookingToCancel.total_price
            }
            eventDate={bookingToCancel.event_date}
            isPaid={!!bookingToCancel.deposit_paid_at || !!bookingToCancel.final_paid_at}
            onSuccess={() => {
              setBookingToCancel(null);
              refetch();
            }}
          />
        )}

        {/* Report Issue Dialog */}
        {bookingToReport && (
          <ReportIssueDialog
            open={reportIssueDialogOpen}
            onOpenChange={setReportIssueDialogOpen}
            bookingId={bookingToReport.id}
            eventDate={bookingToReport.event_date}
            eventEndTime={bookingToReport.end_time}
            packageName={bookingToReport.package_name}
            vendorName={bookingToReport.vendor_display_name}
            onSuccess={() => {
              setBookingToReport(null);
              refetch();
            }}
          />
        )}

        {/* Review Dialog */}
        {bookingToReview && bookingToReview.vendor_user_id && (
          <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={(open) => {
              setReviewDialogOpen(open);
              if (!open) setBookingToReview(null);
            }}
            bookingId={bookingToReview.id}
            vendorUserId={bookingToReview.vendor_user_id}
            vendorName={bookingToReview.vendor_display_name || 'vendor'}
            packageId={bookingToReview.package_id}
            packageName={bookingToReview.package_name}
            eventDate={bookingToReview.event_date}
            reviewerName={profile?.display_name || user.email?.split('@')[0] || 'Customer'}
          />
        )}
      </div>
    </Layout>
  );
}
