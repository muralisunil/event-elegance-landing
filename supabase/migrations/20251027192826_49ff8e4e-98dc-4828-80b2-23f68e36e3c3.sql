-- Fix RLS policies for personal_event_food_sessions to avoid accessing auth.users table
DROP POLICY IF EXISTS "Guests can view food sessions if enabled" ON personal_event_food_sessions;

CREATE POLICY "Guests can view food sessions if enabled"
ON personal_event_food_sessions
FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'food'::text) 
  OR 
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_food_sessions.event_id 
    AND personal_events.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE personal_event_organizers.event_id = personal_event_food_sessions.event_id
    AND personal_event_organizers.email = auth.email()
    AND personal_event_organizers.status = 'accepted'
  )
);