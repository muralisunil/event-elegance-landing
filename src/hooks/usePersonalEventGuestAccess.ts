import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { linkGuestToUser } from '@/lib/personalEventConfiguration';

interface GuestAccessState {
  isOwner: boolean;
  isOrganizer: boolean;
  isGuest: boolean;
  canView: boolean;
  canEdit: boolean;
  viewableSections: string[];
  guestViewEnabled: boolean;
  loading: boolean;
}

export const usePersonalEventGuestAccess = (
  eventId: string,
  invitationCode?: string
) => {
  const [accessState, setAccessState] = useState<GuestAccessState>({
    isOwner: false,
    isOrganizer: false,
    isGuest: false,
    canView: false,
    canEdit: false,
    viewableSections: [],
    guestViewEnabled: false,
    loading: true,
  });

  useEffect(() => {
    checkAccess();
  }, [eventId, invitationCode]);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setAccessState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Check if owner
    const { data: event } = await supabase
      .from('personal_events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (event?.user_id === user.id) {
      setAccessState({
        isOwner: true,
        isOrganizer: false,
        isGuest: false,
        canView: true,
        canEdit: true,
        viewableSections: ['schedule', 'food', 'guests', 'venues', 'logistics'],
        guestViewEnabled: false,
        loading: false,
      });
      return;
    }

    // Check if organizer
    const { data: organizer } = await supabase
      .from('personal_event_organizers')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', user.email)
      .maybeSingle();

    if (organizer) {
      setAccessState({
        isOwner: false,
        isOrganizer: true,
        isGuest: false,
        canView: true,
        canEdit: true,
        viewableSections: [],
        guestViewEnabled: false,
        loading: false,
      });
      return;
    }

    // Check if guest with invitation code
    if (invitationCode) {
      const { data: invitation } = await supabase
        .from('personal_event_invitations')
        .select('guest_id, event_id')
        .eq('invitation_code', invitationCode)
        .eq('event_id', eventId)
        .maybeSingle();

      if (invitation) {
        // Get event configuration
        const { data: config } = await supabase
          .from('personal_event_configurations')
          .select('allow_guest_view, guest_viewable_sections')
          .eq('event_id', eventId)
          .single();

        // Link guest to user account (if not already linked)
        try {
          await linkGuestToUser(eventId, invitation.guest_id, invitationCode, user.id);
        } catch (err) {
          console.error('Error linking guest to user:', err);
        }

        setAccessState({
          isOwner: false,
          isOrganizer: false,
          isGuest: true,
          canView: config?.allow_guest_view || false,
          canEdit: false,
          viewableSections: Array.isArray(config?.guest_viewable_sections) 
            ? (config.guest_viewable_sections as string[])
            : [],
          guestViewEnabled: config?.allow_guest_view || false,
          loading: false,
        });
        return;
      }
    }

    // No access
    setAccessState(prev => ({ ...prev, loading: false }));
  };

  return { ...accessState, refresh: checkAccess };
};
