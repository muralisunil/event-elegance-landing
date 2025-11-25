-- Add invitation_placeholders column to event_configurations table
ALTER TABLE event_configurations
ADD COLUMN invitation_placeholders jsonb DEFAULT '[]'::jsonb;