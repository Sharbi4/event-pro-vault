import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export interface CustomerConversation {
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
  // Joined vendor profile data
  vendor_name?: string;
  vendor_avatar?: string;
}

export interface CustomerMessage {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_type: 'vendor' | 'client';
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  attached_private_package_id?: string | null;
}

export function useCustomerMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations for the customer
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['customer-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch vendor profiles for each conversation
      const vendorIds = [...new Set(data.map(c => c.vendor_user_id))];
      const { data: vendorProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, avatar_url')
        .in('user_id', vendorIds);

      const vendorMap = new Map(
        vendorProfiles?.map(p => [p.user_id, p]) || []
      );

      return data.map(conv => ({
        ...conv,
        vendor_name: vendorMap.get(conv.vendor_user_id)?.display_name || 
                     vendorMap.get(conv.vendor_user_id)?.full_name || 
                     'Event Pro',
        vendor_avatar: vendorMap.get(conv.vendor_user_id)?.avatar_url,
      })) as CustomerConversation[];
    },
    enabled: !!user?.id,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['customer-conversation-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as CustomerMessage[];
    },
    enabled: !!activeConversationId,
  });

  // Calculate total unread count for customer
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.client_unread_count || 0), 0);

  // Real-time subscription for messages and conversations
  useEffect(() => {
    if (!user?.id) return;

    const messagesChannel = supabase
      .channel('customer-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as CustomerMessage;
          
          // Refetch conversations to update last_message_at and unread counts
          refetchConversations();
          
          // If message is for active conversation, refetch messages
          if (newMessage.conversation_id === activeConversationId) {
            refetchMessages();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refetch for read status updates
          if (activeConversationId) {
            refetchMessages();
          }
        }
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel('customer-conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          refetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user?.id, activeConversationId, refetchConversations, refetchMessages]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_user_id: user.id,
          sender_type: 'client',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last_message_at and increment vendor_unread_count
      // First get current count
      const { data: convData } = await supabase
        .from('conversations')
        .select('vendor_unread_count')
        .eq('id', conversationId)
        .single();

      const currentCount = convData?.vendor_unread_count || 0;

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          vendor_unread_count: currentCount + 1,
        })
        .eq('id', conversationId);

      // Send email notification to vendor (fire and forget)
      try {
        await supabase.functions.invoke('send-message-notification', {
          body: {
            conversationId,
            messageContent: content,
            senderType: 'client',
          },
        });
      } catch (notifError) {
        console.warn('Failed to send email notification:', notifError);
        // Don't fail the message send if notification fails
      }

      return data;
    },
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });

  // Mark conversation as read (for client)
  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Mark all unread messages in this conversation as read
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'vendor')
        .eq('is_read', false);

      // Reset client unread count
      const { error } = await supabase
        .from('conversations')
        .update({ client_unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchConversations();
    },
  });

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    markAsRead,
    totalUnreadCount,
  };
}
