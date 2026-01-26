import { formatDistanceToNow } from 'date-fns';
import { Search, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useVendorMessages';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      conv.client_name?.toLowerCase().includes(query) ||
      conv.client_email?.toLowerCase().includes(query) ||
      conv.subject?.toLowerCase().includes(query)
    );
  });

  const activeConversations = filteredConversations.filter((c) => c.status === 'active');
  const archivedConversations = filteredConversations.filter((c) => c.status === 'archived');

  return (
    <div className="flex flex-col h-full border-r">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground mt-1">
                Start a conversation from a booking
              </p>
            )}
          </div>
        ) : (
          <div className="py-1">
            {activeConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onClick={() => onSelect(conv)}
              />
            ))}
            
            {archivedConversations.length > 0 && (
              <>
                <div className="px-3 py-2 mt-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Archived
                  </span>
                </div>
                {archivedConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeId}
                    onClick={() => onSelect(conv)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const clientInitials = conversation.client_name
    ? conversation.client_name.slice(0, 2).toUpperCase()
    : conversation.client_email?.slice(0, 2).toUpperCase() || '??';

  const hasUnread = conversation.vendor_unread_count > 0;
  const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), {
    addSuffix: false,
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50',
        isActive && 'bg-muted',
        hasUnread && 'bg-primary/5'
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={cn(
              'text-sm',
              hasUnread
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted-foreground/20 text-foreground'
            )}
          >
            {clientInitials}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'font-medium text-sm truncate',
              hasUnread && 'font-semibold'
            )}
          >
            {conversation.client_name || conversation.client_email}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {timeAgo}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {conversation.booking_id && (
            <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
            </Badge>
          )}
          <p className="text-xs text-muted-foreground truncate flex-1">
            {conversation.subject || 'No subject'}
          </p>
        </div>

        {hasUnread && (
          <Badge className="mt-1 h-4 text-[10px]">
            {conversation.vendor_unread_count} new
          </Badge>
        )}
      </div>
    </button>
  );
}
