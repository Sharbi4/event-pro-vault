import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Zap,
  MessageSquare,
  CalendarX,
  CalendarCheck,
  Settings2,
  Image as ImageIcon,
} from 'lucide-react';
import { format, addDays, getDay } from 'date-fns';
import { VendorPackage } from '@/hooks/useVendorDashboard';

interface PackageStatusCardProps {
  pkg: VendorPackage;
  weeklyAvailability?: { dayOfWeek: number; isEnabled: boolean }[];
  blockedDates?: string[];
  onEditAvailability?: () => void;
}

export function PackageStatusCard({
  pkg,
  weeklyAvailability = [],
  blockedDates = [],
  onEditAvailability,
}: PackageStatusCardProps) {
  const paymentOptions = (pkg as any).payment_options || 'ONLINE';
  const bookingMode = (pkg as any).booking_mode || 'INSTANT';

  // Calculate next available date
  const getNextAvailableDate = (): string | null => {
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const checkDate = addDays(today, i);
      const dayOfWeek = getDay(checkDate);
      const dateStr = format(checkDate, 'yyyy-MM-dd');

      const isDayEnabled = weeklyAvailability.find(d => d.dayOfWeek === dayOfWeek)?.isEnabled ?? true;
      const isBlocked = blockedDates.includes(dateStr);

      if (isDayEnabled && !isBlocked) {
        return format(checkDate, 'MMM d');
      }
    }
    return null;
  };

  const nextAvailable = getNextAvailableDate();
  const hasAvailability = weeklyAvailability.length > 0 && weeklyAvailability.some(d => d.isEnabled);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Image */}
          <div className="w-20 h-20 shrink-0 bg-muted relative">
            {pkg.images?.[0] ? (
              <img
                src={pkg.images[0]}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            {/* Status indicator */}
            <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              pkg.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate">{pkg.name}</h4>
                <p className="text-xs text-muted-foreground">
                  ${pkg.price}/{pkg.type === 'HOURLY' ? 'hr' : 'day'}
                </p>
              </div>
              <Badge 
                variant={pkg.is_active ? 'default' : 'secondary'} 
                className="text-[10px] shrink-0"
              >
                {pkg.is_active ? 'Active' : 'Draft'}
              </Badge>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {/* Booking mode */}
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 gap-0.5"
              >
                {bookingMode === 'INSTANT' ? (
                  <>
                    <Zap className="w-2.5 h-2.5" />
                    Instant
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-2.5 h-2.5" />
                    Request
                  </>
                )}
              </Badge>

              {/* Payment options */}
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 gap-0.5"
              >
                {paymentOptions === 'ONLINE' && (
                  <>
                    <CreditCard className="w-2.5 h-2.5" />
                    Online
                  </>
                )}
                {paymentOptions === 'CASH' && (
                  <>
                    <Banknote className="w-2.5 h-2.5" />
                    Cash
                  </>
                )}
                {paymentOptions === 'BOTH' && (
                  <>
                    <CreditCard className="w-2.5 h-2.5" />
                    Both
                  </>
                )}
              </Badge>

              {/* Availability status */}
              {hasAvailability ? (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 gap-0.5 text-green-600 border-green-300"
                >
                  <CalendarCheck className="w-2.5 h-2.5" />
                  {nextAvailable ? `Next: ${nextAvailable}` : 'Available'}
                </Badge>
              ) : (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 gap-0.5 text-amber-600 border-amber-300"
                >
                  <CalendarX className="w-2.5 h-2.5" />
                  Set availability
                </Badge>
              )}
            </div>
          </div>

          {/* Quick action */}
          {onEditAvailability && (
            <div className="flex items-center border-l border-border">
              <Button
                variant="ghost"
                size="sm"
                className="h-full rounded-none px-3"
                onClick={onEditAvailability}
                title="Edit availability"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
