-- Phase 1 & 2: Personal Events Database Schema

-- Create personal_events table
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  event_types TEXT[] NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TIME NOT NULL,
  event_end_date DATE,
  event_end_time TIME,
  duration_minutes INTEGER,
  is_multi_day BOOLEAN DEFAULT false,
  location TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  goal TEXT,
  max_guests INTEGER,
  is_unlimited_guests BOOLEAN DEFAULT false,
  allow_accompanies BOOLEAN DEFAULT false,
  max_accompanies_per_guest INTEGER,
  age_restriction TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_configurations table
CREATE TABLE personal_event_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE UNIQUE,
  feature_venues_enabled BOOLEAN DEFAULT true,
  feature_schedule_enabled BOOLEAN DEFAULT true,
  feature_logistics_enabled BOOLEAN DEFAULT true,
  feature_food_planning_enabled BOOLEAN DEFAULT true,
  feature_tasks_enabled BOOLEAN DEFAULT true,
  feature_marketplace_enabled BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  invitation_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_organizers table
CREATE TABLE personal_event_organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'co-organizer',
  can_edit BOOLEAN DEFAULT true,
  can_view BOOLEAN DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Create personal_event_venues table
CREATE TABLE personal_event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  facilities TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_schedules table
CREATE TABLE personal_event_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES personal_event_venues(id) ON DELETE SET NULL,
  session_title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_guest_categories table
CREATE TABLE personal_event_guest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  max_guests INTEGER,
  benefits TEXT,
  display_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_guests table
CREATE TABLE personal_event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  guest_category_id UUID REFERENCES personal_event_guest_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  invitation_status TEXT DEFAULT 'pending',
  rsvp_date TIMESTAMP WITH TIME ZONE,
  num_accompanies INTEGER DEFAULT 0,
  dietary_preferences TEXT,
  special_requirements TEXT,
  internal_notes TEXT,
  internal_classification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_food_sessions table
CREATE TABLE personal_event_food_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES personal_event_venues(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME,
  location TEXT,
  estimated_attendees INTEGER,
  notes TEXT,
  allow_all_guest_categories BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_food_items table
CREATE TABLE personal_event_food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_session_id UUID NOT NULL REFERENCES personal_event_food_sessions(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT,
  source TEXT,
  assigned_guest_id UUID REFERENCES personal_event_guests(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  marketplace_vendor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_food_session_guest_categories table
CREATE TABLE personal_event_food_session_guest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_session_id UUID NOT NULL REFERENCES personal_event_food_sessions(id) ON DELETE CASCADE,
  guest_category_id UUID NOT NULL REFERENCES personal_event_guest_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(food_session_id, guest_category_id)
);

-- Create personal_event_logistics table
CREATE TABLE personal_event_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER,
  vendor TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  source TEXT DEFAULT 'manual',
  marketplace_vendor_id UUID,
  assigned_guest_id UUID REFERENCES personal_event_guests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_tasks table
CREATE TABLE personal_event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'not_started',
  priority task_priority DEFAULT 'medium',
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  due_date_type due_date_type DEFAULT 'fixed_datetime',
  relative_days INTEGER,
  relative_hours INTEGER,
  relative_to_session_id UUID REFERENCES personal_event_schedules(id) ON DELETE SET NULL,
  relative_to_food_session_id UUID REFERENCES personal_event_food_sessions(id) ON DELETE SET NULL,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  is_ai_suggested BOOLEAN DEFAULT false,
  ai_suggestion_reason TEXT
);

-- Create personal_event_task_assignments table
CREATE TABLE personal_event_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES personal_event_tasks(id) ON DELETE CASCADE,
  assignee_type TEXT NOT NULL,
  user_id UUID,
  guest_id UUID REFERENCES personal_event_guests(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (
    (assignee_type = 'organizer' AND user_id IS NOT NULL AND guest_id IS NULL) OR
    (assignee_type = 'guest' AND guest_id IS NOT NULL AND user_id IS NULL)
  )
);

-- Create personal_event_task_comments table
CREATE TABLE personal_event_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES personal_event_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_task_reminders table
CREATE TABLE personal_event_task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES personal_event_tasks(id) ON DELETE CASCADE,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT DEFAULT 'email',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal_event_invitations table
CREATE TABLE personal_event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES personal_event_guests(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 4: Database Functions

-- Calculate due dates for personal event tasks
CREATE OR REPLACE FUNCTION calculate_personal_task_due_date(_task personal_event_tasks)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql STABLE
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
      FROM personal_events
      WHERE id = _task.event_id;
      
    WHEN 'relative_to_session' THEN
      SELECT 
        (SELECT event_date FROM personal_events WHERE id = _task.event_id) + start_time
      INTO base_datetime
      FROM personal_event_schedules
      WHERE id = _task.relative_to_session_id;
      
    WHEN 'relative_to_food_session' THEN
      SELECT session_date + COALESCE(session_time, '00:00:00'::time)
      INTO base_datetime
      FROM personal_event_food_sessions
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

-- Check if user can manage personal event tasks
CREATE OR REPLACE FUNCTION can_manage_personal_event_tasks(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM personal_events
    WHERE id = _event_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE event_id = _event_id
    AND email = (SELECT email FROM auth.users WHERE id = _user_id)
    AND status = 'accepted'
    AND can_edit = true
  )
$$;

-- Check if user can view personal event tasks
CREATE OR REPLACE FUNCTION can_view_personal_event_tasks(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM personal_events
    WHERE id = _event_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE event_id = _event_id
    AND email = (SELECT email FROM auth.users WHERE id = _user_id)
    AND status = 'accepted'
  )
$$;

-- RLS Policies for personal_events
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own personal events"
ON personal_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own personal events"
ON personal_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal events"
ON personal_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal events"
ON personal_events FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for personal_event_configurations
ALTER TABLE personal_event_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage configurations for their events"
ON personal_event_configurations FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_configurations.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_organizers
ALTER TABLE personal_event_organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event owners can manage organizers"
ON personal_event_organizers FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_organizers.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_venues
ALTER TABLE personal_event_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage venues for their events"
ON personal_event_venues FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_venues.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_schedules
ALTER TABLE personal_event_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage schedules for their events"
ON personal_event_schedules FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_schedules.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_guest_categories
ALTER TABLE personal_event_guest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage guest categories for their events"
ON personal_event_guest_categories FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_guest_categories.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_guests
ALTER TABLE personal_event_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage guests for their events"
ON personal_event_guests FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_guests.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_food_sessions
ALTER TABLE personal_event_food_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage food sessions for their events"
ON personal_event_food_sessions FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_food_sessions.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_food_items
ALTER TABLE personal_event_food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage food items for their sessions"
ON personal_event_food_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_event_food_sessions
  JOIN personal_events ON personal_events.id = personal_event_food_sessions.event_id
  WHERE personal_event_food_sessions.id = personal_event_food_items.food_session_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_food_session_guest_categories
ALTER TABLE personal_event_food_session_guest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage food session guest categories"
ON personal_event_food_session_guest_categories FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_event_food_sessions efs
  JOIN personal_events pe ON pe.id = efs.event_id
  WHERE efs.id = personal_event_food_session_guest_categories.food_session_id
  AND pe.user_id = auth.uid()
));

