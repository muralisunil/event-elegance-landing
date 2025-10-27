-- Create enums for task management
CREATE TYPE task_status AS ENUM (
  'not_started',
  'in_progress', 
  'completed',
  'blocked',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE due_date_type AS ENUM (
  'fixed_datetime',
  'relative_to_event',
  'relative_to_session',
  'relative_to_food_session'
);

-- Main tasks table
CREATE TABLE event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES outreach_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'not_started',
  priority task_priority DEFAULT 'medium',
  
  -- Due date handling
  due_date_type due_date_type NOT NULL DEFAULT 'fixed_datetime',
  due_date TIMESTAMP WITH TIME ZONE,
  relative_days INTEGER,
  relative_hours INTEGER,
  relative_to_session_id UUID REFERENCES event_schedules(id) ON DELETE SET NULL,
  relative_to_food_session_id UUID REFERENCES event_food_sessions(id) ON DELETE SET NULL,
  
  -- Task metadata
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  category TEXT,
  tags TEXT[],
  
  -- AI generated flag
  is_ai_suggested BOOLEAN DEFAULT false,
  ai_suggestion_reason TEXT,
  
  -- Tracking
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  
  order_index INTEGER DEFAULT 0,
  
  CONSTRAINT valid_due_date_config CHECK (
    (due_date_type = 'fixed_datetime' AND due_date IS NOT NULL) OR
    (due_date_type = 'relative_to_event' AND relative_days IS NOT NULL) OR
    (due_date_type IN ('relative_to_session', 'relative_to_food_session') AND 
     (relative_days IS NOT NULL OR relative_hours IS NOT NULL))
  )
);

-- Task assignments
CREATE TABLE event_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES event_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(task_id, user_id)
);

-- Task comments
CREATE TABLE event_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES event_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_system_message BOOLEAN DEFAULT false
);

-- Task reminders
CREATE TABLE event_task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES event_tasks(id) ON DELETE CASCADE,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT DEFAULT 'email',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Volunteer permissions for task creation
CREATE TABLE event_volunteer_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES outreach_events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES event_volunteers(id) ON DELETE CASCADE,
  can_create_tasks BOOLEAN DEFAULT false,
  can_edit_own_tasks BOOLEAN DEFAULT true,
  can_comment BOOLEAN DEFAULT true,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

-- AI Agent Configuration
CREATE TABLE event_task_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES outreach_events(id) ON DELETE CASCADE,
  ai_monitoring_enabled BOOLEAN DEFAULT false,
  auto_suggest_tasks BOOLEAN DEFAULT false,
  auto_create_tasks BOOLEAN DEFAULT false,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  analysis_frequency_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_event_tasks_event ON event_tasks(event_id);
CREATE INDEX idx_event_tasks_status ON event_tasks(status);
CREATE INDEX idx_event_tasks_due_date ON event_tasks(due_date);
CREATE INDEX idx_task_assignments_task ON event_task_assignments(task_id);
CREATE INDEX idx_task_assignments_user ON event_task_assignments(user_id);
CREATE INDEX idx_task_comments_task ON event_task_comments(task_id);
CREATE INDEX idx_task_reminders_remind_at ON event_task_reminders(remind_at, sent_at);

-- Enable RLS
ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_volunteer_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_task_ai_config ENABLE ROW LEVEL SECURITY;

-- Security definer function to check task management permissions (simplified without co-organizers for now)
CREATE OR REPLACE FUNCTION public.can_manage_event_tasks(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM outreach_events
    WHERE id = _event_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM event_volunteers ev
    JOIN event_volunteer_permissions evp ON ev.id = evp.volunteer_id
    WHERE ev.event_id = _event_id
    AND ev.email = (SELECT email FROM auth.users WHERE id = _user_id)
    AND evp.can_create_tasks = true
  )
$$;

-- Security definer function to check view permissions (simplified without co-organizers for now)
CREATE OR REPLACE FUNCTION public.can_view_event_tasks(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM outreach_events
    WHERE id = _event_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM event_volunteers
    WHERE event_id = _event_id
    AND email = (SELECT email FROM auth.users WHERE id = _user_id)
  )
$$;

