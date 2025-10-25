-- Add new event types to the enum
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'conference';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'webinar';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'hackathon';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'meetup';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'exhibition';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'panel_discussion';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'town_hall';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'open_house';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'career_fair';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'health_screening';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'blood_donation';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'food_drive';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'mentorship_program';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'educational_tour';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'sports_event';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'cultural_event';
ALTER TYPE outreach_event_type ADD VALUE IF NOT EXISTS 'charity_auction';

-- Add new columns to outreach_events table
ALTER TABLE public.outreach_events 
  ADD COLUMN IF NOT EXISTS age_restriction TEXT,
  ADD COLUMN IF NOT EXISTS event_end_date DATE,
  ADD COLUMN IF NOT EXISTS event_end_time TIME,
  ADD COLUMN IF NOT EXISTS is_multi_day BOOLEAN DEFAULT false;

-- Add check constraint for age restriction values
ALTER TABLE public.outreach_events 
  ADD CONSTRAINT valid_age_restriction 
  CHECK (age_restriction IS NULL OR age_restriction IN (
    'all_ages', '18+', '21+', 'children_only', 
    'teens_only', 'adults_only', 'seniors_only'
  ));