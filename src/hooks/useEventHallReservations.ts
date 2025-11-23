import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EventHallReservation {
  id: string;
  event_id: string;
  venue_id: string;
  hall_id: string;
  reservation_date: string;
  start_date: string;
  end_date: string;
  reservation_status: 'pending' | 'confirmed' | 'cancelled';
  cost: number | null;
  seating_layout_customization: any;
  special_requirements: string | null;
  notes: string | null;
  reserved_by: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventHallReservations = (eventId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["event-hall-reservations", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from("event_hall_reservations")
        .select("*, venue_halls(hall_name, dimensions_width, dimensions_length, capacity)")
        .eq("event_id", eventId)
        .order("reservation_date", { ascending: false });

      if (error) throw error;
      return data as EventHallReservation[];
    },
    enabled: !!eventId,
  });

  const createReservation = useMutation({
    mutationFn: async (reservation: {
      event_id: string;
      venue_id: string;
      hall_id: string;
      start_date: string;
      end_date: string;
      cost?: number;
      seating_layout_customization?: any;
      special_requirements?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("event_hall_reservations")
        .insert({
          ...reservation,
          reservation_date: new Date().toISOString(),
          reserved_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-hall-reservations"] });
      toast.success("Hall reservation created successfully");
    },
    onError: (error) => {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create hall reservation");
    },
  });

  const updateReservationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' }) => {
      const updateData: any = { reservation_status: status };
      if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
      if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("event_hall_reservations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-hall-reservations"] });
      toast.success("Reservation status updated");
    },
    onError: (error) => {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation status");
    },
  });

  return {
    reservations,
    isLoading,
    createReservation,
    updateReservationStatus,
  };
};
