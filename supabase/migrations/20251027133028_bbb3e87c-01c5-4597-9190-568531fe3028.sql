-- Add columns to track "No Restrictions" mode
ALTER TABLE event_schedules 
ADD COLUMN allow_all_guest_categories BOOLEAN DEFAULT true;

ALTER TABLE event_food_sessions 
ADD COLUMN allow_all_guest_categories BOOLEAN DEFAULT true,
ADD COLUMN default_charge_amount NUMERIC(10, 2);

-- Create junction table for schedule session guest categories
CREATE TABLE event_schedule_guest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES event_schedules(id) ON DELETE CASCADE,
  guest_category_id UUID NOT NULL REFERENCES event_guest_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, guest_category_id)
);

CREATE INDEX idx_schedule_guest_categories_schedule ON event_schedule_guest_categories(schedule_id);
CREATE INDEX idx_schedule_guest_categories_category ON event_schedule_guest_categories(guest_category_id);

-- Create junction table for food session guest categories with pricing
CREATE TABLE event_food_session_guest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_session_id UUID NOT NULL REFERENCES event_food_sessions(id) ON DELETE CASCADE,
  guest_category_id UUID NOT NULL REFERENCES event_guest_categories(id) ON DELETE CASCADE,
  charge_amount NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(food_session_id, guest_category_id)
);

CREATE INDEX idx_food_session_guest_categories_session ON event_food_session_guest_categories(food_session_id);
CREATE INDEX idx_food_session_guest_categories_category ON event_food_session_guest_categories(guest_category_id);

-- Trigger for updated_at
CREATE TRIGGER update_food_session_guest_categories_updated_at
  BEFORE UPDATE ON event_food_session_guest_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for schedule session guest categories
ALTER TABLE event_schedule_guest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage schedule guest categories for their events"
ON event_schedule_guest_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM event_schedules es
    JOIN outreach_events oe ON oe.id = es.event_id
    WHERE es.id = event_schedule_guest_categories.schedule_id
    AND oe.user_id = auth.uid()
  )
);

-- RLS Policies for food session guest categories
ALTER TABLE event_food_session_guest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage food session guest categories for their events"
ON event_food_session_guest_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM event_food_sessions efs
    JOIN outreach_events oe ON oe.id = efs.event_id
    WHERE efs.id = event_food_session_guest_categories.food_session_id
    AND oe.user_id = auth.uid()
  )
);