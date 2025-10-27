import { supabase } from "@/integrations/supabase/client";

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

export const initializeDefaultPersonalConfiguration = async (eventId: string) => {
  const existingConfig = await getPersonalEventConfiguration(eventId);
  
  if (existingConfig) {
    return existingConfig;
  }

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
