import { supabase } from "@/integrations/supabase/client";

export interface EventConfiguration {
  id: string;
  event_id: string;
  feature_volunteers_enabled: boolean;
  feature_sponsors_enabled: boolean;
  feature_vendors_enabled: boolean;
  feature_venues_enabled: boolean;
  feature_schedule_enabled: boolean;
  feature_logistics_enabled: boolean;
  feature_food_planning_enabled: boolean;
  is_published: boolean;
  published_at: string | null;
  invitation_image_url: string | null;
}

export async function getEventConfiguration(eventId: string): Promise<EventConfiguration | null> {
  const { data, error } = await supabase
    .from("event_configurations")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching event configuration:", error);
    return null;
  }

  return data;
}

export async function updateEventConfiguration(
  eventId: string,
  updates: Partial<Omit<EventConfiguration, "id" | "event_id">>
) {
  const { data, error } = await supabase
    .from("event_configurations")
    .update(updates)
    .eq("event_id", eventId)
    .select()
    .single();

  if (error) {
    console.error("Error updating event configuration:", error);
    throw error;
  }

  return data;
}

export async function initializeDefaultConfiguration(eventId: string) {
  // Check if configuration already exists
  const existing = await getEventConfiguration(eventId);
  if (existing) {
    return existing;
  }

  // Create default configuration
  const { data, error } = await supabase
    .from("event_configurations")
    .insert({
      event_id: eventId,
      feature_volunteers_enabled: true,
      feature_sponsors_enabled: true,
      feature_vendors_enabled: true,
      feature_venues_enabled: true,
      feature_schedule_enabled: true,
      feature_logistics_enabled: true,
      feature_food_planning_enabled: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error initializing configuration:", error);
    throw error;
  }

  // Create default guest categories
  await initializeDefaultGuestCategories(eventId);

  return data;
}

export async function initializeDefaultGuestCategories(eventId: string) {
  const defaultCategories = [
    { category_name: "General", category_level: 0, display_color: "#6b7280" },
    { category_name: "VIP", category_level: 1, display_color: "#f59e0b" },
    { category_name: "VVIP", category_level: 2, display_color: "#8b5cf6" },
  ];

  const { error } = await supabase.from("event_guest_categories").insert(
    defaultCategories.map((cat) => ({
      event_id: eventId,
      ...cat,
    }))
  );

  if (error) {
    console.error("Error initializing guest categories:", error);
  }
}

export function generateInvitationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
