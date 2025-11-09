import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usePersonalEventGuestAccess } from "@/hooks/usePersonalEventGuestAccess";
import { GuestViewHeader } from "@/components/personal-event/guest-view/GuestViewHeader";
import { GuestViewSchedule } from "@/components/personal-event/guest-view/GuestViewSchedule";
import { GuestViewFood } from "@/components/personal-event/guest-view/GuestViewFood";
import { GuestViewGuests } from "@/components/personal-event/guest-view/GuestViewGuests";
import { GuestViewVenues } from "@/components/personal-event/guest-view/GuestViewVenues";
import { GuestViewLogistics } from "@/components/personal-event/guest-view/GuestViewLogistics";
import { OrganizerContactInfo } from "@/components/personal-event/guest-view/OrganizerContactInfo";
import { MessageOrganizers } from "@/components/personal-event/guest-view/MessageOrganizers";

const ViewPersonalEvent = () => {
  const { invitationCode } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [foodSessions, setFoodSessions] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [eventOwner, setEventOwner] = useState<any>(null);

  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);
  
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view event details");
      navigate("/auth");
      return;
    }
    
    if (invitationCode) {
      fetchEventData();
    }
  }, [invitationCode, user]);

  const accessState = usePersonalEventGuestAccess(
    event?.id || '', 
    invitationCode
  );

  const fetchEventData = async () => {
    if (!invitationCode) return;

    try {
      setLoading(true);

      // Fetch invitation and event
      const { data: invData, error: invError } = await supabase
        .from('personal_event_invitations')
        .select('*, personal_event_guests(*), personal_events(*)')
        .eq('invitation_code', invitationCode)
        .single();

      if (invError) throw invError;
      
      setInvitation(invData);
      setEvent(invData.personal_events);

      // Fetch all data in parallel
      const eventId = invData.event_id;
      
      const [schedulesData, foodData, guestsData, venuesData, logisticsData, organizersData, ownerProfileData] = await Promise.all([
        supabase.from('personal_event_schedules').select('*').eq('event_id', eventId),
        supabase.from('personal_event_food_sessions').select('*, food_items:personal_event_food_items(*)').eq('event_id', eventId),
        supabase.from('personal_event_guests').select('*, guest_category:personal_event_guest_categories(*)').eq('event_id', eventId),
        supabase.from('personal_event_venues').select('*').eq('event_id', eventId),
        supabase.from('personal_event_logistics').select('*').eq('event_id', eventId),
        supabase.from('personal_event_organizers').select('*').eq('event_id', eventId).eq('status', 'accepted'),
        supabase.from('profiles').select('full_name, id').eq('id', invData.personal_events.user_id).single(),
      ]);

      setSchedules(schedulesData.data || []);
      setFoodSessions(foodData.data || []);
      setGuests(guestsData.data || []);
      setVenues(venuesData.data || []);
      setLogistics(logisticsData.data || []);
      setOrganizers(organizersData.data || []);
      
      // Set owner info - we'll show the name and provide a contact button
      setEventOwner({
        name: ownerProfileData.data?.full_name || 'Event Owner',
        email: 'Contact via messaging',
      });
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error(error.message || "Failed to load event");
      navigate("/personal-events");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCoOrganizer = () => {
    toast.info("Please contact the event organizer to request co-organizer access");
  };

  const handleRSVP = () => {
    navigate(`/rsvp/${invitationCode}`);
  };

  if (loading || accessState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!accessState.canView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            Guest view is not enabled for this event, or your invitation link is invalid.
          </p>
          <Button onClick={() => navigate("/personal-events")}>
            Go to Personal Events
          </Button>
        </div>
      </div>
    );
  }

  const isPotLuck = event?.event_types?.includes('pot_luck');

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/personal-events")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Events
        </Button>

        <GuestViewHeader
          event={event}
          rsvpStatus={invitation?.response}
          onRSVP={handleRSVP}
          onRequestCoOrganizer={handleRequestCoOrganizer}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {eventOwner && (
              <OrganizerContactInfo 
                organizers={organizers}
                eventOwner={eventOwner}
              />
            )}
          </div>
          <div>
            <MessageOrganizers eventId={event.id} />
          </div>
        </div>

        <Tabs defaultValue={accessState.viewableSections[0] || 'schedule'} className="w-full">
          <TabsList className="w-full justify-start">
            {accessState.viewableSections.includes('schedule') && (
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            )}
            {accessState.viewableSections.includes('food') && (
              <TabsTrigger value="food">Food</TabsTrigger>
            )}
            {accessState.viewableSections.includes('guests') && (
              <TabsTrigger value="guests">Guests</TabsTrigger>
            )}
            {accessState.viewableSections.includes('venues') && (
              <TabsTrigger value="venues">Venues</TabsTrigger>
            )}
            {accessState.viewableSections.includes('logistics') && (
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            )}
          </TabsList>

          {accessState.viewableSections.includes('schedule') && (
            <TabsContent value="schedule">
              <GuestViewSchedule schedules={schedules} />
            </TabsContent>
          )}

          {accessState.viewableSections.includes('food') && (
            <TabsContent value="food">
              <GuestViewFood 
                foodSessions={foodSessions} 
                isPotLuck={isPotLuck}
              />
            </TabsContent>
          )}

          {accessState.viewableSections.includes('guests') && (
            <TabsContent value="guests">
              <GuestViewGuests guests={guests} />
            </TabsContent>
          )}

          {accessState.viewableSections.includes('venues') && (
            <TabsContent value="venues">
              <GuestViewVenues venues={venues} />
            </TabsContent>
          )}

          {accessState.viewableSections.includes('logistics') && (
            <TabsContent value="logistics">
              <GuestViewLogistics logistics={logistics} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ViewPersonalEvent;
