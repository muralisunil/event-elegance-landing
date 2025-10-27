import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { personalEventTypes } from "@/lib/personalEventTypes";
import { initializeDefaultPersonalConfiguration } from "@/lib/personalEventConfiguration";

const CreatePersonalEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    event_types: [] as string[],
    event_date: "",
    event_time: "",
    location: "",
    description: "",
    purpose: "",
    max_guests: "",
    is_unlimited_guests: false,
    allow_accompanies: false,
    max_accompanies_per_guest: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.event_types.length === 0) {
      toast.error("Please select at least one event type");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: event, error } = await supabase
        .from('personal_events')
        .insert({
          user_id: user.id,
          name: formData.name,
          event_types: formData.event_types,
          event_date: formData.event_date,
          event_time: formData.event_time,
          location: formData.location,
          description: formData.description || null,
          purpose: formData.purpose || null,
          max_guests: formData.is_unlimited_guests ? null : parseInt(formData.max_guests) || null,
          is_unlimited_guests: formData.is_unlimited_guests,
          allow_accompanies: formData.allow_accompanies,
          max_accompanies_per_guest: formData.allow_accompanies && formData.max_accompanies_per_guest
            ? parseInt(formData.max_accompanies_per_guest)
            : null,
        })
        .select()
        .single();

      if (error) throw error;

      await initializeDefaultPersonalConfiguration(event.id);

      toast.success("Personal event created successfully!");
      navigate(`/manage-personal-event/${event.id}`);
    } catch (error: any) {
      console.error('Error creating personal event:', error);
      toast.error(error.message || "Failed to create personal event");
    } finally {
      setLoading(false);
    }
  };

  const toggleEventType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      event_types: prev.event_types.includes(type)
        ? prev.event_types.filter(t => t !== type)
        : [...prev.event_types, type]
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/personal-events')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Personal Event</h1>
          <p className="text-muted-foreground">Plan your celebration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Fill in the basic information about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sarah's 30th Birthday Party"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Event Type(s) *</Label>
              <div className="grid grid-cols-2 gap-3">
                {personalEventTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={formData.event_types.includes(type.value)}
                      onCheckedChange={() => toggleEventType(type.value)}
                    />
                    <Label htmlFor={type.value} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Event Time *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., 123 Party Avenue, City"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Celebrate milestone birthday"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_unlimited_guests"
                  checked={formData.is_unlimited_guests}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_unlimited_guests: checked as boolean })
                  }
                />
                <Label htmlFor="is_unlimited_guests" className="cursor-pointer">
                  Unlimited Guests
                </Label>
              </div>

              {!formData.is_unlimited_guests && (
                <div className="space-y-2">
                  <Label htmlFor="max_guests">Maximum Guests</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                    placeholder="e.g., 50"
                    min="1"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow_accompanies"
                  checked={formData.allow_accompanies}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_accompanies: checked as boolean })
                  }
                />
                <Label htmlFor="allow_accompanies" className="cursor-pointer">
                  Allow Guests to Bring Companions
                </Label>
              </div>

              {formData.allow_accompanies && (
                <div className="space-y-2">
                  <Label htmlFor="max_accompanies_per_guest">Max Companions Per Guest</Label>
                  <Input
                    id="max_accompanies_per_guest"
                    type="number"
                    value={formData.max_accompanies_per_guest}
                    onChange={(e) => setFormData({ ...formData, max_accompanies_per_guest: e.target.value })}
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/personal-events')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreatePersonalEvent;
