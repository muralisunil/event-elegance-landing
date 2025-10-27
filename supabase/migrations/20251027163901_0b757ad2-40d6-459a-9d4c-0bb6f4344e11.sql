-- Fix security warning: Set search_path for calculate_personal_task_due_date function
CREATE OR REPLACE FUNCTION calculate_personal_task_due_date(_task personal_event_tasks)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql STABLE
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