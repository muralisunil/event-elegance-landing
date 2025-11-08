import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEventPermissions = (eventId: string, eventType: 'personal' | 'outreach') => {
  const [canEdit, setCanEdit] = useState(false);
  const [canView, setCanView] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [eventId, eventType]);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is owner
      const tableName = eventType === 'personal' ? 'personal_events' : 'outreach_events';
      const { data: event } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', eventId)
        .single();

      if (event?.user_id === user.id) {
        setIsOwner(true);
        setCanEdit(true);
        setCanView(true);
        setLoading(false);
        return;
      }

      // Check if user is assigned as a manager
      const { data: managerData } = await supabase
        .from('event_managers')
        .select('role')
        .eq('event_id', eventId)
        .eq('event_type', eventType)
        .eq('user_id', user.id)
        .maybeSingle();

      if (managerData) {
        setCanView(true);
        // Editor and Coordinator can edit, Viewer cannot
        setCanEdit(managerData.role === 'editor' || managerData.role === 'coordinator');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setLoading(false);
    }
  };

  return { canEdit, canView, isOwner, loading, refetch: checkPermissions };
};
