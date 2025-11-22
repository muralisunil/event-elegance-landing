import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Venue } from './useVenues';

export interface VenueHall {
  id: string;
  venue_id: string;
  hall_name: string;
  description: string | null;
  dimensions_length: number;
  dimensions_width: number;
  dimensions_height: number | null;
  layout_type: 'fixed' | 'configurable' | 'blank';
  capacity: number;
  stage_position: string | null;
  has_stage: boolean;
  has_lobby: boolean;
  lobby_dimensions: string | null;
  pricing_per_day: number | null;
  is_available: boolean;
  custom_layout_data: string | null;
}

export interface VenueAmenity {
  id: string;
  venue_id: string;
  amenity_name: string;
  amenity_type: string;
  description: string | null;
  is_available: boolean;
}

export interface VenueImage {
  id: string;
  venue_id: string;
  hall_id: string | null;
  image_url: string;
  image_type: string;
  caption: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface VenueObstruction {
  id: string;
  hall_id: string;
  obstruction_type: string;
  position_data: string; // JSON string with x, y coordinates
  dimensions: string | null; // JSON string with width, height
  description: string | null;
}

export const useVenueDetails = (venueId: string | undefined) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [halls, setHalls] = useState<VenueHall[]>([]);
  const [amenities, setAmenities] = useState<VenueAmenity[]>([]);
  const [images, setImages] = useState<VenueImage[]>([]);
  const [obstructions, setObstructions] = useState<VenueObstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  const fetchVenueDetails = async () => {
    if (!venueId) return;

    try {
      setLoading(true);

      // Fetch venue details
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (venueError) throw venueError;
      setVenue(venueData);

      // Fetch halls
      const { data: hallsData, error: hallsError } = await supabase
        .from('venue_halls')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_available', true)
        .order('hall_name');

      if (hallsError) throw hallsError;
      setHalls((hallsData as VenueHall[]) || []);

      // Fetch amenities
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('venue_amenities')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_available', true);

      if (amenitiesError) throw amenitiesError;
      setAmenities(amenitiesData || []);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('venue_images')
        .select('*')
        .eq('venue_id', venueId)
        .order('display_order');

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Fetch obstructions for all halls
      const { data: obstructionsData, error: obstructionsError } = await supabase
        .from('venue_obstructions')
        .select('*')
        .in('hall_id', (hallsData as VenueHall[])?.map(h => h.id) || []);

      if (obstructionsError) throw obstructionsError;
      setObstructions(obstructionsData || []);

    } catch (error: any) {
      console.error('Error fetching venue details:', error);
      toast({
        title: "Error",
        description: "Failed to load venue details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { venue, halls, amenities, images, obstructions, loading, refetch: fetchVenueDetails };
};
