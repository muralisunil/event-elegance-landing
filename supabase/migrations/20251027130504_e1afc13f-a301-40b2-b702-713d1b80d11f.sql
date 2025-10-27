-- Add building and room foreign keys to event_food_sessions
ALTER TABLE event_food_sessions
ADD COLUMN building_id UUID REFERENCES event_buildings(id) ON DELETE SET NULL,
ADD COLUMN room_id UUID REFERENCES event_rooms(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_food_sessions_building ON event_food_sessions(building_id);
CREATE INDEX idx_food_sessions_room ON event_food_sessions(room_id);