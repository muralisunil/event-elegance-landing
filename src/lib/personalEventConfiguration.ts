import { supabase } from "@/integrations/supabase/client";

// Event types that support guest view
export const COLLABORATIVE_EVENT_TYPES = [
  'pot_luck',
  'family_reunion',
  'school_reunion',
  'friends_reunion',
];

// Default guest access per event type
export const eventTypeGuestAccess: Record<string, {
  allowGuestView: boolean;
  viewableSections: string[];
  description: string;
}> = {
  pot_luck: {
    allowGuestView: true,
    viewableSections: ['food', 'schedule', 'guests', 'venues'],
    description: 'Guests can coordinate what to bring and see who else is attending',
  },
  family_reunion: {
    allowGuestView: true,
    viewableSections: ['schedule', 'guests', 'venues', 'logistics'],
    description: 'Family members can view event details and plan accordingly',
  },
  school_reunion: {
    allowGuestView: true,
    viewableSections: ['schedule', 'guests', 'venues'],
    description: 'Alumni can see who is attending and the event schedule',
  },
  friends_reunion: {
    allowGuestView: true,
    viewableSections: ['schedule', 'guests', 'venues'],
    description: 'Friends can view event details and coordinate attendance',
  },
};

export const canEnableGuestView = (eventTypes: string[]): boolean => {
  return eventTypes.some(type => COLLABORATIVE_EVENT_TYPES.includes(type));
};

export const getRecommendedGuestAccess = (eventTypes: string[]) => {
  const hasCollaborative = eventTypes.some(type => COLLABORATIVE_EVENT_TYPES.includes(type));
  
  if (!hasCollaborative) {
    return {
      allowGuestView: false,
      viewableSections: [],
      reason: 'This event type is typically organizer-managed',
    };
  }
  
  // Merge sections from all collaborative types
  const sections = new Set<string>();
  let descriptions: string[] = [];
  
  eventTypes.forEach(type => {
    const config = eventTypeGuestAccess[type];
    if (config?.allowGuestView) {
      config.viewableSections.forEach(s => sections.add(s));
      descriptions.push(config.description);
    }
  });
  
  return {
    allowGuestView: true,
    viewableSections: Array.from(sections),
    reason: descriptions.join('. '),
  };
};

// Function to link guest email to user account
export const linkGuestToUser = async (
  eventId: string,
  guestId: string,
  invitationCode: string,
  userId: string
) => {
  const { error } = await supabase
    .from('personal_event_guest_access')
    .upsert({
      event_id: eventId,
      guest_id: guestId,
      user_id: userId,
      invitation_code: invitationCode,
      last_accessed_at: new Date().toISOString(),
      access_count: 1,
    }, {
      onConflict: 'event_id,guest_id',
    });
  
  if (error) throw error;
};

export interface PersonalEventConfiguration {
  id: string;
  event_id: string;
  feature_venues_enabled: boolean;
  feature_schedule_enabled: boolean;
  feature_logistics_enabled: boolean;
  feature_food_planning_enabled: boolean;
  feature_tasks_enabled: boolean;
  feature_marketplace_enabled: boolean;
  is_published: boolean;
  published_at: string | null;
  invitation_image_url: string | null;
}

export const getPersonalEventConfiguration = async (eventId: string): Promise<PersonalEventConfiguration | null> => {
  const { data, error } = await supabase
    .from('personal_event_configurations')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching personal event configuration:', error);
    return null;
  }

  return data;
};

export const updatePersonalEventConfiguration = async (
  eventId: string,
  updates: Partial<Omit<PersonalEventConfiguration, "id" | "event_id">>
) => {
  const { data, error } = await supabase
    .from('personal_event_configurations')
    .update(updates)
    .eq('event_id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const initializeDefaultPersonalConfiguration = async (eventId: string, eventTypes: string[] = []) => {
  const existingConfig = await getPersonalEventConfiguration(eventId);
  
  if (existingConfig) {
    return existingConfig;
  }

  const guestAccess = getRecommendedGuestAccess(eventTypes);

  const { data, error } = await supabase
    .from('personal_event_configurations')
    .insert({
      event_id: eventId,
      feature_venues_enabled: true,
      feature_schedule_enabled: true,
      feature_logistics_enabled: true,
      feature_food_planning_enabled: true,
      feature_tasks_enabled: true,
      feature_marketplace_enabled: true,
      is_published: false,
      allow_guest_view: guestAccess.allowGuestView,
      guest_viewable_sections: guestAccess.viewableSections,
    })
    .select()
    .single();

  if (error) throw error;

  await initializeDefaultGuestCategories(eventId);
  
  return data;
};

export const initializeDefaultGuestCategories = async (eventId: string) => {
  const defaultCategories = [
    { category_name: 'Family', display_color: '#10b981' },
    { category_name: 'Friends', display_color: '#3b82f6' },
    { category_name: 'Colleagues', display_color: '#f59e0b' },
  ];

  const { error } = await supabase
    .from('personal_event_guest_categories')
    .insert(
      defaultCategories.map(cat => ({
        event_id: eventId,
        ...cat,
      }))
    );

  if (error) {
    console.error('Error creating default guest categories:', error);
  }
};

export const generateInvitationCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
