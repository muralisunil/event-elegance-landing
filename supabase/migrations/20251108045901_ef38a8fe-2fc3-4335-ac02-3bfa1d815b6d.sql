-- Create enum for event manager roles
CREATE TYPE public.event_manager_role AS ENUM ('viewer', 'editor', 'coordinator');

-- Add role column to event_managers table
ALTER TABLE public.event_managers ADD COLUMN role event_manager_role NOT NULL DEFAULT 'viewer';

-- Update existing records: if can_edit is true, set to 'editor', otherwise 'viewer'
UPDATE public.event_managers SET role = CASE WHEN can_edit THEN 'editor'::event_manager_role ELSE 'viewer'::event_manager_role END;

-- Drop the old can_edit column
ALTER TABLE public.event_managers DROP COLUMN can_edit;

-- Add comment explaining the roles
COMMENT ON TYPE public.event_manager_role IS 'viewer: can only view event details, editor: can edit event details but not manage other managers, coordinator: full access including manager management';