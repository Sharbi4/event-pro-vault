import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add notification helper
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    return newNotification;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to real-time events
  useEffect(() => {
    if (!user?.id) return;

    // Channel for Vendor booking notifications
    const bookingsChannel = supabase
      .channel('user-booking-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `vendor_user_id=eq.${user.id}`,
        },
        (payload) => {
          const booking = payload.new as { 
            event_date: string; 
            event_location: string;
            total_price: number;
            status: string;
          };
          
          addNotification({
            type: 'booking',
            title: 'New Booking Request',
            description: `${booking.event_location} on ${new Date(booking.event_date).toLocaleDateString()}`,
            data: { booking },
          });
          
          toast.success('New booking received!', {
            description: `${booking.event_location} - $${booking.total_price}`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `vendor_user_id=eq.${user.id}`,
        },
        (payload) => {
          const booking = payload.new as { 
            status: string; 
            payment_status: string;
            event_location: string;
          };
          const oldBooking = payload.old as { status: string; payment_status: string };
          
          // Notify on status changes
          if (booking.status !== oldBooking.status) {
            if (booking.status === 'cancelled') {
              addNotification({
                type: 'booking',
                title: 'Booking Cancelled',
                description: `${booking.event_location} has been cancelled`,
                data: { booking },
              });
              toast.warning('Booking cancelled', {
                description: booking.event_location,
              });
            } else if (booking.status === 'confirmed') {
              addNotification({
                type: 'booking',
                title: 'Booking Confirmed',
                description: `${booking.event_location} is now confirmed`,
                data: { booking },
              });
            }
          }
          
          // Notify on payment changes
          if (booking.payment_status !== oldBooking.payment_status) {
            if (booking.payment_status === 'deposit_paid') {
              addNotification({
                type: 'booking',
                title: 'Deposit Received',
                description: `Deposit paid for ${booking.event_location}`,
                data: { booking },
              });
              toast.success('Deposit received!');
            } else if (booking.payment_status === 'paid') {
              addNotification({
                type: 'booking',
                title: 'Full Payment Received',
                description: `Full payment received for ${booking.event_location}`,
                data: { booking },
              });
              toast.success('Payment complete!');
            }
          }
        }
      )
      .subscribe();

    // Channel for customer booking notifications (for customers viewing their bookings)
    const customerBookingsChannel = supabase
      .channel('customer-booking-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const booking = payload.new as { 
            status: string; 
            event_location: string;
          };
          const oldBooking = payload.old as { status: string };
          
          if (booking.status !== oldBooking.status) {
            if (booking.status === 'confirmed') {
              addNotification({
                type: 'booking',
                title: 'Booking Confirmed!',
                description: `Your booking for ${booking.event_location} has been confirmed`,
                data: { booking },
              });
              toast.success('Booking confirmed!', {
                description: booking.event_location,
              });
            } else if (booking.status === 'cancelled') {
              addNotification({
                type: 'booking',
                title: 'Booking Cancelled',
                description: `Your booking for ${booking.event_location} has been cancelled`,
                data: { booking },
              });
            }
          }
        }
      )
      .subscribe();

    // Channel for new reviews (Vendors)
    const reviewsChannel = supabase
      .channel('vendor-review-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `vendor_user_id=eq.${user.id}`,
        },
        (payload) => {
          const review = payload.new as { 
            rating: number; 
            reviewer_name: string;
            title: string | null;
          };
          
          addNotification({
            type: 'review',
            title: 'New Review',
            description: `${review.reviewer_name} left a ${review.rating}-star review`,
            data: { review },
          });
          
          toast.success('New review received!', {
            description: `${review.rating} stars from ${review.reviewer_name}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(customerBookingsChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [user?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
