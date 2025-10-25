-- Phase 1: Create event_buildings and event_rooms tables

-- Buildings/Venues table
CREATE TABLE public.event_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  building_name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rooms table (belongs to a building)
CREATE TABLE public.event_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.event_buildings(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  capacity INTEGER,
  facilities TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update event_schedules table to add building and room references
ALTER TABLE public.event_schedules
ADD COLUMN building_id UUID REFERENCES public.event_buildings(id) ON DELETE SET NULL,
ADD COLUMN room_id UUID REFERENCES public.event_rooms(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.event_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_buildings
CREATE POLICY "Users can view their event buildings"
ON public.event_buildings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_buildings.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create buildings for their events"
ON public.event_buildings
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_buildings.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event buildings"
ON public.event_buildings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_buildings.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event buildings"
ON public.event_buildings
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_buildings.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS policies for event_rooms
CREATE POLICY "Users can view their event rooms"
ON public.event_rooms
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_rooms.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create rooms for their events"
ON public.event_rooms
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_rooms.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event rooms"
ON public.event_rooms
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_rooms.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event rooms"
ON public.event_rooms
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_rooms.event_id
  AND outreach_events.user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_event_buildings_updated_at
BEFORE UPDATE ON public.event_buildings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_rooms_updated_at
BEFORE UPDATE ON public.event_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_event_buildings_event_id ON public.event_buildings(event_id);
CREATE INDEX idx_event_rooms_event_id ON public.event_rooms(event_id);
CREATE INDEX idx_event_rooms_building_id ON public.event_rooms(building_id);
CREATE INDEX idx_event_schedules_building_id ON public.event_schedules(building_id);
CREATE INDEX idx_event_schedules_room_id ON public.event_schedules(room_id);

-- Add comments for documentation
COMMENT ON TABLE public.event_buildings IS 'Stores building/venue information for events that span multiple locations';
COMMENT ON TABLE public.event_rooms IS 'Stores room information within buildings for parallel session management';
COMMENT ON COLUMN public.event_schedules.building_id IS 'References the building where this session takes place';
COMMENT ON COLUMN public.event_schedules.room_id IS 'References the specific room where this session takes place';