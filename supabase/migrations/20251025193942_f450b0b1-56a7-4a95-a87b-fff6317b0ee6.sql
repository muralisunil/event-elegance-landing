-- Create business categories table (shared by sponsors and vendors)
CREATE TABLE public.event_business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sponsor tiers table (configurable: Gold, Platinum, etc.)
CREATE TABLE public.event_sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_level INTEGER NOT NULL DEFAULT 0,
  benefits TEXT,
  contribution_amount NUMERIC(10,2),
  display_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event volunteers table
CREATE TABLE public.event_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  shift_time TEXT,
  skills TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event sponsors table
CREATE TABLE public.event_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  sponsor_tier_id UUID REFERENCES public.event_sponsor_tiers(id) ON DELETE SET NULL,
  business_category_id UUID REFERENCES public.event_business_categories(id) ON DELETE SET NULL,
  contribution_amount NUMERIC(10,2),
  contribution_type TEXT,
  in_kind_description TEXT,
  website TEXT,
  logo_url TEXT,
  is_also_vendor BOOLEAN DEFAULT FALSE,
  vendor_id UUID,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event vendors table
CREATE TABLE public.event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  business_category_id UUID REFERENCES public.event_business_categories(id) ON DELETE SET NULL,
  services_provided TEXT NOT NULL,
  booth_number TEXT,
  setup_requirements TEXT,
  contract_amount NUMERIC(10,2),
  payment_status TEXT DEFAULT 'pending',
  website TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  linked_sponsor_id UUID REFERENCES public.event_sponsors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint from sponsors to vendors
ALTER TABLE public.event_sponsors 
ADD CONSTRAINT fk_sponsor_vendor 
FOREIGN KEY (vendor_id) REFERENCES public.event_vendors(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.event_business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_business_categories
CREATE POLICY "Users can view their event business categories"
ON public.event_business_categories FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_business_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create business categories for their events"
ON public.event_business_categories FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_business_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event business categories"
ON public.event_business_categories FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_business_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event business categories"
ON public.event_business_categories FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_business_categories.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_sponsor_tiers
CREATE POLICY "Users can view their event sponsor tiers"
ON public.event_sponsor_tiers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsor_tiers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create sponsor tiers for their events"
ON public.event_sponsor_tiers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsor_tiers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event sponsor tiers"
ON public.event_sponsor_tiers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsor_tiers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event sponsor tiers"
ON public.event_sponsor_tiers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsor_tiers.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_volunteers
CREATE POLICY "Users can view their event volunteers"
ON public.event_volunteers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_volunteers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create volunteers for their events"
ON public.event_volunteers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_volunteers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event volunteers"
ON public.event_volunteers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_volunteers.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event volunteers"
ON public.event_volunteers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_volunteers.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_sponsors
CREATE POLICY "Users can view their event sponsors"
ON public.event_sponsors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create sponsors for their events"
ON public.event_sponsors FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event sponsors"
ON public.event_sponsors FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event sponsors"
ON public.event_sponsors FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_sponsors.event_id
  AND outreach_events.user_id = auth.uid()
));

-- RLS Policies for event_vendors
CREATE POLICY "Users can view their event vendors"
ON public.event_vendors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_vendors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can create vendors for their events"
ON public.event_vendors FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_vendors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can update their event vendors"
ON public.event_vendors FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_vendors.event_id
  AND outreach_events.user_id = auth.uid()
));

CREATE POLICY "Users can delete their event vendors"
ON public.event_vendors FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.outreach_events
  WHERE outreach_events.id = event_vendors.event_id
  AND outreach_events.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_event_business_categories_updated_at
  BEFORE UPDATE ON public.event_business_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_sponsor_tiers_updated_at
  BEFORE UPDATE ON public.event_sponsor_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_volunteers_updated_at
  BEFORE UPDATE ON public.event_volunteers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_sponsors_updated_at
  BEFORE UPDATE ON public.event_sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_vendors_updated_at
  BEFORE UPDATE ON public.event_vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_event_business_categories_event_id ON public.event_business_categories(event_id);
CREATE INDEX idx_event_sponsor_tiers_event_id ON public.event_sponsor_tiers(event_id);
CREATE INDEX idx_event_volunteers_event_id ON public.event_volunteers(event_id);
CREATE INDEX idx_event_sponsors_event_id ON public.event_sponsors(event_id);
CREATE INDEX idx_event_vendors_event_id ON public.event_vendors(event_id);
CREATE INDEX idx_event_sponsors_vendor_id ON public.event_sponsors(vendor_id);
CREATE INDEX idx_event_vendors_linked_sponsor_id ON public.event_vendors(linked_sponsor_id);