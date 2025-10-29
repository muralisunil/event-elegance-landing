-- Drop the problematic policy that accesses auth.users
DROP POLICY IF EXISTS "Guests can view venues if enabled" ON personal_event_venues;

-- Drop the duplicate policy
DROP POLICY IF EXISTS "owners_full_access_venues" ON personal_event_venues;

-- Create a function to check if user email matches organizer
CREATE OR REPLACE FUNCTION public.is_personal_event_organizer_by_email(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM personal_event_organizers peo
    WHERE peo.event_id = _event_id
    AND peo.email = (SELECT email FROM auth.users WHERE id = _user_id)
  )
$$;

-- Recreate the guest view policy using the secure function
CREATE POLICY "Guests can view venues if enabled"
ON personal_event_venues
FOR SELECT
TO authenticated
USING (
  has_guest_view_access(event_id, auth.uid(), 'venues')
  OR EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
  OR is_personal_event_organizer_by_email(event_id, auth.uid())
);