-- Create organization activity logs table
CREATE TABLE public.organization_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_org_activity_logs_org_id ON public.organization_activity_logs(organization_id);
CREATE INDEX idx_org_activity_logs_created_at ON public.organization_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.organization_activity_logs ENABLE ROW LEVEL SECURITY;

-- Members can view activity logs of their organizations
CREATE POLICY "Members can view organization activity logs"
ON public.organization_activity_logs
FOR SELECT
USING (is_org_member(auth.uid(), organization_id));

-- System can insert activity logs (for triggers/functions)
CREATE POLICY "Authenticated users can create activity logs"
ON public.organization_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_org_member(auth.uid(), organization_id));

-- Admins can manage all activity logs
CREATE POLICY "Admins can manage all activity logs"
ON public.organization_activity_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'));