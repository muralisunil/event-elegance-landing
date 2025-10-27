-- Fix RLS policies for personal_event_organizers to avoid accessing auth.users table
DROP POLICY IF EXISTS "Event owners can manage organizers" ON personal_event_organizers;
DROP POLICY IF EXISTS "Organizers can view other organizers" ON personal_event_organizers;
DROP POLICY IF EXISTS "Users can view their organizer invitations" ON personal_event_organizers;

-- Event owners can manage all organizers
CREATE POLICY "Event owners can manage organizers"
ON personal_event_organizers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_organizers.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- Accepted organizers can view other organizers
CREATE POLICY "Organizers can view other organizers"
ON personal_event_organizers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_organizers self
    WHERE self.event_id = personal_event_organizers.event_id
    AND self.email = auth.email()
    AND self.status = 'accepted'
  )
);

-- Users can view and update their own organizer invitations
CREATE POLICY "Users can view their organizer invitations"
ON personal_event_organizers
FOR ALL
TO authenticated
USING (email = auth.email());