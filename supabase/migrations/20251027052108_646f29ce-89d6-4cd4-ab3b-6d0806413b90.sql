-- Add is_system_category flag to guest categories
ALTER TABLE event_guest_categories
ADD COLUMN is_system_category BOOLEAN DEFAULT false;

-- Add internal tracking fields to guests
ALTER TABLE event_guests
ADD COLUMN internal_classification TEXT,
ADD COLUMN internal_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX idx_event_guests_category ON event_guests(guest_category_id);
CREATE INDEX idx_event_guests_status ON event_guests(invitation_status);
CREATE INDEX idx_event_guest_categories_system ON event_guest_categories(event_id, is_system_category);