import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { CreatePrivatePackageDrawer } from '@/components/messaging/CreatePrivatePackageDrawer';
import type { Conversation, Message } from '@/hooks/useVendorMessages';

interface ChatThreadProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
  onBack: () => void;
  onMarkAsRead: () => void;
}

export function ChatThread({
  conversation,
  messages,
  isLoading,
  isSending,
  onSend,
  onBack,
  onMarkAsRead,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [packageDrawerOpen, setPackageDrawerOpen] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (conversation.vendor_unread_count > 0) {
      onMarkAsRead();
    }
  }, [conversation.id, conversation.vendor_unread_count, onMarkAsRead]);

  const clientInitials = conversation.client_name
    ? conversation.client_name.slice(0, 2).toUpperCase()
    : conversation.client_email?.slice(0, 2).toUpperCase() || '??';

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = format(new Date(msg.created_at), 'MMMM d, yyyy');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3 flex items-center gap-3 bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {clientInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">
            {conversation.client_name || conversation.client_email}
          </h3>
          {conversation.subject && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.subject}
            </p>
          )}
        </div>

        {conversation.booking_id && (
          <Badge variant="secondary" className="gap-1 shrink-0">
            <Calendar className="w-3 h-3" />
            Booking
          </Badge>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setPackageDrawerOpen(true)}
          className="gap-1.5 shrink-0"
        >
          <Package className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send package</span>
        </Button>
      </div>

      <CreatePrivatePackageDrawer
        open={packageDrawerOpen}
        onOpenChange={setPackageDrawerOpen}
        conversationId={conversation.id}
        customerUserId={conversation.client_user_id}
        customerEmail={conversation.client_email}
      />

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} isVendor={true} />
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <MessageInput onSend={onSend} isSending={isSending} />
    </div>
  );
}
