import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useBookings, BookingData } from '@/hooks/useBookings';
import { useSlotBookings } from '@/hooks/useSlotBookings';
import { SlotBookingsSection } from '@/components/dashboard/SlotBookingsSection';
import { vendors, packages } from '@/data/vendors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, MapPin, Clock, Heart, Package, 
  User, LogOut, ChevronRight, Loader2, Star, Search,
  CreditCard, CheckCircle, AlertCircle, Banknote, Store
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
  const { bookings: slotBookings, loading: slotBookingsLoading, cancelBooking } = useSlotBookings();
  const { toast } = useToast();
  const [payingBooking, setPayingBooking] = useState<string | null>(null);

  // Handle payment success/cancelled from URL params
  useEffect(() => {
    const payment = searchParams.get('payment');
    const bookingId = searchParams.get('booking');
    const paymentType = searchParams.get('type') || 'deposit';
    
    if (payment === 'success' && bookingId) {
      // Verify the payment
      verifyPayment(bookingId, paymentType);
    } else if (payment === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "You can complete your payment later from your dashboard.",
        variant: "destructive"
      });
    }
    
    // Clear the URL params
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
        toast({
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
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setPayingBooking(null);
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

  const getVendor = (vendorId: string) => vendors.find(v => v.id === vendorId);
  const getPackage = (packageId: string) => packages.find(p => p.id === packageId);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (booking: ExtendedBooking) => {
    const status = booking.status;
    const depositPaid = (booking as any).deposit_paid_at;
    const finalPaid = (booking as any).final_paid_at;
    
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
                My Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold gradient-text">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold gradient-text">{slotBookings.length}</p>
            <p className="text-xs text-muted-foreground">Market Spots</p>
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
          <TabsList className="w-full bg-secondary/50 border border-border/50 p-1 gap-1">
            <TabsTrigger 
              value="bookings" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="markets" 
              className="flex-1 text-xs data-[state=active]:gradient-primary data-[state=active]:text-white gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              Markets
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
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-3">
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
                    Browse Vendors
                  </Button>
                </Link>
              </Card>
            ) : (
              bookings.map(booking => {
                const vendor = getVendor(booking.vendor_id);
                const pkg = getPackage(booking.package_id);
                const isAwaitingPayment = booking.status === 'awaiting_payment';
                const extBooking = booking as ExtendedBooking;
                const depositAmount = ((extBooking as any).deposit_amount || 0) / 100;
                const finalAmount = ((extBooking as any).final_amount || 0) / 100;
                const depositPaid = (extBooking as any).deposit_paid_at;
                const finalPaid = (extBooking as any).final_paid_at;
                const needsFinalPayment = depositPaid && !finalPaid && finalAmount > 0;
                const paymentMethod = (extBooking as any).payment_method || 'stripe';
                const isCashPayment = paymentMethod === 'cash';
                
                return (
                  <Card key={booking.id} variant={isAwaitingPayment || needsFinalPayment ? 'gradient' : 'glow'} className="p-4">
                    <div className="flex gap-3">
                      {vendor && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={vendor.gallery[0]}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">
                              {pkg?.name || 'Package'}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {vendor?.name || 'Vendor'}
                            </p>
                          </div>
                          {getStatusBadge(extBooking)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.event_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.event_location}
                          </span>
                        </div>
                        {/* Payment method indicator */}
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {isCashPayment ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Banknote className="w-3 h-3" />
                              Cash payment
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CreditCard className="w-3 h-3" />
                              Online payment
                            </span>
                          )}
                        </div>
                        {/* Payment breakdown - only for Stripe payments */}
                        {!isCashPayment && (depositAmount > 0 || finalAmount > 0) && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            <span className={depositPaid ? 'text-green-500' : ''}>
                              Deposit: ${depositAmount.toFixed(0)} {depositPaid ? '✓' : ''}
                            </span>
                            {' · '}
                            <span className={finalPaid ? 'text-green-500' : ''}>
                              Balance: ${finalAmount.toFixed(0)} {finalPaid ? '✓' : ''}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                          <span className="font-bold text-sm gradient-text">${booking.total_price}</span>
                          <div className="flex items-center gap-2">
                            {/* Only show Pay Now for Stripe bookings awaiting payment */}
                            {isAwaitingPayment && !isCashPayment && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-7 text-xs gap-1 px-3"
                                onClick={() => handlePayNow(booking as ExtendedBooking)}
                                disabled={payingBooking === booking.id}
                              >
                                {payingBooking === booking.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CreditCard className="w-3 h-3" />
                                )}
                                Pay Now
                              </Button>
                            )}
                            {/* For cash bookings awaiting payment, show info */}
                            {isAwaitingPayment && isCashPayment && (
                              <Badge variant="secondary" className="text-[10px] h-6">
                                <Banknote className="w-3 h-3 mr-1" />
                                Pay at event
                              </Badge>
                            )}
                            {vendor && (
                              <Link to={`/vendor/${vendor.id}`}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
                                  View
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Market Bookings Tab */}
          <TabsContent value="markets" className="space-y-3">
            <SlotBookingsSection 
              bookings={slotBookings}
              loading={slotBookingsLoading}
              onCancel={cancelBooking}
            />
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
                    Browse Vendors
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
        </Tabs>
      </div>
    </Layout>
  );
}
