-- Drop existing RLS policies on personal_event_venues if they exist
DROP POLICY IF EXISTS "Users can manage venues for their events" ON personal_event_venues;
DROP POLICY IF EXISTS "Event owners can manage venues" ON personal_event_venues;
DROP POLICY IF EXISTS "Users can view venues" ON personal_event_venues;
DROP POLICY IF EXISTS "Users can insert venues" ON personal_event_venues;
DROP POLICY IF EXISTS "Users can update venues" ON personal_event_venues;
DROP POLICY IF EXISTS "Users can delete venues" ON personal_event_venues;

-- Enable RLS on personal_event_venues
ALTER TABLE personal_event_venues ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies that check ownership through personal_events table
CREATE POLICY "Event owners can manage venues"
ON personal_event_venues
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM personal_events
    WHERE personal_events.id = personal_event_venues.event_id
    AND personal_events.user_id = auth.uid()
  )
);