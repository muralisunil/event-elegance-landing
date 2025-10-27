-- Phase 1: Database Schema Changes for Guest View & Calendar System

-- 1.1 Update personal_event_configurations table
ALTER TABLE personal_event_configurations
ADD COLUMN IF NOT EXISTS allow_guest_view BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_viewable_sections JSONB DEFAULT '["schedule", "food", "guests", "venues", "logistics"]'::jsonb;

COMMENT ON COLUMN personal_event_configurations.allow_guest_view IS 
'Allow logged-in guests to view event details (read-only). Only available for collaborative event types.';

COMMENT ON COLUMN personal_event_configurations.guest_viewable_sections IS 
'Array of sections guests can view: ["schedule", "food", "guests", "venues", "logistics"]';

-- 1.2 Create personal_event_guest_access table
CREATE TABLE IF NOT EXISTS personal_event_guest_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES personal_event_guests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_access_user ON personal_event_guest_access(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_access_invitation ON personal_event_guest_access(invitation_code);

-- Enable RLS
ALTER TABLE personal_event_guest_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal_event_guest_access
DROP POLICY IF EXISTS "Users can view their own guest access" ON personal_event_guest_access;
CREATE POLICY "Users can view their own guest access"
ON personal_event_guest_access FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event owners can view all guest access" ON personal_event_guest_access;
CREATE POLICY "Event owners can view all guest access"
ON personal_event_guest_access FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM personal_events pe
    WHERE pe.id = personal_event_guest_access.event_id
    AND pe.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own guest access" ON personal_event_guest_access;
CREATE POLICY "Users can insert their own guest access"
ON personal_event_guest_access FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own guest access" ON personal_event_guest_access;
CREATE POLICY "Users can update their own guest access"
ON personal_event_guest_access FOR UPDATE
USING (auth.uid() = user_id);

-- 1.3 Function to check if user has guest view access
CREATE OR REPLACE FUNCTION has_guest_view_access(
  p_event_id UUID,
  p_user_id UUID,
  p_section TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_allow_guest_view BOOLEAN;
  v_viewable_sections JSONB;
BEGIN
  -- Get configuration
  SELECT 
    allow_guest_view, 
    guest_viewable_sections 
  INTO 
    v_allow_guest_view, 
    v_viewable_sections
  FROM personal_event_configurations
  WHERE event_id = p_event_id;
  
  -- Check if guest view is enabled
  IF NOT v_allow_guest_view THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has access and section is allowed
  RETURN EXISTS (
    SELECT 1 
    FROM personal_event_guest_access
    WHERE event_id = p_event_id
    AND user_id = p_user_id
    AND v_viewable_sections @> to_jsonb(p_section)
  );
END;
$$;

-- 1.4 RLS Policies for guest read access to various tables

-- Food sessions
DROP POLICY IF EXISTS "Guests can view food sessions if enabled" ON personal_event_food_sessions;
CREATE POLICY "Guests can view food sessions if enabled"
ON personal_event_food_sessions FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'food')
  OR EXISTS (
    SELECT 1 FROM personal_events 
    WHERE id = personal_event_food_sessions.event_id 
    AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE event_id = personal_event_food_sessions.event_id
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Food items
DROP POLICY IF EXISTS "Guests can view food items if enabled" ON personal_event_food_items;
CREATE POLICY "Guests can view food items if enabled"
ON personal_event_food_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions fs
    WHERE fs.id = personal_event_food_items.food_session_id
    AND (
      has_guest_view_access(fs.event_id, auth.uid(), 'food')
      OR EXISTS (SELECT 1 FROM personal_events WHERE id = fs.event_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM personal_event_organizers WHERE event_id = fs.event_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  )
);

-- Schedules
DROP POLICY IF EXISTS "Guests can view schedules if enabled" ON personal_event_schedules;
CREATE POLICY "Guests can view schedules if enabled"
ON personal_event_schedules FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'schedule')
  OR EXISTS (SELECT 1 FROM personal_events WHERE id = personal_event_schedules.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM personal_event_organizers WHERE event_id = personal_event_schedules.event_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Guests list
DROP POLICY IF EXISTS "Guests can view other guests if enabled" ON personal_event_guests;
CREATE POLICY "Guests can view other guests if enabled"
ON personal_event_guests FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'guests')
  OR EXISTS (SELECT 1 FROM personal_events WHERE id = personal_event_guests.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM personal_event_organizers WHERE event_id = personal_event_guests.event_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Venues
DROP POLICY IF EXISTS "Guests can view venues if enabled" ON personal_event_venues;
CREATE POLICY "Guests can view venues if enabled"
ON personal_event_venues FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'venues')
  OR EXISTS (SELECT 1 FROM personal_events WHERE id = personal_event_venues.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM personal_event_organizers WHERE event_id = personal_event_venues.event_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Logistics
DROP POLICY IF EXISTS "Guests can view logistics if enabled" ON personal_event_logistics;
CREATE POLICY "Guests can view logistics if enabled"
ON personal_event_logistics FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'logistics')
  OR EXISTS (SELECT 1 FROM personal_events WHERE id = personal_event_logistics.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM personal_event_organizers WHERE event_id = personal_event_logistics.event_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);