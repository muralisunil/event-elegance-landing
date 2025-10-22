-- Add duration field to outreach_events table
ALTER TABLE public.outreach_events 
ADD COLUMN duration_minutes INTEGER;