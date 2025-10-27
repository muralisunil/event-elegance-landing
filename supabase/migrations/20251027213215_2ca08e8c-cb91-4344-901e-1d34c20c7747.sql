-- Create security definer functions to avoid RLS recursion and auth.users access issues

-- Function to check if a user is the owner of a personal event
CREATE OR REPLACE FUNCTION public.is_personal_event_owner(_user_id uuid, _event_id uuid)
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
$$;

-- Function to check if a user is an accepted organizer of a personal event with edit permissions
CREATE OR REPLACE FUNCTION public.is_personal_event_organizer_with_edit(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE event_id = _event_id
    AND email = (SELECT email FROM auth.users WHERE id = _user_id)
    AND status = 'accepted'
    AND can_edit = true
  )
$$;

-- Function to check if a user is an accepted organizer of a personal event (view only)
CREATE OR REPLACE FUNCTION public.is_personal_event_organizer(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM personal_event_organizers
    WHERE event_id = _event_id
    AND email = (SELECT email FROM auth.users WHERE id = _user_id)
    AND status = 'accepted'
  )
$$;

-- Drop ALL existing policies on personal_event_organizers
DROP POLICY IF EXISTS "Event owners can manage organizers" ON personal_event_organizers;
DROP POLICY IF EXISTS "Organizers can view other organizers" ON personal_event_organizers;
DROP POLICY IF EXISTS "Users can view their organizer invitations" ON personal_event_organizers;

-- Create new policies for personal_event_organizers
CREATE POLICY "Event owners can manage organizers"
ON personal_event_organizers
FOR ALL
TO authenticated
USING (is_personal_event_owner(auth.uid(), event_id));

CREATE POLICY "Organizers can view other organizers"
ON personal_event_organizers
FOR SELECT
TO authenticated
USING (is_personal_event_organizer(auth.uid(), event_id));

CREATE POLICY "Users can view their organizer invitations"
ON personal_event_organizers
FOR ALL
TO authenticated
USING (email = auth.email());

-- Drop ALL existing policies on personal_event_guests
DROP POLICY IF EXISTS "Event owners can manage guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Users can manage guests for their events" ON personal_event_guests;
DROP POLICY IF EXISTS "owners_full_access_guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Organizers can manage guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Organizers can view guests" ON personal_event_guests;
DROP POLICY IF EXISTS "Guests can view other guests if enabled" ON personal_event_guests;

-- Create new policies for personal_event_guests
CREATE POLICY "Event owners can manage guests"
ON personal_event_guests
FOR ALL
TO authenticated
USING (is_personal_event_owner(auth.uid(), event_id));

CREATE POLICY "Organizers can manage guests"
ON personal_event_guests
FOR ALL
TO authenticated
USING (is_personal_event_organizer_with_edit(auth.uid(), event_id));

CREATE POLICY "Organizers can view guests"
ON personal_event_guests
FOR SELECT
TO authenticated
USING (is_personal_event_organizer(auth.uid(), event_id));

CREATE POLICY "Guests can view other guests if enabled"
ON personal_event_guests
FOR SELECT
TO authenticated
USING (
  email = auth.email()
  OR has_guest_view_access(event_id, auth.uid(), 'guests')
);

-- Drop ALL existing policies on personal_event_food_items
DROP POLICY IF EXISTS "Event owners can manage food items" ON personal_event_food_items;
DROP POLICY IF EXISTS "Users can create food items for their sessions" ON personal_event_food_items;
DROP POLICY IF EXISTS "Users can delete their event food items" ON personal_event_food_items;
DROP POLICY IF EXISTS "Users can update their event food items" ON personal_event_food_items;
DROP POLICY IF EXISTS "Users can view their event food items" ON personal_event_food_items;
DROP POLICY IF EXISTS "owners_full_access_food_items" ON personal_event_food_items;
DROP POLICY IF EXISTS "Organizers can manage food items if enabled" ON personal_event_food_items;
DROP POLICY IF EXISTS "Organizers can manage food items" ON personal_event_food_items;
DROP POLICY IF EXISTS "Guests can view food items if enabled" ON personal_event_food_items;

-- Create new policies for personal_event_food_items
CREATE POLICY "Event owners can manage food items"
ON personal_event_food_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions fs
    WHERE fs.id = personal_event_food_items.food_session_id
    AND is_personal_event_owner(auth.uid(), fs.event_id)
  )
);

CREATE POLICY "Organizers can manage food items"
ON personal_event_food_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions fs
    WHERE fs.id = personal_event_food_items.food_session_id
    AND is_personal_event_organizer_with_edit(auth.uid(), fs.event_id)
  )
);

CREATE POLICY "Guests can view food items if enabled"
ON personal_event_food_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM personal_event_food_sessions fs
    WHERE fs.id = personal_event_food_items.food_session_id
    AND (
      has_guest_view_access(fs.event_id, auth.uid(), 'food')
      OR is_personal_event_owner(auth.uid(), fs.event_id)
      OR is_personal_event_organizer(auth.uid(), fs.event_id)
    )
  )
);