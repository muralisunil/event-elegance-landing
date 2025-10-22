-- Create event_schedules table
CREATE TABLE public.event_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  session_title TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  speaker TEXT,
  location TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create event_guests table
CREATE TABLE public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'sent', 'accepted', 'declined')),
  rsvp_date TIMESTAMPTZ,
  dietary_preferences TEXT,
  special_requirements TEXT,
  num_accompanies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create event_logistics table
CREATE TABLE public.event_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('food', 'gifts', 'memos', 'awards', 'flowers', 'decoration', 'other')),
  item_name TEXT NOT NULL,
  quantity INTEGER,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  vendor TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'confirmed', 'delivered')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_schedules
CREATE POLICY "Users can view their event schedules"
  ON public.event_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_schedules.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create schedules for their events"
  ON public.event_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_schedules.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their event schedules"
  ON public.event_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_schedules.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their event schedules"
  ON public.event_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_schedules.event_id AND user_id = auth.uid()
  ));

-- RLS policies for event_guests
CREATE POLICY "Users can view their event guests"
  ON public.event_guests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_guests.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create guests for their events"
  ON public.event_guests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_guests.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their event guests"
  ON public.event_guests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_guests.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their event guests"
  ON public.event_guests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_guests.event_id AND user_id = auth.uid()
  ));

-- RLS policies for event_logistics
CREATE POLICY "Users can view their event logistics"
  ON public.event_logistics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_logistics.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create logistics for their events"
  ON public.event_logistics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_logistics.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their event logistics"
  ON public.event_logistics FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_logistics.event_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their event logistics"
  ON public.event_logistics FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.outreach_events 
    WHERE id = event_logistics.event_id AND user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_event_schedules_updated_at
  BEFORE UPDATE ON public.event_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_guests_updated_at
  BEFORE UPDATE ON public.event_guests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_logistics_updated_at
  BEFORE UPDATE ON public.event_logistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();