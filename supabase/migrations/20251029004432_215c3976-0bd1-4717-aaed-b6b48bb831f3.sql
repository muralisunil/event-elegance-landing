-- Add invitation content columns to configuration tables
ALTER TABLE personal_event_configurations 
ADD COLUMN IF NOT EXISTS invitation_title TEXT,
ADD COLUMN IF NOT EXISTS invitation_message TEXT;

ALTER TABLE event_configurations 
ADD COLUMN IF NOT EXISTS invitation_title TEXT,
ADD COLUMN IF NOT EXISTS invitation_message TEXT;