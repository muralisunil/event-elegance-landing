-- Add invitation_placeholders column to personal_event_configurations table
ALTER TABLE personal_event_configurations
ADD COLUMN invitation_placeholders jsonb DEFAULT '[]'::jsonb;