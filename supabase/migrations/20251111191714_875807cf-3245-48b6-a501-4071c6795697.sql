-- Fix security: Add search_path to functions that are missing it

-- Fix can_manage_event_tasks function
CREATE OR REPLACE FUNCTION public.can_manage_event_tasks(_user_id uuid, _event_id uuid)
RETURNS boolean
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

-- Fix can_view_event_tasks function
CREATE OR REPLACE FUNCTION public.can_view_event_tasks(_user_id uuid, _event_id uuid)
RETURNS boolean
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

-- Fix can_manage_assigned_event function (corrected to use role enum)
CREATE OR REPLACE FUNCTION public.can_manage_assigned_event(_user_id uuid, _event_id uuid, _event_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_managers
    WHERE user_id = _user_id 
      AND event_id = _event_id 
      AND event_type = _event_type
      AND role IN ('editor', 'coordinator')
  )
$$;

-- Fix calculate_task_due_date function
CREATE OR REPLACE FUNCTION public.calculate_task_due_date(_task event_tasks)
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE
SET search_path = public
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

-- Fix can_manage_personal_event_tasks function
CREATE OR REPLACE FUNCTION public.can_manage_personal_event_tasks(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Fix can_view_personal_event_tasks function
CREATE OR REPLACE FUNCTION public.can_view_personal_event_tasks(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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