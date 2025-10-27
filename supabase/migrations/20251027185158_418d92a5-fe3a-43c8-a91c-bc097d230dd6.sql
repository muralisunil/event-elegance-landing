-- Fix RLS policies for personal event tables - correct version

-- personal_event_food_sessions
DROP POLICY IF EXISTS "guest_view_food_sessions" ON personal_event_food_sessions;

CREATE POLICY "owners_full_access_food_sessions"
ON personal_event_food_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_food_sessions.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- personal_event_food_items
DROP POLICY IF EXISTS "guest_view_food_items" ON personal_event_food_items;

CREATE POLICY "owners_full_access_food_items"
ON personal_event_food_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions
    JOIN personal_events ON personal_events.id = personal_event_food_sessions.event_id
    WHERE personal_event_food_sessions.id = personal_event_food_items.food_session_id
    AND personal_events.user_id = auth.uid()
  )
);

-- personal_event_schedules
DROP POLICY IF EXISTS "guest_view_schedules" ON personal_event_schedules;

CREATE POLICY "owners_full_access_schedules"
ON personal_event_schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_schedules.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- personal_event_guests
DROP POLICY IF EXISTS "guest_view_guests" ON personal_event_guests;

CREATE POLICY "owners_full_access_guests"
ON personal_event_guests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_guests.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- personal_event_venues
DROP POLICY IF EXISTS "guest_view_venues" ON personal_event_venues;

CREATE POLICY "owners_full_access_venues"
ON personal_event_venues
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- personal_event_logistics  
DROP POLICY IF EXISTS "guest_view_logistics" ON personal_event_logistics;

CREATE POLICY "owners_full_access_logistics"
ON personal_event_logistics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_logistics.event_id
    AND personal_events.user_id = auth.uid()
  )
);