-- Modify event_food_session_guest_categories table
-- Remove charge_amount column and add is_chargeable boolean
ALTER TABLE event_food_session_guest_categories
DROP COLUMN IF EXISTS charge_amount;

ALTER TABLE event_food_session_guest_categories
ADD COLUMN IF NOT EXISTS is_chargeable BOOLEAN DEFAULT false;

-- Add session mode and online link support to event_schedules
ALTER TABLE event_schedules
ADD COLUMN IF NOT EXISTS session_mode TEXT DEFAULT 'in_person',
ADD COLUMN IF NOT EXISTS online_link TEXT;

-- Add constraint for session_mode values
ALTER TABLE event_schedules
DROP CONSTRAINT IF EXISTS event_schedules_session_mode_check;

ALTER TABLE event_schedules
ADD CONSTRAINT event_schedules_session_mode_check 
CHECK (session_mode IN ('in_person', 'online', 'hybrid'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_schedules_session_mode ON event_schedules(session_mode);