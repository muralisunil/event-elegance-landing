import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MapPin, Users, FileText } from "lucide-react";

interface PersonalVenuesTabProps {
  eventId: string;
}

const PersonalVenuesTab = ({ eventId }: PersonalVenuesTabProps) => {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    venue_name: "",
    address: "",
    capacity: "",
    facilities: "",
    notes: "",
  });

  useEffect(() => {
    fetchVenue();
  }, [eventId]);

  const fetchVenue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_event_venues')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching venue:", error);
    } else if (data) {
      setVenue(data);
      setFormData({
        venue_name: data.venue_name || "",
        address: data.address || "",
        capacity: data.capacity?.toString() || "",
        facilities: data.facilities || "",
        notes: data.notes || "",
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const venueData = {
      event_id: eventId,
      venue_name: formData.venue_name,
      address: formData.address || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      facilities: formData.facilities || null,
      notes: formData.notes || null,
    };

    let error, data;
    if (venue) {
      const result = await supabase
        .from('personal_event_venues')
        .update(venueData)
        .eq('id', venue.id)
        .select()
        .single();
      error = result.error;
      data = result.data;
    } else {
      const result = await supabase
        .from('personal_event_venues')
        .insert(venueData)
        .select()
        .single();
      error = result.error;
      data = result.data;
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save venue.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Venue saved successfully.",
      });
      if (data) {
        setVenue(data);
        setFormData({
          venue_name: data.venue_name || "",
          address: data.address || "",
          capacity: data.capacity?.toString() || "",
          facilities: data.facilities || "",
          notes: data.notes || "",
        });
        setIsEditing(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!venue) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('personal_event_venues')
      .delete()
      .eq('id', venue.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete venue.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Venue deleted successfully.",
      });
      setVenue(null);
      setFormData({
        venue_name: "",
        address: "",
        capacity: "",
        facilities: "",
        notes: "",
      });
      setIsEditing(true);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading venue...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Venue Information</h2>
        <p className="text-sm text-muted-foreground">
          Manage venue details for your event
        </p>
      </div>

      {!isEditing && venue ? (
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue Name</p>
                  <p className="font-medium">{venue.venue_name}</p>
                </div>
              </div>
            </div>

            {venue.address && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{venue.address}</p>
              </div>
            )}

            {venue.capacity && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p>{venue.capacity} guests</p>
                  </div>
                </div>
              </div>
            )}

            {venue.facilities && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Facilities</p>
                <p>{venue.facilities}</p>
              </div>
            )}

            {venue.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Additional Notes</p>
                    <p>{venue.notes}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsEditing(true)}>
                Edit Venue
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete Venue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    placeholder="e.g., My Home, Community Center"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Maximum number of guests"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities</Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="e.g., Parking, Kitchen, Sound System"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any other details about the venue"
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : venue ? "Update Venue" : "Add Venue"}
                </Button>
                {venue && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        venue_name: venue.venue_name || "",
                        address: venue.address || "",
                        capacity: venue.capacity?.toString() || "",
                        facilities: venue.facilities || "",
                        notes: venue.notes || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalVenuesTab;
