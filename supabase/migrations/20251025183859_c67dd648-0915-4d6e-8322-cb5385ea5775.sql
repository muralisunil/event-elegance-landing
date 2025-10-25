-- Add session_type and metadata columns to event_schedules table
ALTER TABLE event_schedules
ADD COLUMN IF NOT EXISTS session_type TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for faster queries on session_type
CREATE INDEX IF NOT EXISTS idx_event_schedules_session_type ON event_schedules(session_type);

-- Add comment for documentation
COMMENT ON COLUMN event_schedules.session_type IS 'Type of session (workshop, training, panel_discussion, etc.)';
COMMENT ON COLUMN event_schedules.metadata IS 'Type-specific fields stored as JSONB for flexibility';