-- Function to calculate actual due date from relative dates
CREATE OR REPLACE FUNCTION public.calculate_task_due_date(_task event_tasks)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  base_datetime TIMESTAMP WITH TIME ZONE;
  result_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  CASE _task.due_date_type
    WHEN 'fixed_datetime' THEN
      RETURN _task.due_date;
      
    WHEN 'relative_to_event' THEN
      SELECT event_date + event_time INTO base_datetime
      FROM outreach_events
      WHERE id = _task.event_id;
      
    WHEN 'relative_to_session' THEN
      SELECT 
        (SELECT event_date FROM outreach_events WHERE id = _task.event_id) + start_time
      INTO base_datetime
      FROM event_schedules
      WHERE id = _task.relative_to_session_id;
      
    WHEN 'relative_to_food_session' THEN
      SELECT session_date + COALESCE(session_time, '00:00:00'::time)
      INTO base_datetime
      FROM event_food_sessions
      WHERE id = _task.relative_to_food_session_id;
  END CASE;
  
  result_datetime := base_datetime;
  IF _task.relative_days IS NOT NULL THEN
    result_datetime := result_datetime + (_task.relative_days || ' days')::interval;
  END IF;
  IF _task.relative_hours IS NOT NULL THEN
    result_datetime := result_datetime + (_task.relative_hours || ' hours')::interval;
  END IF;
  
  RETURN result_datetime;
END;
$$;

-- RLS Policies for event_tasks
CREATE POLICY "Users can view tasks for events they're involved in"
ON event_tasks FOR SELECT
USING (public.can_view_event_tasks(auth.uid(), event_id));

CREATE POLICY "Authorized users can create tasks"
ON event_tasks FOR INSERT
WITH CHECK (
  public.can_manage_event_tasks(auth.uid(), event_id)
  AND created_by = auth.uid()
);

CREATE POLICY "Authorized users can update tasks"
ON event_tasks FOR UPDATE
USING (public.can_manage_event_tasks(auth.uid(), event_id));

CREATE POLICY "Organizers can delete tasks"
ON event_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM outreach_events
    WHERE id = event_tasks.event_id AND user_id = auth.uid()
  )
);

-- RLS Policies for event_task_assignments
CREATE POLICY "Users can view task assignments for accessible events"
ON event_task_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_assignments.task_id
    AND public.can_view_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

CREATE POLICY "Authorized users can manage assignments"
ON event_task_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_assignments.task_id
    AND public.can_manage_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

-- RLS Policies for event_task_comments
CREATE POLICY "Users can view comments on accessible tasks"
ON event_task_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_comments.task_id
    AND public.can_view_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

CREATE POLICY "Users can add comments to accessible tasks"
ON event_task_comments FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_comments.task_id
    AND public.can_view_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

-- RLS Policies for event_task_reminders
CREATE POLICY "Users can view reminders for accessible tasks"
ON event_task_reminders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_reminders.task_id
    AND public.can_view_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

CREATE POLICY "Authorized users can manage reminders"
ON event_task_reminders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM event_tasks
    WHERE event_tasks.id = event_task_reminders.task_id
    AND public.can_manage_event_tasks(auth.uid(), event_tasks.event_id)
  )
);

-- RLS Policies for event_volunteer_permissions
CREATE POLICY "Organizers can manage volunteer permissions"
ON event_volunteer_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM outreach_events
    WHERE outreach_events.id = event_volunteer_permissions.event_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for event_task_ai_config
CREATE POLICY "Organizers can manage AI config"
ON event_task_ai_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM outreach_events
    WHERE outreach_events.id = event_task_ai_config.event_id
    AND user_id = auth.uid()
  )
);

-- Update event_configurations to add tasks feature
ALTER TABLE event_configurations
ADD COLUMN feature_tasks_enabled BOOLEAN DEFAULT true;

-- Trigger for updated_at on event_tasks
CREATE TRIGGER update_event_tasks_updated_at
BEFORE UPDATE ON event_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on event_task_comments
CREATE TRIGGER update_event_task_comments_updated_at
BEFORE UPDATE ON event_task_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on event_task_ai_config
CREATE TRIGGER update_event_task_ai_config_updated_at
BEFORE UPDATE ON event_task_ai_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();