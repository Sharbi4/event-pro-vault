import { MessageCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomerMessages, CustomerConversation, CustomerMessage } from '@/hooks/useCustomerMessages';
import { useIsMobile } from '@/hooks/use-mobile';
import { maskContactInfo } from '@/lib/maskContactInfo';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CustomerMessages() {
  const isMobile = useIsMobile();
  const {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    markAsRead,
    totalUnreadCount,
  } = useCustomerMessages();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSelectConversation = (conv: CustomerConversation) => {
    setActiveConversationId(conv.id);
    // Mark as read when selecting
    if (conv.client_unread_count > 0) {
      markAsRead.mutate(conv.id);
    }
  };

  const handleBack = () => {
    setActiveConversationId(null);
  };

  // Mobile: Show either list or thread
  if (isMobile && activeConversation) {
    return (
      <ChatThread
        conversation={activeConversation}
        messages={messages}
        isLoading={messagesLoading}
        isSending={sendMessage.isPending}
        onSend={(content) => sendMessage.mutate({ conversationId: activeConversation.id, content })}
        onBack={handleBack}
      />
    );
  }

  if (isMobile) {
    return (
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        isLoading={conversationsLoading}
      />
    );
  }

  // Desktop: Split pane
  return (
    <div className="h-[500px] flex border rounded-lg overflow-hidden bg-card">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          isLoading={conversationsLoading}
        />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {activeConversation ? (
          <ChatThread
            conversation={activeConversation}
            messages={messages}
            isLoading={messagesLoading}
            isSending={sendMessage.isPending}
            onSend={(content) => sendMessage.mutate({ conversationId: activeConversation.id, content })}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg text-muted-foreground">
              Select a conversation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a conversation from the list to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation List Component
function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
}: {
  conversations: CustomerConversation[];
  activeId: string | null;
  onSelect: (conv: CustomerConversation) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-medium text-sm text-muted-foreground">No messages yet</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Start a conversation from an Event Pro's profile
        </p>
        <Link to="/browse">
          <Button variant="outline" size="sm" className="mt-3">
            Browse Event Pros
          </Button>
        </Link>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full p-3 text-left hover:bg-secondary/50 transition-colors ${
              activeId === conv.id ? 'bg-secondary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={conv.vendor_avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {(conv.vendor_name || 'E')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {conv.vendor_name || 'Vendor'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.subject || 'General inquiry'}
                </p>
                {conv.client_unread_count > 0 && (
                  <Badge variant="default" className="mt-1 h-5 text-[10px]">
                    {conv.client_unread_count} new
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

// Chat Thread Component
function ChatThread({
  conversation,
  messages,
  isLoading,
  isSending,
  onSend,
  onBack,
}: {
  conversation: CustomerConversation;
  messages: CustomerMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
  onBack: () => void;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSend(input.trim());
    setInput('');
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-secondary/30">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 md:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={conversation.vendor_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {(conversation.vendor_name || 'E')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">
            {conversation.vendor_name || 'Vendor'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.subject || 'General inquiry'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = msg.sender_type === 'client';
            const { maskedText, hasMaskedContent } = maskContactInfo(msg.content);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isClient
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-foreground rounded-bl-md'
                  }`}
                >
                  {hasMaskedContent ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm whitespace-pre-wrap cursor-help">{maskedText}</p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">
                          Contact info is hidden to keep transactions safe within the platform.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${isClient ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-secondary/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isSending} className="shrink-0">
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
