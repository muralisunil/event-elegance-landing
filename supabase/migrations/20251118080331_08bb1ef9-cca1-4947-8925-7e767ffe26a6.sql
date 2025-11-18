-- Add missing columns to vendor_reviews
ALTER TABLE public.vendor_reviews 
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.event_vendor_bookings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS vendor_response TEXT,
  ADD COLUMN IF NOT EXISTS vendor_responded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- Add unique constraint on booking_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vendor_reviews_booking_id_key'
  ) THEN
    ALTER TABLE public.vendor_reviews ADD CONSTRAINT vendor_reviews_booking_id_key UNIQUE(booking_id);
  END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_booking_id ON public.vendor_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON public.vendor_reviews(rating);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view verified reviews" ON public.vendor_reviews;
DROP POLICY IF EXISTS "Event organizers can create reviews for their bookings" ON public.vendor_reviews;
DROP POLICY IF EXISTS "Reviewers can update their own reviews" ON public.vendor_reviews;
DROP POLICY IF EXISTS "Vendors can update their responses" ON public.vendor_reviews;

CREATE POLICY "Anyone can view verified reviews"
  ON public.vendor_reviews
  FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Event organizers can create reviews for their bookings"
  ON public.vendor_reviews
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    (booking_id IS NULL OR booking_id IN (
      SELECT id FROM event_vendor_bookings
      WHERE requested_by = auth.uid() AND status = 'confirmed'
    ))
  );

CREATE POLICY "Reviewers can update their own reviews"
  ON public.vendor_reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can respond to reviews"
  ON public.vendor_reviews
  FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Add rating columns to vendors table
ALTER TABLE public.vendors 
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create function to update vendor rating
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE vendors
    SET 
      average_rating = COALESCE((
        SELECT AVG(rating)
        FROM vendor_reviews
        WHERE vendor_id = OLD.vendor_id AND is_verified = true
      ), 0),
      total_reviews = (
        SELECT COUNT(*)
        FROM vendor_reviews
        WHERE vendor_id = OLD.vendor_id AND is_verified = true
      )
    WHERE id = OLD.vendor_id;
    RETURN OLD;
  ELSE
    UPDATE vendors
    SET 
      average_rating = COALESCE((
        SELECT AVG(rating)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id AND is_verified = true
      ), 0),
      total_reviews = (
        SELECT COUNT(*)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id AND is_verified = true
      )
    WHERE id = NEW.vendor_id;
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger to update vendor rating
DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON public.vendor_reviews;
CREATE TRIGGER update_vendor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendor_rating();