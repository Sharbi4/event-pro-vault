-- Add RLS policy to allow clients to create conversations with vendors
CREATE POLICY "Clients can create conversations with vendors" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = client_user_id);