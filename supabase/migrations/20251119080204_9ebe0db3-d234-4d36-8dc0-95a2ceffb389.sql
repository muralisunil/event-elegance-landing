-- Phase 6: Advanced Vendor Features & Contract Management (Part 2)

-- 1. Add contract document fields to bookings
ALTER TABLE public.event_vendor_bookings
ADD COLUMN IF NOT EXISTS contract_url TEXT,
ADD COLUMN IF NOT EXISTS contract_uploaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS contract_expires_at TIMESTAMPTZ;

-- 2. Create vendor notification preferences table
CREATE TABLE IF NOT EXISTS public.vendor_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE UNIQUE,
  notify_booking_requests BOOLEAN DEFAULT true,
  notify_booking_updates BOOLEAN DEFAULT true,
  notify_messages BOOLEAN DEFAULT true,
  notify_reviews BOOLEAN DEFAULT true,
  notify_payment_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_notification_preferences
ALTER TABLE public.vendor_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_notification_preferences
CREATE POLICY "Vendors can view their own preferences"
ON public.vendor_notification_preferences FOR SELECT
TO authenticated
USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update their own preferences"
ON public.vendor_notification_preferences FOR ALL
TO authenticated
USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_vendor_bookings_contract 
ON public.event_vendor_bookings(vendor_id) WHERE contract_url IS NOT NULL;

-- 4. Add trigger for updated_at
CREATE TRIGGER update_vendor_notification_preferences_updated_at
BEFORE UPDATE ON public.vendor_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();