import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useBookings } from '@/hooks/useBookings';
import { vendors, packages } from '@/data/vendors';
import { 
  Calendar, MapPin, Clock, Heart, Package, 
  User, LogOut, ChevronRight, Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, toggleFavorite } = useFavorites();
  const { bookings, loading: bookingsLoading } = useBookings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card border border-border p-1 gap-1">
            <TabsTrigger 
              value="bookings" 
              className="flex-1 data-[state=active]:gradient-primary data-[state=active]:text-white gap-2"
            >
              <Package className="w-4 h-4" />
              My Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex-1 data-[state=active]:gradient-primary data-[state=active]:text-white gap-2"
            >
              <Heart className="w-4 h-4" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex-1 data-[state=active]:gradient-primary data-[state=active]:text-white gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <Card variant="glass" className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by browsing our amazing vendors
                </p>
                <Link to="/browse">
                  <Button variant="gradient">Browse Vendors</Button>
                </Link>
              </Card>
            ) : (
              bookings.map(booking => {
                const vendor = getVendor(booking.vendor_id);
                const pkg = getPackage(booking.package_id);
                
                return (
                  <Card key={booking.id} variant="glow" className="p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      {vendor && (
                        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden">
                          <img
                            src={vendor.gallery[0]}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {pkg?.name || 'Package'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {vendor?.name || 'Vendor'}
                            </p>
                          </div>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'verified' :
                            booking.status === 'completed' ? 'trust' :
                            booking.status === 'cancelled' ? 'destructive' :
                            'glass'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.event_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.event_location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.units} {pkg?.type === 'HOURLY' ? 'hours' : 'days'}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className="font-bold gradient-text">${booking.total_price}</span>
                          {vendor && (
                            <Link to={`/vendor/${vendor.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                View Vendor
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : favoriteVendors.length === 0 ? (
              <Card variant="glass" className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save vendors you like to find them easily later
                </p>
                <Link to="/browse">
                  <Button variant="gradient">Browse Vendors</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {favoriteVendors.map(vendor => (
                  <Card key={vendor.id} variant="glow" className="overflow-hidden">
                    <div className="flex">
                      <div className="w-32 h-32">
                        <img
                          src={vendor.gallery[0]}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {vendor.categories[0].replace('-', ' ')}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(vendor.id)}
                            className="text-trust hover:text-trust/80"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <div className="mt-3">
                          <Link to={`/vendor/${vendor.id}`}>
                            <Button variant="gradient" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card variant="glass" className="p-6">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member since</label>
                  <p className="text-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
