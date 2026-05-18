-- Allow admins to insert messages into any support conversation
CREATE POLICY "Admins insert messages in any support conversation"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to update any support conversation (e.g. bump last_message_at)
CREATE POLICY "Admins update any support conversation"
ON public.support_conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));