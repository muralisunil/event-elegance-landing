import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EventVenueBooking {
  id: string;
  event_id: string;
  venue_id: string;
  booking_date: string;
  start_date: string;
  end_date: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled';
  total_cost: number | null;
  special_requirements: string | null;
  notes: string | null;
  booked_by: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventVenueBookings = (eventId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["event-venue-bookings", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from("event_venue_bookings")
        .select("*")
        .eq("event_id", eventId)
        .order("booking_date", { ascending: false });

      if (error) throw error;
      return data as EventVenueBooking[];
    },
    enabled: !!eventId,
  });

  const createBooking = useMutation({
    mutationFn: async (booking: {
      event_id: string;
      venue_id: string;
      start_date: string;
      end_date: string;
      total_cost?: number;
      special_requirements?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("event_venue_bookings")
        .insert({
          ...booking,
          booking_date: new Date().toISOString(),
          booked_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-venue-bookings"] });
      toast.success("Venue booking created successfully");
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      toast.error("Failed to create venue booking");
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' }) => {
      const updateData: any = { booking_status: status };
      if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
      if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("event_venue_bookings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-venue-bookings"] });
      toast.success("Booking status updated");
    },
    onError: (error) => {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    },
  });

  return {
    bookings,
    isLoading,
    createBooking,
    updateBookingStatus,
  };
};
