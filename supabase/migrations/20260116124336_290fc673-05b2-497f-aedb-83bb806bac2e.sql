-- Create table to track sent payment reminders
CREATE TABLE public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'final_payment_7_days', 'final_payment_3_days', 'final_payment_due'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate reminders
CREATE UNIQUE INDEX idx_payment_reminders_unique ON public.payment_reminders (booking_id, reminder_type);

-- Enable RLS
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert/read (for edge functions)
CREATE POLICY "Service role can manage reminders"
ON public.payment_reminders
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;