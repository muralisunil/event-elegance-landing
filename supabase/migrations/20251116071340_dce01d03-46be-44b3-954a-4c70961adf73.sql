-- Create event_vendor_bookings table for connecting vendors to events
CREATE TABLE public.event_vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  contract_amount NUMERIC,
  payment_status TEXT CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'refunded')),
  services_required TEXT NOT NULL,
  event_date DATE NOT NULL,
  notes TEXT,
  requested_by UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, vendor_id)
);

-- Create vendor_messages table for communication
CREATE TABLE public.vendor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.event_vendor_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('organizer', 'vendor')),
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for contracts/documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-contracts', 'vendor-contracts', false);

-- Enable RLS
ALTER TABLE public.event_vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_vendor_bookings
CREATE POLICY "Event organizers can view their bookings"
  ON public.event_vendor_bookings
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view their bookings"
  ON public.event_vendor_bookings
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can create bookings"
  ON public.event_vendor_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requested_by AND
    event_id IN (
      SELECT id FROM public.outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can update their bookings"
  ON public.event_vendor_bookings
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM public.outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their bookings"
  ON public.event_vendor_bookings
  FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON public.event_vendor_bookings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for vendor_messages
CREATE POLICY "Booking participants can view messages"
  ON public.vendor_messages
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.event_vendor_bookings
      WHERE 
        event_id IN (SELECT id FROM public.outreach_events WHERE user_id = auth.uid())
        OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Booking participants can send messages"
  ON public.vendor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    booking_id IN (
      SELECT id FROM public.event_vendor_bookings
      WHERE 
        event_id IN (SELECT id FROM public.outreach_events WHERE user_id = auth.uid())
        OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
  );

-- Storage RLS policies for vendor-contracts bucket
CREATE POLICY "Users can view their own contract files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'vendor-contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own contract files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own contract files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own contract files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add triggers
CREATE TRIGGER update_event_vendor_bookings_updated_at
  BEFORE UPDATE ON public.event_vendor_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_event_vendor_bookings_event_id ON public.event_vendor_bookings(event_id);
CREATE INDEX idx_event_vendor_bookings_vendor_id ON public.event_vendor_bookings(vendor_id);
CREATE INDEX idx_event_vendor_bookings_status ON public.event_vendor_bookings(status);
CREATE INDEX idx_vendor_messages_booking_id ON public.vendor_messages(booking_id);
CREATE INDEX idx_vendor_messages_sender_id ON public.vendor_messages(sender_id);