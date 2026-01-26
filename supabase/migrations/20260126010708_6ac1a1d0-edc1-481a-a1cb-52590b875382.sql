-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id UUID NOT NULL,
  client_user_id UUID,
  client_email TEXT,
  client_name TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  vendor_unread_count INTEGER DEFAULT 0,
  client_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id UUID,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('vendor', 'client')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message_templates table
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Vendors can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = vendor_user_id);

CREATE POLICY "Clients can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = client_user_id);

CREATE POLICY "Vendors can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = vendor_user_id);

CREATE POLICY "Vendors can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = vendor_user_id);

CREATE POLICY "Clients can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = client_user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.vendor_user_id = auth.uid() OR c.client_user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_user_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.vendor_user_id = auth.uid() OR c.client_user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_user_id);

-- Message templates policies
CREATE POLICY "Users can view their own templates"
ON public.message_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.message_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.message_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.message_templates FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create indexes for performance
CREATE INDEX idx_conversations_vendor_user_id ON public.conversations(vendor_user_id);
CREATE INDEX idx_conversations_client_user_id ON public.conversations(client_user_id);
CREATE INDEX idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_message_templates_user_id ON public.message_templates(user_id);

-- Update trigger for conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for message_templates
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();