import { useMemo } from 'react';
import { SlotBooking } from '@/hooks/useMarketSpaceDashboard';
import { addHours, isPast, parseISO } from 'date-fns';

const PLATFORM_FEE_RATE = 0.129; // 12.9% commission from market host
const CUSTOMER_FEE_RATE = 0.129; // 12.9% added to customer at checkout
const STRIPE_FEE_RATE = 0.029; // ~2.9% Stripe processing fee
const STRIPE_FIXED_FEE = 0.30; // $0.30 per transaction
const PAYOUT_DELAY_HOURS = 24; // Payout released 24 hours after event

export interface EarningsBreakdown {
  slotPrice: number;
  customerFee: number;
  totalCharged: number;
  platformFee: number;
  stripeFee: number;
  netPayout: number;
}

export interface MarketEarnings {
  totalEarnings: number;
  pendingPayouts: number;
  availableBalance: number;
  completedBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  recentPayouts: PayoutRecord[];
}

export interface PayoutRecord {
  id: string;
  date: string;
  slotTypeName: string;
  slotPrice: number;
  platformFee: number;
  stripeFee: number;
  netPayout: number;
  status: 'pending' | 'available' | 'paid';
  availableAt: string;
}

export function calculateEarningsBreakdown(slotPrice: number): EarningsBreakdown {
  // Customer pays: slot price + 12.9% booking fee
  const customerFee = slotPrice * CUSTOMER_FEE_RATE;
  const totalCharged = slotPrice + customerFee;
  
  // Market host receives: slot price - 12.9% platform commission - Stripe fees
  const platformFee = slotPrice * PLATFORM_FEE_RATE;
  const stripeFee = (totalCharged * STRIPE_FEE_RATE) + STRIPE_FIXED_FEE;
  const netPayout = slotPrice - platformFee - stripeFee;
  
  return {
    slotPrice,
    customerFee,
    totalCharged,
    platformFee,
    stripeFee,
    netPayout: Math.max(0, netPayout),
  };
}

export function useMarketEarnings(bookings: SlotBooking[]): MarketEarnings {
  return useMemo(() => {
    const now = new Date();
    
    let totalEarnings = 0;
    let pendingPayouts = 0;
    let availableBalance = 0;
    let completedBookings = 0;
    let pendingBookings = 0;
    let upcomingBookings = 0;
    const recentPayouts: PayoutRecord[] = [];
    
    for (const booking of bookings) {
      // Skip cancelled bookings
      if ((booking.status as string) === 'cancelled') continue;
      
      const slotPrice = booking.totalPrice;
      const breakdown = calculateEarningsBreakdown(slotPrice);
      
      // Parse event date from inventory
      const eventDate = booking.inventoryDate 
        ? parseISO(booking.inventoryDate)
        : null;
      
      // Calculate when payout becomes available (24h after event)
      const payoutAvailableAt = eventDate 
        ? addHours(eventDate, PAYOUT_DELAY_HOURS)
        : null;
      
      let payoutStatus: 'pending' | 'available' | 'paid' = 'pending';
      
      if (booking.status === 'completed' && booking.paymentStatus === 'paid') {
        // Booking is complete and paid
        completedBookings++;
        totalEarnings += breakdown.netPayout;
        
        if (payoutAvailableAt && isPast(payoutAvailableAt)) {
          // 24h after event has passed - payout available
          availableBalance += breakdown.netPayout;
          payoutStatus = 'available';
        } else {
          // Still within 24h hold period
          pendingPayouts += breakdown.netPayout;
          payoutStatus = 'pending';
        }
      } else if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
        // Booking confirmed but event not completed yet
        upcomingBookings++;
        pendingPayouts += breakdown.netPayout;
        totalEarnings += breakdown.netPayout;
      } else if (booking.status === 'pending') {
        pendingBookings++;
      }
      
      // Add to recent payouts for display
      if (booking.paymentStatus === 'paid' && booking.status !== 'cancelled') {
        recentPayouts.push({
          id: booking.id,
          date: booking.inventoryDate || booking.createdAt,
          slotTypeName: booking.slotTypeName || 'Slot',
          slotPrice,
          platformFee: breakdown.platformFee,
          stripeFee: breakdown.stripeFee,
          netPayout: breakdown.netPayout,
          status: payoutStatus,
          availableAt: payoutAvailableAt?.toISOString() || '',
        });
      }
    }
    
    // Sort recent payouts by date descending
    recentPayouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      totalEarnings,
      pendingPayouts,
      availableBalance,
      completedBookings,
      pendingBookings,
      upcomingBookings,
      recentPayouts: recentPayouts.slice(0, 10), // Last 10 payouts
    };
  }, [bookings]);
}
