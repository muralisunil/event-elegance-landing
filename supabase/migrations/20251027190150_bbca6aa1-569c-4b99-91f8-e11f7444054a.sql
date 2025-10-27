-- Remove location column and add pot luck style flag for personal event food sessions

-- Drop the unnecessary location column
ALTER TABLE personal_event_food_sessions 
DROP COLUMN IF EXISTS location;

-- Add pot luck style flag
ALTER TABLE personal_event_food_sessions 
ADD COLUMN IF NOT EXISTS is_pot_luck_style boolean DEFAULT false;