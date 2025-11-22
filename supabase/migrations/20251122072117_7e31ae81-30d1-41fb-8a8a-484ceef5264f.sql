-- Add lobby and booth planning tables for Phase 5

-- Create venue_lobby_areas table
CREATE TABLE IF NOT EXISTS public.venue_lobby_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dimensions TEXT, -- JSON: {width, length, unit}
  location TEXT, -- Location description within venue
  max_booths INTEGER,
  amenities TEXT[], -- Array of amenity strings
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create venue_booths table to track booth configurations
CREATE TABLE IF NOT EXISTS public.venue_booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_area_id UUID NOT NULL REFERENCES public.venue_lobby_areas(id) ON DELETE CASCADE,
  booth_number TEXT NOT NULL,
  dimensions TEXT, -- JSON: {width, length, unit}
  position_data TEXT, -- JSON: {x, y} coordinates
  amenities TEXT[], -- Booth-specific amenities
  is_available BOOLEAN DEFAULT true,
  rental_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(lobby_area_id, booth_number)
);

-- Create event_booth_bookings table to track booth assignments to events
CREATE TABLE IF NOT EXISTS public.event_booth_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES public.venue_booths(id) ON DELETE CASCADE,
  vendor_name TEXT,
  vendor_contact TEXT,
  booking_status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  setup_requirements TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booth_id, event_id)
);

-- Add custom_booth_layout_data to venue_lobby_areas for Fabric.js layouts
ALTER TABLE public.venue_lobby_areas 
ADD COLUMN IF NOT EXISTS custom_booth_layout_data TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_lobby_areas_venue_id ON public.venue_lobby_areas(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_booths_lobby_area_id ON public.venue_booths(lobby_area_id);
CREATE INDEX IF NOT EXISTS idx_event_booth_bookings_event_id ON public.event_booth_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_booth_bookings_booth_id ON public.event_booth_bookings(booth_id);

-- Add triggers for updated_at
CREATE TRIGGER update_venue_lobby_areas_updated_at
  BEFORE UPDATE ON public.venue_lobby_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_booths_updated_at
  BEFORE UPDATE ON public.venue_booths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_booth_bookings_updated_at
  BEFORE UPDATE ON public.event_booth_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.venue_lobby_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_booth_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_lobby_areas (public read, authenticated write)
CREATE POLICY "Public can view lobby areas"
  ON public.venue_lobby_areas
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage lobby areas"
  ON public.venue_lobby_areas
  FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for venue_booths (public read, authenticated write)
CREATE POLICY "Public can view booths"
  ON public.venue_booths
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage booths"
  ON public.venue_booths
  FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for event_booth_bookings (users can manage their event bookings)
CREATE POLICY "Users can view booth bookings for their events"
  ON public.event_booth_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_events
      WHERE id = event_booth_bookings.event_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage booth bookings for their events"
  ON public.event_booth_bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_events
      WHERE id = event_booth_bookings.event_id
      AND user_id = auth.uid()
    )
  );