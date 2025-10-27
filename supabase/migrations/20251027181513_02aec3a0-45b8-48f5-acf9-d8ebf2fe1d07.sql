-- Fix security warning: Set search_path for has_guest_view_access function
CREATE OR REPLACE FUNCTION has_guest_view_access(
  p_event_id UUID,
  p_user_id UUID,
  p_section TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allow_guest_view BOOLEAN;
  v_viewable_sections JSONB;
BEGIN
  -- Get configuration
  SELECT 
    allow_guest_view, 
    guest_viewable_sections 
  INTO 
    v_allow_guest_view, 
    v_viewable_sections
  FROM personal_event_configurations
  WHERE event_id = p_event_id;
  
  -- Check if guest view is enabled
  IF NOT v_allow_guest_view THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has access and section is allowed
  RETURN EXISTS (
    SELECT 1 
    FROM personal_event_guest_access
    WHERE event_id = p_event_id
    AND user_id = p_user_id
    AND v_viewable_sections @> to_jsonb(p_section)
  );
END;
$$;