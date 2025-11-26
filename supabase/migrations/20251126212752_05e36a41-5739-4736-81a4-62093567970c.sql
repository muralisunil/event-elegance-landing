-- Create communication templates table
CREATE TABLE IF NOT EXISTS public.outreach_communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_subject TEXT,
  is_system_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create outreach communications table
CREATE TABLE IF NOT EXISTS public.outreach_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.outreach_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT,
  content JSONB NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create communication recipients table
CREATE TABLE IF NOT EXISTS public.outreach_communication_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID REFERENCES public.outreach_communications(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID,
  sent_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_communication_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (everyone can view system templates)
CREATE POLICY "Anyone can view system templates"
  ON public.outreach_communication_templates
  FOR SELECT
  USING (is_system_template = true);

-- RLS Policies for communications (event owners can manage)
CREATE POLICY "Event owners can create communications"
  ON public.outreach_communications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outreach_events
      WHERE id = event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can view their communications"
  ON public.outreach_communications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_events
      WHERE id = event_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for recipients
CREATE POLICY "Event owners can manage recipients"
  ON public.outreach_communication_recipients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_communications oc
      JOIN public.outreach_events oe ON oe.id = oc.event_id
      WHERE oc.id = communication_id AND oe.user_id = auth.uid()
    )
  );

-- Insert system templates
INSERT INTO public.outreach_communication_templates (name, template_type, fields, default_subject, is_system_template) VALUES
  ('Event Schedule', 'event_schedule', '[
    {"name":"event_date","label":"Event Date","type":"datetime","required":true},
    {"name":"venue","label":"Venue","type":"text","required":true},
    {"name":"agenda","label":"Agenda/Schedule","type":"textarea","required":true},
    {"name":"dress_code","label":"Dress Code","type":"select","options":["Formal","Business Casual","Casual","Traditional"]},
    {"name":"additional_notes","label":"Additional Notes","type":"textarea"}
  ]'::jsonb, 'Event Schedule - {eventName}', true),
  
  ('Venue Details', 'venue_details', '[
    {"name":"venue_name","label":"Venue Name","type":"text","required":true},
    {"name":"full_address","label":"Full Address","type":"textarea","required":true},
    {"name":"parking_info","label":"Parking Information","type":"textarea"},
    {"name":"directions","label":"Directions","type":"textarea"},
    {"name":"accessibility","label":"Accessibility Info","type":"textarea"},
    {"name":"map_link","label":"Google Maps Link","type":"url"}
  ]'::jsonb, 'Venue Information - {eventName}', true),
  
  ('Registration Info', 'registration', '[
    {"name":"registration_link","label":"Registration Link","type":"url","required":true},
    {"name":"deadline","label":"Registration Deadline","type":"datetime","required":true},
    {"name":"requirements","label":"Requirements","type":"textarea"},
    {"name":"fees","label":"Registration Fees","type":"text"},
    {"name":"contact_info","label":"Contact for Queries","type":"text"}
  ]'::jsonb, 'Registration Details - {eventName}', true),
  
  ('Announcement', 'announcement', '[
    {"name":"announcement_title","label":"Announcement Title","type":"text","required":true},
    {"name":"message","label":"Message","type":"textarea","required":true},
    {"name":"action_required","label":"Action Required","type":"select","options":["Yes","No"]},
    {"name":"action_deadline","label":"Action Deadline","type":"datetime"},
    {"name":"priority","label":"Priority","type":"select","options":["High","Medium","Low"]}
  ]'::jsonb, 'Announcement - {eventName}', true),
  
  ('Reminder', 'reminder', '[
    {"name":"reminder_type","label":"Reminder Type","type":"select","required":true,"options":["Event Date","Registration","Payment","Document Submission","Other"]},
    {"name":"key_details","label":"Key Details","type":"textarea","required":true},
    {"name":"deadline","label":"Deadline/Date","type":"datetime"},
    {"name":"action_link","label":"Action Link (if any)","type":"url"}
  ]'::jsonb, 'Reminder - {eventName}', true),
  
  ('Custom Message', 'other', '[
    {"name":"content","label":"Message Content","type":"richtext","required":true}
  ]'::jsonb, '{eventName}', true);

-- Add trigger for updated_at
CREATE TRIGGER update_outreach_communication_templates_updated_at
  BEFORE UPDATE ON public.outreach_communication_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();