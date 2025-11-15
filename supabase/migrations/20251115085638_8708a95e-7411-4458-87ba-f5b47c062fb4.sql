-- Create vendors table for marketplace vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add vendor role to app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'vendor');
  ELSE
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendor';
  END IF;
END $$;

-- Enable RLS on vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can view their own profile
CREATE POLICY "Vendors can view own profile"
ON public.vendors
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Policy: Vendors can update their own profile
CREATE POLICY "Vendors can update own profile"
ON public.vendors
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Authenticated users can create vendor profile
CREATE POLICY "Users can create vendor profile"
ON public.vendors
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Public can view verified active vendors
CREATE POLICY "Public can view verified vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (is_verified = true AND is_active = true);

-- Policy: Admins can manage all vendors
CREATE POLICY "Admins can manage vendors"
ON public.vendors
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is a vendor
CREATE OR REPLACE FUNCTION public.is_vendor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vendors
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;