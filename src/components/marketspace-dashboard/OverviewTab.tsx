import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Users,
  Share2,
  Plus,
  Flame
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { SlotType, SlotInventoryItem } from '@/hooks/useMarketSpaceOnboarding';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { MarketPayoutStatus } from './MarketPayoutStatus';

interface OverviewTabProps {
  market: {
    name: string;
    isPublished: boolean;
    mediaItems: any[];
  };
  slotTypes: SlotType[];
  inventory: SlotInventoryItem[];
  bookings: SlotBooking[];
  onNavigateTab: (tab: string) => void;
  onPublish: () => void;
  publishing: boolean;
}

export function OverviewTab({
  market,
  slotTypes,
  inventory,
  bookings,
  onNavigateTab,
  onPublish,
  publishing,
}: OverviewTabProps) {
  // Find next market day
  const today = new Date().toISOString().split('T')[0];
  const upcomingInventory = inventory
    .filter(inv => inv.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const nextMarketDay = upcomingInventory[0];
  
  // Calculate totals for next day
  const nextDayInventory = nextMarketDay 
    ? upcomingInventory.filter(inv => inv.date === nextMarketDay.date)
    : [];
  const totalSlotsNextDay = nextDayInventory.reduce((sum, inv) => sum + inv.totalSlots, 0);
  const remainingSlotsNextDay = nextDayInventory.reduce((sum, inv) => sum + inv.slotsRemaining, 0);
  const bookedPercentage = totalSlotsNextDay > 0 
    ? ((totalSlotsNextDay - remainingSlotsNextDay) / totalSlotsNextDay) * 100 
    : 0;

  // Publish checklist
  const hasBasics = !!market.name;
  const hasPhoto = market.mediaItems.length > 0;
  const hasSlotType = slotTypes.length > 0;
  const hasInventory = upcomingInventory.length > 0;
  const checklistItems = [
    { label: 'Market basics complete', done: hasBasics },
    { label: 'At least 1 photo uploaded', done: hasPhoto },
    { label: 'At least 1 slot type created', done: hasSlotType },
    { label: 'At least 1 inventory day added', done: hasInventory },
  ];
  const completedCount = checklistItems.filter(i => i.done).length;
  const canPublish = completedCount === checklistItems.length;

  // Pending bookings
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Payout Status Banner */}
      <MarketPayoutStatus variant="banner" onNavigateTab={onNavigateTab} />

      {/* Next Market Day Card */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Next Market Day</p>
              {nextMarketDay ? (
                <>
                  <h2 className="text-2xl font-bold mb-1">
                    {format(parseISO(nextMarketDay.date), 'EEEE, MMMM d')}
                  </h2>
                  <p className="text-sm opacity-80">
                    {nextMarketDay.startTime} - {nextMarketDay.endTime}
                  </p>
                </>
              ) : (
                <h2 className="text-xl font-bold">No upcoming dates</h2>
              )}
            </div>
            {nextMarketDay && bookedPercentage >= 70 && (
              <Badge className="bg-white/20 text-white border-0 gap-1">
                <Flame className="w-3 h-3" />
                Selling Fast
              </Badge>
            )}
          </div>
          
          {nextMarketDay && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{remainingSlotsNextDay} spots remaining</span>
                <span>{totalSlotsNextDay - remainingSlotsNextDay} / {totalSlotsNextDay} booked</span>
              </div>
              <Progress value={bookedPercentage} className="h-2 bg-white/20" />
            </div>
          )}
        </div>
        
        {!nextMarketDay && (
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => onNavigateTab('inventory')}
            >
              <Plus className="w-4 h-4" />
              Add Your First Market Day
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigateTab('inventory')}
        >
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm">Add Inventory</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigateTab('slot-types')}
        >
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm">Add Slot Type</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigateTab('bookings')}
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm">View Bookings</span>
          {pendingBookings.length > 0 && (
            <Badge className="absolute -top-1 -right-1">{pendingBookings.length}</Badge>
          )}
        </Button>
        {market.isPublished && (
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
          >
            <Share2 className="w-5 h-5 text-primary" />
            <span className="text-sm">Share Link</span>
          </Button>
        )}
      </div>

      {/* Publish Checklist (if not published) */}
      {!market.isPublished && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Publish Checklist
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {checklistItems.length} complete
              </span>
            </div>
            
            <Progress value={(completedCount / checklistItems.length) * 100} className="h-2 mb-4" />
            
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={item.done ? 'text-muted-foreground line-through' : ''}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              variant="gradient" 
              className="w-full mt-6"
              disabled={!canPublish || publishing}
              onClick={onPublish}
            >
              {publishing ? 'Publishing...' : 'Publish Market'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{slotTypes.length}</div>
            <div className="text-sm text-muted-foreground">Slot Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{upcomingInventory.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Dates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {inventory.reduce((sum, inv) => sum + inv.slotsRemaining, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Spots Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{pendingBookings.length}</span>
              {pendingBookings.length > 0 && (
                <Badge className="bg-amber-500">{pendingBookings.length} new</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Pending Bookings</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
