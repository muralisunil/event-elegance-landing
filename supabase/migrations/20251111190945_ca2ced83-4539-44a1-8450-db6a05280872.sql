-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Create function to check if a user is active
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_active, true)
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_user_active IS 'Checks if a user account is active. Returns true if user is active or profile does not exist.';