-- Fix RLS policies for personal_event_guests to avoid accessing auth.users table
DROP POLICY IF EXISTS "Guests can view their own guest record" ON personal_event_guests;
DROP POLICY IF EXISTS "Organizers can manage guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Event owners can manage guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Guests can view guests list if enabled" ON personal_event_guests;

-- Event owners can manage all guests
CREATE POLICY "Event owners can manage guests"
ON personal_event_guests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_guests.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- Organizers with edit permissions can manage guests
CREATE POLICY "Organizers can manage guests"
ON personal_event_guests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE personal_event_organizers.event_id = personal_event_guests.event_id
    AND personal_event_organizers.email = auth.email()
    AND personal_event_organizers.status = 'accepted'
    AND personal_event_organizers.can_edit = true
  )
);

-- Guests can view if guest view is enabled
CREATE POLICY "Guests can view guests list if enabled"
ON personal_event_guests
FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'guests'::text)
);