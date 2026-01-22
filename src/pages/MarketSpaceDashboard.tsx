import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketSpaceDashboard } from '@/hooks/useMarketSpaceDashboard';
import { useUserDashboards } from '@/hooks/useUserDashboards';
import { OverviewTab } from '@/components/marketspace-dashboard/OverviewTab';
import { MarketListingTab } from '@/components/marketspace-dashboard/MarketListingTab';
import { SlotTypesTab } from '@/components/marketspace-dashboard/SlotTypesTab';
import { InventoryTab } from '@/components/marketspace-dashboard/InventoryTab';
import { BookingsTab } from '@/components/marketspace-dashboard/BookingsTab';
import { PayoutsTab } from '@/components/marketspace-dashboard/PayoutsTab';
import { SettingsTab } from '@/components/marketspace-dashboard/SettingsTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Loader2, 
  Settings, 
  Package, 
  Calendar, 
  ClipboardList,
  ExternalLink,
  AlertCircle,
  Users,
  LayoutDashboard,
  Wallet
} from 'lucide-react';

export default function MarketSpaceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [publishing, setPublishing] = useState(false);
  const [bookingMode, setBookingMode] = useState<'instant' | 'request'>('instant');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasVendorPackages } = useUserDashboards();
  
  const {
    market,
    marketId,
    slotTypes,
    inventory,
    bookings,
    loading,
    saving,
    updateMarket,
    saveSlotType,
    deleteSlotType,
    saveInventoryItem,
    deleteInventoryItem,
    bulkCreateInventory,
    updateBookingStatus,
    setSlotTypes,
    setInventory,
    refresh,
  } = useMarketSpaceDashboard();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?returnTo=/marketspace-dashboard');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // If no market exists, redirect to create page
  if (!marketId) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">No Market Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created a market yet. Let's get started!
            </p>
            <Button onClick={() => navigate('/marketspace/create')} variant="gradient">
              Create Your Market
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const handlePublish = async () => {
    if (!marketId) return;
    
    setPublishing(true);
    try {
      const { error } = await supabase
        .from('markets')
        .update({
          is_published: true,
          bookings_enabled: true,
          market_status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', marketId);

      if (error) throw error;

      toast({ title: 'Market published!', description: 'Vendors can now find and book your market.' });
      refresh();
    } catch (error) {
      console.error('Error publishing market:', error);
      toast({ title: 'Failed to publish', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const handleTogglePublished = async (published: boolean) => {
    await updateMarket({ isPublished: published, bookingsEnabled: published });
  };

  const handleUpdateBookingMode = async (mode: 'instant' | 'request') => {
    setBookingMode(mode);
    try {
      await supabase
        .from('markets')
        .update({ booking_mode: mode })
        .eq('id', marketId);
    } catch (error) {
      console.error('Error updating booking mode:', error);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  return (
    <Layout>
      <div className="min-h-screen pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {market.name || 'Your Market'}
                  </h1>
                  {market.isPublished ? (
                    <Badge className="bg-green-500">Live</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {market.city}{market.state ? `, ${market.state}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hasVendorPackages && (
                <Button variant="outline" onClick={() => navigate('/vendor-dashboard')} className="gap-2">
                  <Users className="w-4 h-4" />
                  Vendor Dashboard
                </Button>
              )}
              {market.isPublished && (
                <Button variant="outline" onClick={() => navigate(`/market/${marketId}`)} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Listing
                </Button>
              )}
              {!market.isPublished && (
                <Button 
                  variant="gradient" 
                  onClick={handlePublish}
                  disabled={publishing || slotTypes.length === 0 || inventory.length === 0}
                  className="gap-2"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Publish Market
                </Button>
              )}
            </div>
          </div>

          {/* Alert if not published */}
          {!market.isPublished && (
            <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-600">Your market is not published yet</p>
                  <p className="text-sm text-amber-600/80">
                    Add slot types and inventory, then publish to start accepting vendor reservations.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="listing" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <Settings className="w-4 h-4" />
                Listing
              </TabsTrigger>
              <TabsTrigger 
                value="slot-types" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <Package className="w-4 h-4" />
                Slot Types
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <Calendar className="w-4 h-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="bookings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 relative shrink-0"
              >
                <ClipboardList className="w-4 h-4" />
                Bookings
                {pendingBookings > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {pendingBookings}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="payouts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <Wallet className="w-4 h-4" />
                Payouts
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 shrink-0"
              >
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab
                market={market}
                slotTypes={slotTypes}
                inventory={inventory}
                bookings={bookings}
                onNavigateTab={setActiveTab}
                onPublish={handlePublish}
                publishing={publishing}
              />
            </TabsContent>

            <TabsContent value="listing" className="mt-6">
              <MarketListingTab
                market={market}
                updateMarket={updateMarket}
                saving={saving}
              />
            </TabsContent>

            <TabsContent value="slot-types" className="mt-6">
              <SlotTypesTab
                slotTypes={slotTypes}
                setSlotTypes={setSlotTypes}
                saveSlotType={saveSlotType}
                deleteSlotType={deleteSlotType}
                marketId={marketId}
              />
            </TabsContent>

            <TabsContent value="inventory" className="mt-6">
              <InventoryTab
                slotTypes={slotTypes}
                inventory={inventory}
                setInventory={setInventory}
                saveInventoryItem={saveInventoryItem}
                deleteInventoryItem={deleteInventoryItem}
                bulkCreateInventory={bulkCreateInventory}
                weeklySchedule={market.weeklySchedule}
              />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <BookingsTab
                bookings={bookings}
                slotTypes={slotTypes}
                updateBookingStatus={updateBookingStatus}
              />
            </TabsContent>

            <TabsContent value="payouts" className="mt-6">
              <PayoutsTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab
                market={market}
                bookingMode={bookingMode}
                onUpdateBookingMode={handleUpdateBookingMode}
                onTogglePublished={handleTogglePublished}
                saving={saving}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
