-- Create table for guest-organizer messages
CREATE TABLE public.personal_event_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES personal_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_organizer BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_event_messages ENABLE ROW LEVEL SECURITY;

-- Organizers and event owners can view all messages for their events
CREATE POLICY "Event owners and organizers can view messages"
ON public.personal_event_messages
FOR SELECT
USING (
  is_personal_event_owner(auth.uid(), event_id)
  OR is_personal_event_organizer(auth.uid(), event_id)
  OR sender_id = auth.uid()
);

-- Guests can view their own messages
CREATE POLICY "Guests can view their own messages"
ON public.personal_event_messages
FOR SELECT
USING (sender_id = auth.uid());

-- Guests can send messages
CREATE POLICY "Users can send messages to event organizers"
ON public.personal_event_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM personal_event_guest_access
    WHERE event_id = personal_event_messages.event_id
    AND user_id = auth.uid()
  )
);

-- Organizers can send messages
CREATE POLICY "Organizers can send messages"
ON public.personal_event_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND (
    is_personal_event_owner(auth.uid(), event_id)
    OR is_personal_event_organizer(auth.uid(), event_id)
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_personal_event_messages_updated_at
BEFORE UPDATE ON public.personal_event_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_personal_event_messages_event_id ON public.personal_event_messages(event_id);
CREATE INDEX idx_personal_event_messages_sender_id ON public.personal_event_messages(sender_id);

COMMENT ON TABLE public.personal_event_messages IS 'Messages between guests and event organizers';