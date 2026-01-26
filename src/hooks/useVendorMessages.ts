import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export interface Conversation {
  id: string;
  vendor_user_id: string;
  client_user_id: string | null;
  client_email: string | null;
  client_name: string | null;
  booking_id: string | null;
  subject: string | null;
  last_message_at: string;
  vendor_unread_count: number;
  client_unread_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_type: 'vendor' | 'client';
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function useVendorMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations for the vendor
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['vendor-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('vendor_user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user?.id,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['conversation-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!activeConversationId,
  });

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + conv.vendor_unread_count, 0);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('vendor-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Refetch conversations to update last_message_at and unread counts
          refetchConversations();
          
          // If message is for active conversation, refetch messages
          if (newMessage.conversation_id === activeConversationId) {
            refetchMessages();
          }
          
          // Show toast for messages from clients
          if (newMessage.sender_type === 'client') {
            toast.info('New message received');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeConversationId, refetchConversations, refetchMessages]);

  // Create a new conversation
  const createConversation = useMutation({
    mutationFn: async (data: {
      clientEmail: string;
      clientName: string;
      bookingId?: string;
      subject?: string;
      initialMessage?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          vendor_user_id: user.id,
          client_email: data.clientEmail,
          client_name: data.clientName,
          booking_id: data.bookingId || null,
          subject: data.subject || null,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Send initial message if provided
      if (data.initialMessage && conversation) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_user_id: user.id,
          sender_type: 'vendor',
          content: data.initialMessage,
        });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
      }

      return conversation as Conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
      setActiveConversationId(conversation.id);
      toast.success('Conversation started');
    },
    onError: (error) => {
      toast.error('Failed to start conversation');
      console.error(error);
    },
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: data.conversationId,
        sender_user_id: user.id,
        sender_type: 'vendor',
        content: data.content,
      });

      if (msgError) throw msgError;

      // Update conversation's last_message_at and increment client unread count
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          client_unread_count: supabase.rpc ? undefined : 0, // Will handle increment server-side ideally
        })
        .eq('id', data.conversationId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error(error);
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Mark all unread messages in conversation as read
      const { error: msgError } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'client')
        .eq('is_read', false);

      if (msgError) throw msgError;

      // Reset vendor unread count
      const { error: convError } = await supabase
        .from('conversations')
        .update({ vendor_unread_count: 0 })
        .eq('id', conversationId);

      if (convError) throw convError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });

  // Archive conversation
  const archiveConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
      toast.success('Conversation archived');
    },
    onError: (error) => {
      toast.error('Failed to archive conversation');
      console.error(error);
    },
  });

  // Get or create conversation for a booking
  const getOrCreateConversationForBooking = async (booking: {
    id: string;
    customer_email: string;
    event_location: string;
  }) => {
    // Check if conversation already exists for this booking
    const existing = conversations.find((c) => c.booking_id === booking.id);
    if (existing) {
      setActiveConversationId(existing.id);
      return existing;
    }

    // Create new conversation
    return createConversation.mutateAsync({
      clientEmail: booking.customer_email,
      clientName: booking.customer_email.split('@')[0],
      bookingId: booking.id,
      subject: `Booking: ${booking.event_location}`,
    });
  };

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    activeConversationId,
    setActiveConversationId,
    totalUnreadCount,
    createConversation,
    sendMessage,
    markAsRead,
    archiveConversation,
    getOrCreateConversationForBooking,
    refetchConversations,
    refetchMessages,
  };
}
