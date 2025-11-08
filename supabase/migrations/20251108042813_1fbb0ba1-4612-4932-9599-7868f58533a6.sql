-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  phone text,
  organization text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Create event permissions system
CREATE TYPE public.event_category AS ENUM ('personal', 'outreach', 'commercial');

CREATE TABLE public.user_event_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_category event_category NOT NULL,
  can_create boolean DEFAULT false,
  can_manage boolean DEFAULT false,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, event_category)
);

ALTER TABLE public.user_event_permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check event permissions
CREATE OR REPLACE FUNCTION public.has_event_permission(_user_id uuid, _category event_category, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN _permission = 'create' THEN COALESCE(can_create, false)
      WHEN _permission = 'manage' THEN COALESCE(can_manage, false)
      ELSE false
    END
  FROM public.user_event_permissions
  WHERE user_id = _user_id AND event_category = _category
$$;

-- RLS policies for user_event_permissions
CREATE POLICY "Users can view own permissions" ON public.user_event_permissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all permissions" ON public.user_event_permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Create event managers system
CREATE TABLE public.event_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('personal', 'outreach')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  can_edit boolean DEFAULT true,
  added_by uuid REFERENCES auth.users(id) NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE (event_id, user_id, event_type)
);

ALTER TABLE public.event_managers ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user can manage assigned event
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
      AND can_edit = true
  )
$$;

-- RLS policies for event_managers
CREATE POLICY "Users can view events they manage" ON public.event_managers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Event owners can manage their event managers (personal)" ON public.event_managers
  FOR ALL
  TO authenticated
  USING (
    event_type = 'personal' AND
    EXISTS (
      SELECT 1 FROM personal_events 
      WHERE id = event_managers.event_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_type = 'personal' AND
    EXISTS (
      SELECT 1 FROM personal_events 
      WHERE id = event_managers.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can manage their event managers (outreach)" ON public.event_managers
  FOR ALL
  TO authenticated
  USING (
    event_type = 'outreach' AND
    EXISTS (
      SELECT 1 FROM outreach_events 
      WHERE id = event_managers.event_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_type = 'outreach' AND
    EXISTS (
      SELECT 1 FROM outreach_events 
      WHERE id = event_managers.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all event managers" ON public.event_managers
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Grant default permissions to existing users based on their created events
INSERT INTO user_event_permissions (user_id, event_category, can_create, can_manage, granted_at)
SELECT DISTINCT 
  user_id,
  'personal'::event_category,
  true,
  true,
  now()
FROM personal_events
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, event_category) DO NOTHING;

INSERT INTO user_event_permissions (user_id, event_category, can_create, can_manage, granted_at)
SELECT DISTINCT 
  user_id,
  'outreach'::event_category,
  true,
  true,
  now()
FROM outreach_events
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, event_category) DO NOTHING;