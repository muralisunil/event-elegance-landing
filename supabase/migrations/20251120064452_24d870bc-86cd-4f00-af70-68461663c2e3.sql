-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'USA',
  postal_code TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  pricing_info TEXT,
  total_capacity INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  venue_type TEXT NOT NULL DEFAULT 'event_hall',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue_halls table
CREATE TABLE public.venue_halls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  hall_name TEXT NOT NULL,
  description TEXT,
  dimensions_length DECIMAL(10, 2) NOT NULL, -- in feet
  dimensions_width DECIMAL(10, 2) NOT NULL, -- in feet
  dimensions_height DECIMAL(10, 2), -- in feet
  layout_type TEXT NOT NULL CHECK (layout_type IN ('fixed', 'configurable', 'blank')),
  capacity INTEGER NOT NULL,
  stage_position TEXT, -- JSON string with stage coordinates
  has_stage BOOLEAN NOT NULL DEFAULT true,
  has_lobby BOOLEAN NOT NULL DEFAULT false,
  lobby_dimensions TEXT, -- JSON string with lobby info
  pricing_per_day DECIMAL(10, 2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue_obstructions table for pillars, walls, etc.
CREATE TABLE public.venue_obstructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hall_id UUID NOT NULL REFERENCES public.venue_halls(id) ON DELETE CASCADE,
  obstruction_type TEXT NOT NULL CHECK (obstruction_type IN ('pillar', 'wall', 'fixed_structure')),
  position_data TEXT NOT NULL, -- JSON string with coordinates
  dimensions TEXT, -- JSON string with width/depth/height
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue_amenities table
CREATE TABLE public.venue_amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  amenity_type TEXT NOT NULL CHECK (amenity_type IN ('parking', 'catering', 'audio_visual', 'wifi', 'accessibility', 'security', 'other')),
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue_images table
CREATE TABLE public.venue_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  hall_id UUID REFERENCES public.venue_halls(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('venue_exterior', 'venue_interior', 'hall', 'lobby', 'amenity')),
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_state ON public.venues(state);
CREATE INDEX idx_venues_is_active ON public.venues(is_active);
CREATE INDEX idx_venue_halls_venue_id ON public.venue_halls(venue_id);
CREATE INDEX idx_venue_halls_layout_type ON public.venue_halls(layout_type);
CREATE INDEX idx_venue_obstructions_hall_id ON public.venue_obstructions(hall_id);
CREATE INDEX idx_venue_amenities_venue_id ON public.venue_amenities(venue_id);
CREATE INDEX idx_venue_images_venue_id ON public.venue_images(venue_id);
CREATE INDEX idx_venue_images_hall_id ON public.venue_images(hall_id);

-- Create updated_at triggers
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_halls_updated_at
  BEFORE UPDATE ON public.venue_halls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_obstructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venues (public read, admin write)
CREATE POLICY "Anyone can view active venues"
  ON public.venues FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all venues"
  ON public.venues FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for venue_halls
CREATE POLICY "Anyone can view available halls"
  ON public.venue_halls FOR SELECT
  USING (is_available = true AND EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = venue_halls.venue_id AND venues.is_active = true
  ));

CREATE POLICY "Admins can manage all halls"
  ON public.venue_halls FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for venue_obstructions
CREATE POLICY "Anyone can view obstructions"
  ON public.venue_obstructions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.venue_halls 
    WHERE venue_halls.id = venue_obstructions.hall_id
  ));

CREATE POLICY "Admins can manage obstructions"
  ON public.venue_obstructions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for venue_amenities
CREATE POLICY "Anyone can view amenities"
  ON public.venue_amenities FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage amenities"
  ON public.venue_amenities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for venue_images
CREATE POLICY "Anyone can view images"
  ON public.venue_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage images"
  ON public.venue_images FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));