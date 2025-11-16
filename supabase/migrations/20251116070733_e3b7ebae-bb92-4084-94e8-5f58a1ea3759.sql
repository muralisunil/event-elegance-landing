-- Create vendor_reviews table for ratings and reviews
CREATE TABLE public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_views table to track page views
CREATE TABLE public.vendor_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID
);

-- Enable RLS
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.vendor_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.vendor_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.vendor_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.vendor_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for vendor_views
CREATE POLICY "Anyone can insert views"
  ON public.vendor_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Vendors can view their own stats"
  ON public.vendor_views
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all stats"
  ON public.vendor_views
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for vendor_reviews updated_at
CREATE TRIGGER update_vendor_reviews_updated_at
  BEFORE UPDATE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_user_id ON public.vendor_reviews(user_id);
CREATE INDEX idx_vendor_views_vendor_id ON public.vendor_views(vendor_id);
CREATE INDEX idx_vendor_views_viewed_at ON public.vendor_views(viewed_at);