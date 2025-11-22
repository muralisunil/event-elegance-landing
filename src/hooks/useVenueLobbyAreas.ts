import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LobbyArea {
  id: string;
  venue_id: string;
  name: string;
  dimensions: string | null;
  location: string | null;
  max_booths: number | null;
  amenities: string[] | null;
  notes: string | null;
  custom_booth_layout_data: string | null;
  created_at: string;
  updated_at: string;
}

export const useVenueLobbyAreas = (venueId: string | undefined) => {
  return useQuery({
    queryKey: ["venue-lobby-areas", venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      const { data, error } = await supabase
        .from("venue_lobby_areas")
        .select("*")
        .eq("venue_id", venueId)
        .order("name");

      if (error) throw error;
      return data as LobbyArea[];
    },
    enabled: !!venueId,
  });
};
