import { useState } from 'react';
import { MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendorMessages } from '@/hooks/useVendorMessages';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList } from './messaging/ConversationList';
import { ChatThread } from './messaging/ChatThread';
import { NewConversationDialog } from './messaging/NewConversationDialog';
import { TemplateManager } from './messaging/TemplateManager';

export function VendorMessages() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'messages' | 'templates'>('messages');
  
  const {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    sendMessage,
    markAsRead,
  } = useVendorMessages();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;
    sendMessage.mutate({ conversationId: activeConversationId, content });
  };

  const handleSelectConversation = (conv: typeof conversations[0]) => {
    setActiveConversationId(conv.id);
  };

  const handleBack = () => {
    setActiveConversationId(null);
  };

  const handleMarkAsRead = () => {
    if (activeConversationId) {
      markAsRead.mutate(activeConversationId);
    }
  };

  const handleNewConversation = (data: {
    clientEmail: string;
    clientName: string;
    subject?: string;
    initialMessage?: string;
  }) => {
    createConversation.mutate(data);
  };

  // Mobile: Show either list or thread
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'messages' | 'templates')} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <TabsList className="h-9">
              <TabsTrigger value="messages" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1.5">
                <Settings className="w-4 h-4" />
                Templates
              </TabsTrigger>
            </TabsList>
            {activeTab === 'messages' && !activeConversationId && (
              <NewConversationDialog
                onSubmit={handleNewConversation}
                isPending={createConversation.isPending}
              />
            )}
          </div>

          <TabsContent value="messages" className="flex-1 m-0">
            {activeConversation ? (
              <ChatThread
                conversation={activeConversation}
                messages={messages}
                isLoading={messagesLoading}
                isSending={sendMessage.isPending}
                onSend={handleSendMessage}
                onBack={handleBack}
                onMarkAsRead={handleMarkAsRead}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                isLoading={conversationsLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="templates" className="flex-1 m-0 p-4 overflow-y-auto">
            <TemplateManager />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop: Split pane
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'messages' | 'templates')} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList className="h-9">
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageCircle className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <Settings className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>
          {activeTab === 'messages' && (
            <NewConversationDialog
              onSubmit={handleNewConversation}
              isPending={createConversation.isPending}
            />
          )}
        </div>

        <TabsContent value="messages" className="flex-1 m-0">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 shrink-0">
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                isLoading={conversationsLoading}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 border-l">
              {activeConversation ? (
                <ChatThread
                  conversation={activeConversation}
                  messages={messages}
                  isLoading={messagesLoading}
                  isSending={sendMessage.isPending}
                  onSend={handleSendMessage}
                  onBack={handleBack}
                  onMarkAsRead={handleMarkAsRead}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg text-muted-foreground">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 m-0 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <TemplateManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
