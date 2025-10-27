import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTaskPermissions = (eventId: string) => {
  const [canManage, setCanManage] = useState(false);
  const [canView, setCanView] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [eventId]);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is owner
      const { data: event } = await supabase
        .from('outreach_events')
        .select('user_id')
        .eq('id', eventId)
        .single();

      if (event?.user_id === user.id) {
        setIsOwner(true);
        setCanManage(true);
        setCanView(true);
        setLoading(false);
        return;
      }

      // Check volunteer permissions
      const { data: volunteer } = await supabase
        .from('event_volunteers')
        .select('id, email')
        .eq('event_id', eventId)
        .eq('email', user.email)
        .maybeSingle();

      if (volunteer) {
        setCanView(true);
        
        const { data: permission } = await supabase
          .from('event_volunteer_permissions')
          .select('can_create_tasks')
          .eq('event_id', eventId)
          .eq('volunteer_id', volunteer.id)
          .maybeSingle();

        setCanManage(permission?.can_create_tasks || false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { canManage, canView, isOwner, loading };
};
