-- Phase 6: Event-Venue Integration
-- Create tables for event-venue bookings and hall reservations

-- Event venue bookings table (venues can be booked for events)
CREATE TABLE IF NOT EXISTS public.event_venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES outreach_events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  total_cost DECIMAL(10, 2),
  special_requirements TEXT,
  notes TEXT,
  booked_by UUID NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, venue_id)
);

-- Event hall reservations table (individual halls can be booked)
CREATE TABLE IF NOT EXISTS public.event_hall_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES outreach_events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES venue_halls(id) ON DELETE CASCADE,
  reservation_date TIMESTAMPTZ NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reservation_status TEXT DEFAULT 'pending' CHECK (reservation_status IN ('pending', 'confirmed', 'cancelled')),
  cost DECIMAL(10, 2),
  seating_layout_customization JSONB,
  special_requirements TEXT,
  notes TEXT,
  reserved_by UUID NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, hall_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_venue_bookings_event ON event_venue_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_venue_bookings_venue ON event_venue_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_event_venue_bookings_status ON event_venue_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_event_hall_reservations_event ON event_hall_reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_hall_reservations_hall ON event_hall_reservations(hall_id);
CREATE INDEX IF NOT EXISTS idx_event_hall_reservations_status ON event_hall_reservations(reservation_status);

-- Updated_at triggers
CREATE TRIGGER update_event_venue_bookings_updated_at
BEFORE UPDATE ON public.event_venue_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_hall_reservations_updated_at
BEFORE UPDATE ON public.event_hall_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.event_venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_hall_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_venue_bookings
CREATE POLICY "Users can view bookings for their events"
  ON public.event_venue_bookings FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings for their events"
  ON public.event_venue_bookings FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
    AND booked_by = auth.uid()
  );

CREATE POLICY "Users can update bookings for their events"
  ON public.event_venue_bookings FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bookings for their events"
  ON public.event_venue_bookings FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for event_hall_reservations
CREATE POLICY "Users can view reservations for their events"
  ON public.event_hall_reservations FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reservations for their events"
  ON public.event_hall_reservations FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
    AND reserved_by = auth.uid()
  );

CREATE POLICY "Users can update reservations for their events"
  ON public.event_hall_reservations FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reservations for their events"
  ON public.event_hall_reservations FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM outreach_events WHERE user_id = auth.uid()
    )
  );