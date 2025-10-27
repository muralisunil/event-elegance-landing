-- Fix RLS policies for personal_event_food_items to avoid accessing auth.users table
DROP POLICY IF EXISTS "Guests can view food items if enabled" ON personal_event_food_items;

CREATE POLICY "Guests can view food items if enabled"
ON personal_event_food_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions fs
    WHERE fs.id = personal_event_food_items.food_session_id
    AND (
      has_guest_view_access(fs.event_id, auth.uid(), 'food'::text)
      OR
      EXISTS (
        SELECT 1 FROM personal_events
        WHERE personal_events.id = fs.event_id 
        AND personal_events.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM personal_event_organizers
        WHERE personal_event_organizers.event_id = fs.event_id
        AND personal_event_organizers.email = auth.email()
        AND personal_event_organizers.status = 'accepted'
      )
    )
  )
);