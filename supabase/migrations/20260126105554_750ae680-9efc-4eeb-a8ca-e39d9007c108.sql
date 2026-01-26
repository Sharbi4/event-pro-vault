-- Enable realtime for conversations table for live unread counts
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;