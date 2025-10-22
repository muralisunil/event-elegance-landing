-- Create enum for outreach event types
CREATE TYPE public.outreach_event_type AS ENUM (
  'workshop',
  'seminar',
  'community_service',
  'awareness_campaign',
  'fundraiser',
  'networking',
  'training',
  'volunteer'
);

-- Create outreach_events table
CREATE TABLE public.outreach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_types public.outreach_event_type[] NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own outreach events" 
ON public.outreach_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outreach events" 
ON public.outreach_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outreach events" 
ON public.outreach_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outreach events" 
ON public.outreach_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_outreach_events_updated_at
BEFORE UPDATE ON public.outreach_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();