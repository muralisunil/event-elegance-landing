-- Enable RLS on personal_event_venues
ALTER TABLE personal_event_venues ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Event owners can manage venues" ON personal_event_venues;

-- Create policy for SELECT
CREATE POLICY "Event owners can view venues"
ON personal_event_venues
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- Create policy for INSERT
CREATE POLICY "Event owners can insert venues"
ON personal_event_venues
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- Create policy for UPDATE
CREATE POLICY "Event owners can update venues"
ON personal_event_venues
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);

-- Create policy for DELETE
CREATE POLICY "Event owners can delete venues"
ON personal_event_venues
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);