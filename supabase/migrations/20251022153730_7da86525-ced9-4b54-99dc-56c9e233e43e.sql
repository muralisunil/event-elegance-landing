-- Add guest management columns to outreach_events table
ALTER TABLE public.outreach_events
ADD COLUMN max_guests INTEGER NULL,
ADD COLUMN is_unlimited_guests BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN allow_accompanies BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN max_accompanies_per_guest INTEGER NULL;

-- Add check constraint to ensure max_accompanies is valid when enabled
ALTER TABLE public.outreach_events
ADD CONSTRAINT valid_accompanies_count 
CHECK (
  (allow_accompanies = false AND max_accompanies_per_guest IS NULL) OR
  (allow_accompanies = true AND max_accompanies_per_guest >= 1 AND max_accompanies_per_guest <= 10)
);

-- Add check constraint to ensure max_guests is valid when not unlimited
ALTER TABLE public.outreach_events
ADD CONSTRAINT valid_guest_count 
CHECK (
  (is_unlimited_guests = true AND max_guests IS NULL) OR
  (is_unlimited_guests = false AND max_guests >= 1)
);