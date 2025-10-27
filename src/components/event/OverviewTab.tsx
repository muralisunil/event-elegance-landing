import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Calendar, PackageOpen, DollarSign, Clock, MapPin, 
  Target, FileText, Edit, Tag, Settings, CheckCircle2, XCircle,
  Building2, DoorOpen, UtensilsCrossed
} from "lucide-react";
import { formatDuration, formatTimeTo12Hour } from "@/lib/utils";
import { format } from "date-fns";
import { EditBasicInfoDialog } from "./EditBasicInfoDialog";
import { ManageEventTypesDialog } from "./ManageEventTypesDialog";
import { GuestCategoryManager } from "./GuestCategoryManager";
import { getEventConfiguration } from "@/lib/eventConfiguration";

import { GuestStatsDashboard } from "./GuestStatsDashboard";

interface OverviewTabProps {
  event: any;
}

const OverviewTab = ({ event }: OverviewTabProps) => {
  const [counts, setCounts] = useState({
    volunteers: 0,
    sponsors: 0,
    vendors: 0,
    guests: 0,
    totalSponsorship: 0,
    scheduleSessions: 0,
    logisticsItems: 0,
    totalBudget: 0,
    foodSessions: 0,
  });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [guestCategories, setGuestCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [event.id]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCounts(),
      fetchBuildingsAndRooms(),
      fetchGuestCategories(),
      fetchConfig(),
    ]);
  };

  const fetchConfig = async () => {
    const configuration = await getEventConfiguration(event.id);
    setConfig(configuration);
  };

  const fetchCounts = async () => {
    const [
      volunteersRes,
      sponsorsRes,
      vendorsRes,
      guestsRes,
      scheduleRes,
      logisticsRes,
      foodRes,
    ] = await Promise.all([
      supabase.from("event_volunteers").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_sponsors").select("contribution_amount, status").eq("event_id", event.id),
      supabase.from("event_vendors").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_guests").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_schedules").select("*", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("event_logistics").select("estimated_cost").eq("event_id", event.id),
      supabase.from("event_food_sessions").select("*", { count: "exact", head: true }).eq("event_id", event.id),
    ]);

    const totalSponsorship = (sponsorsRes.data || [])
      .filter((s: any) => s.status === "confirmed" && s.contribution_amount)
      .reduce((sum: number, s: any) => sum + parseFloat(s.contribution_amount), 0);

    const totalBudget = (logisticsRes.data || []).reduce(
      (sum, item) => sum + (Number(item.estimated_cost) || 0),
      0
    );

    setCounts({
      volunteers: volunteersRes.count || 0,
      sponsors: sponsorsRes.data?.length || 0,
      vendors: vendorsRes.count || 0,
      guests: guestsRes.count || 0,
      totalSponsorship,
      scheduleSessions: scheduleRes.count || 0,
      logisticsItems: logisticsRes.data?.length || 0,
      totalBudget,
      foodSessions: foodRes.count || 0,
    });
  };

  const fetchBuildingsAndRooms = async () => {
    const [buildingsRes, roomsRes] = await Promise.all([
      supabase.from("event_buildings").select("*").eq("event_id", event.id).order("order_index"),
      supabase.from("event_rooms").select("*").eq("event_id", event.id).order("order_index"),
    ]);

    if (buildingsRes.data) setBuildings(buildingsRes.data);
    if (roomsRes.data) setRooms(roomsRes.data);
  };

  const fetchGuestCategories = async () => {
    const { data } = await supabase
      .from("event_guest_categories")
      .select("*")
      .eq("event_id", event.id)
      .order("category_level", { ascending: false });

    if (data) setGuestCategories(data);
  };

  const getEventTypeLabel = (value: string) => {
    const types: Record<string, string> = {
      workshop: "Workshop",
      seminar: "Seminar",
      community_service: "Community Service",
      awareness_campaign: "Awareness Campaign",
      fundraiser: "Fundraiser",
      networking: "Networking Event",
      training: "Training Session",
      volunteer: "Volunteer Activity",
      conference: "Conference",
      webinar: "Webinar",
      hackathon: "Hackathon",
      meetup: "Meetup",
      exhibition: "Exhibition",
      panel_discussion: "Panel Discussion",
      town_hall: "Town Hall",
      open_house: "Open House",
      career_fair: "Career Fair",
      health_screening: "Health Screening",
      blood_donation: "Blood Donation",
      food_drive: "Food Drive",
      mentorship_program: "Mentorship Program",
      educational_tour: "Educational Tour",
      sports_event: "Sports Event",
      cultural_event: "Cultural Event",
      charity_auction: "Charity Auction",
    };
    return types[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Publishing Status */}
      {config && (
        <Card className={config.is_published ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.is_published ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Event Published</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Published on {format(new Date(config.published_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Draft Event</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This event has not been published yet
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Statistics Dashboard */}
      <GuestStatsDashboard 
        eventId={event.id}
        maxGuests={event.max_guests}
        isUnlimited={event.is_unlimited_guests}
      />

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.guests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.volunteers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsorship</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${counts.totalSponsorship.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logistics Budget</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${counts.totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditInfoOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Event Name</p>
                <p className="font-medium">{event.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>
                    {format(new Date(event.event_date), "MMM d, yyyy")}
                    {event.is_multi_day && event.event_end_date && (
                      <> - {format(new Date(event.event_end_date), "MMM d, yyyy")}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>
                    {formatTimeTo12Hour(event.event_time)}
                    {event.event_end_time && <> - {formatTimeTo12Hour(event.event_end_time)}</>}
                    {event.duration_minutes && (
                      <span className="text-muted-foreground ml-2">
                        ({formatDuration(event.duration_minutes)})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {event.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{event.description}</p>
                </div>
              )}

              {event.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                  <p className="text-sm">{event.purpose}</p>
                </div>
              )}

              {event.goal && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Goal</p>
                  <p className="text-sm">{event.goal}</p>
                </div>
              )}

              {event.age_restriction && event.age_restriction !== "all_ages" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Age Restrictions</p>
                  <Badge variant="outline">{event.age_restriction}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Types</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setManageTypesOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Manage Types
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(event.event_types || []).map((type: string) => (
              <Badge key={type} variant="secondary">
                {getEventTypeLabel(type)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guest Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Guest Categories</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setManageCategoriesOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </CardHeader>
        <CardContent>
          {guestCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guest categories configured</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {guestCategories.map((category) => (
                <Badge key={category.id} style={{ backgroundColor: category.display_color }}>
                  {category.category_name}
                  {category.max_guests && ` (Max: ${category.max_guests})`}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Venue Information */}
      {buildings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {buildings.map((building) => {
              const buildingRooms = rooms.filter((r) => r.building_id === building.id);
              return (
                <div key={building.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{building.building_name}</p>
                  </div>
                  {building.address && (
                    <p className="text-sm text-muted-foreground ml-6">{building.address}</p>
                  )}
                  {buildingRooms.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {buildingRooms.map((room) => (
                        <div key={room.id} className="flex items-center gap-2 text-sm">
                          <DoorOpen className="h-3 w-3 text-muted-foreground" />
                          <span>{room.room_name}</span>
                          {room.capacity && (
                            <span className="text-muted-foreground">(Capacity: {room.capacity})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Additional Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {counts.scheduleSessions > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.scheduleSessions}</div>
            </CardContent>
          </Card>
        )}

        {counts.sponsors > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.sponsors}</div>
            </CardContent>
          </Card>
        )}

        {counts.vendors > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.vendors}</div>
            </CardContent>
          </Card>
        )}

        {counts.foodSessions > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Sessions</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.foodSessions}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <EditBasicInfoDialog
        open={editInfoOpen}
        onOpenChange={setEditInfoOpen}
        event={event}
        onSuccess={fetchAllData}
      />

      <ManageEventTypesDialog
        open={manageTypesOpen}
        onOpenChange={setManageTypesOpen}
        event={event}
        onSuccess={fetchAllData}
      />

      <GuestCategoryManager
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        eventId={event.id}
        onSuccess={fetchGuestCategories}
      />
    </div>
  );
};

export default OverviewTab;
