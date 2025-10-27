-- Phase 2: Comprehensive Database Schema Updates

-- 2.1: Event Configuration Table (feature toggles and publishing)
CREATE TABLE IF NOT EXISTS public.event_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  feature_volunteers_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_sponsors_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_vendors_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_venues_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_schedule_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_logistics_enabled BOOLEAN NOT NULL DEFAULT true,
  feature_food_planning_enabled BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  invitation_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2: Guest Categories Table (VIP, VVIP, etc.)
CREATE TABLE IF NOT EXISTS public.event_guest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_level INTEGER NOT NULL DEFAULT 0,
  benefits TEXT,
  max_guests INTEGER,
  display_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add category_id to event_guests
ALTER TABLE public.event_guests 
ADD COLUMN IF NOT EXISTS guest_category_id UUID REFERENCES public.event_guest_categories(id) ON DELETE SET NULL;

-- 2.3: Food Planning Tables
CREATE TABLE IF NOT EXISTS public.event_food_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks', 'other')),
  session_time TIME,
  location TEXT,
  estimated_attendees INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_session_id UUID NOT NULL REFERENCES public.event_food_sessions(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('veg', 'non-veg', 'vegan', 'gluten-free', 'other')),
  source TEXT,
  quantity TEXT,
  assigned_volunteer_id UUID REFERENCES public.event_volunteers(id) ON DELETE SET NULL,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'prepared', 'served')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4: Event Invitations Table
CREATE TABLE IF NOT EXISTS public.event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.event_guests(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response TEXT CHECK (response IN ('accepted', 'declined', 'maybe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, guest_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.event_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_food_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_configurations
CREATE POLICY "Users can view their event configurations"
ON public.event_configurations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_configurations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create configurations for their events"
ON public.event_configurations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_configurations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event configurations"
ON public.event_configurations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_configurations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event configurations"
ON public.event_configurations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_configurations.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_guest_categories
CREATE POLICY "Users can view their event guest categories"
ON public.event_guest_categories FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_guest_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create guest categories for their events"
ON public.event_guest_categories FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_guest_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event guest categories"
ON public.event_guest_categories FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_guest_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event guest categories"
ON public.event_guest_categories FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_guest_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_food_sessions
CREATE POLICY "Users can view their event food sessions"
ON public.event_food_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_food_sessions.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create food sessions for their events"
ON public.event_food_sessions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_food_sessions.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event food sessions"
ON public.event_food_sessions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_food_sessions.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event food sessions"
ON public.event_food_sessions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_food_sessions.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_food_items
CREATE POLICY "Users can view their event food items"
ON public.event_food_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.event_food_sessions
  JOIN public.outreach_events ON outreach_events.id = event_food_sessions.event_id
  WHERE event_food_sessions.id = event_food_items.food_session_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create food items for their sessions"
ON public.event_food_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.event_food_sessions
  JOIN public.outreach_events ON outreach_events.id = event_food_sessions.event_id
  WHERE event_food_sessions.id = event_food_items.food_session_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event food items"
ON public.event_food_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.event_food_sessions
  JOIN public.outreach_events ON outreach_events.id = event_food_sessions.event_id
  WHERE event_food_sessions.id = event_food_items.food_session_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event food items"
ON public.event_food_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.event_food_sessions
  JOIN public.outreach_events ON outreach_events.id = event_food_sessions.event_id
  WHERE event_food_sessions.id = event_food_items.food_session_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_invitations
CREATE POLICY "Users can view their event invitations"
ON public.event_invitations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_invitations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create invitations for their events"
ON public.event_invitations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_invitations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event invitations"
ON public.event_invitations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_invitations.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event invitations"
ON public.event_invitations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_invitations.event_id
  AND outreach_events.user_id = auth.uid()
));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_event_configurations_updated_at
  BEFORE UPDATE ON public.event_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_guest_categories_updated_at
  BEFORE UPDATE ON public.event_guest_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_food_sessions_updated_at
  BEFORE UPDATE ON public.event_food_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_food_items_updated_at
  BEFORE UPDATE ON public.event_food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();