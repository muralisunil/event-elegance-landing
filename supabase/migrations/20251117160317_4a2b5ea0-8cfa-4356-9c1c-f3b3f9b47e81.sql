-- Phase 4: Vendor Profile Management & Analytics Tables

-- Create vendor_services table for service catalog
CREATE TABLE IF NOT EXISTS public.vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL,
  price_unit TEXT, -- e.g., "per hour", "per event", "per person"
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vendor_portfolio table for images/work samples
CREATE TABLE IF NOT EXISTS public.vendor_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vendor_availability table for calendar management
CREATE TABLE IF NOT EXISTS public.vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, date)
);

-- Create storage bucket for vendor portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-portfolio', 'vendor-portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_services
CREATE POLICY "Anyone can view active vendor services"
  ON public.vendor_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Vendors can manage their own services"
  ON public.vendor_services FOR ALL
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all vendor services"
  ON public.vendor_services FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for vendor_portfolio
CREATE POLICY "Anyone can view vendor portfolio"
  ON public.vendor_portfolio FOR SELECT
  USING (true);

CREATE POLICY "Vendors can manage their own portfolio"
  ON public.vendor_portfolio FOR ALL
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all vendor portfolios"
  ON public.vendor_portfolio FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for vendor_availability
CREATE POLICY "Anyone can view vendor availability"
  ON public.vendor_availability FOR SELECT
  USING (true);

CREATE POLICY "Vendors can manage their own availability"
  ON public.vendor_availability FOR ALL
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all vendor availability"
  ON public.vendor_availability FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Storage policies for vendor-portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-portfolio');

CREATE POLICY "Vendors can upload their own portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Vendors can update their own portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vendor-portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Vendors can delete their own portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_services_updated_at
  BEFORE UPDATE ON public.vendor_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_availability_updated_at
  BEFORE UPDATE ON public.vendor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_vendor_services_vendor_id ON public.vendor_services(vendor_id);
CREATE INDEX idx_vendor_services_active ON public.vendor_services(is_active);
CREATE INDEX idx_vendor_portfolio_vendor_id ON public.vendor_portfolio(vendor_id);
CREATE INDEX idx_vendor_availability_vendor_id ON public.vendor_availability(vendor_id);
CREATE INDEX idx_vendor_availability_date ON public.vendor_availability(date);