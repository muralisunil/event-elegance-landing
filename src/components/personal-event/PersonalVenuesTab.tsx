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
      .maybeSingle();

    if (error) {
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

    let error;
    if (venue) {
      const result = await supabase
        .from('personal_event_venues')
        .update(venueData)
        .eq('id', venue.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('personal_event_venues')
        .insert(venueData);
      error = result.error;
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
      fetchVenue();
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

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : venue ? "Update Venue" : "Add Venue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalVenuesTab;