-- RLS Policies for personal_event_logistics
ALTER TABLE personal_event_logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage logistics for their events"
ON personal_event_logistics FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_logistics.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_tasks
ALTER TABLE personal_event_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can create tasks"
ON personal_event_tasks FOR INSERT
WITH CHECK (can_manage_personal_event_tasks(auth.uid(), event_id) AND created_by = auth.uid());

CREATE POLICY "Users can view tasks for events they're involved in"
ON personal_event_tasks FOR SELECT
USING (can_view_personal_event_tasks(auth.uid(), event_id));

CREATE POLICY "Authorized users can update tasks"
ON personal_event_tasks FOR UPDATE
USING (can_manage_personal_event_tasks(auth.uid(), event_id));

CREATE POLICY "Event owners can delete tasks"
ON personal_event_tasks FOR DELETE
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_tasks.event_id
  AND personal_events.user_id = auth.uid()
));

-- RLS Policies for personal_event_task_assignments
ALTER TABLE personal_event_task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can manage assignments"
ON personal_event_task_assignments FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_assignments.task_id
  AND can_manage_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

CREATE POLICY "Users can view task assignments for accessible events"
ON personal_event_task_assignments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_assignments.task_id
  AND can_view_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

-- RLS Policies for personal_event_task_comments
ALTER TABLE personal_event_task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add comments to accessible tasks"
ON personal_event_task_comments FOR INSERT
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_comments.task_id
  AND can_view_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

CREATE POLICY "Users can view comments on accessible tasks"
ON personal_event_task_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_comments.task_id
  AND can_view_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

-- RLS Policies for personal_event_task_reminders
ALTER TABLE personal_event_task_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can manage reminders"
ON personal_event_task_reminders FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_reminders.task_id
  AND can_manage_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

CREATE POLICY "Users can view reminders for accessible tasks"
ON personal_event_task_reminders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM personal_event_tasks
  WHERE personal_event_tasks.id = personal_event_task_reminders.task_id
  AND can_view_personal_event_tasks(auth.uid(), personal_event_tasks.event_id)
));

-- RLS Policies for personal_event_invitations
ALTER TABLE personal_event_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invitations for their events"
ON personal_event_invitations FOR ALL
USING (EXISTS (
  SELECT 1 FROM personal_events
  WHERE personal_events.id = personal_event_invitations.event_id
  AND personal_events.user_id = auth.uid()
));