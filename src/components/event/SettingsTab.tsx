import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SettingsTabProps {
  event: any;
  onUpdate: () => void;
}

const SettingsTab = ({ event, onUpdate }: SettingsTabProps) => {
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    purpose: event.purpose || "",
    goal: event.goal || "",
    location: event.location || "",
    event_date: event.event_date || "",
    event_time: event.event_time || "",
    duration_minutes: event.duration_minutes || "",
    max_guests: event.max_guests || "",
    is_unlimited_guests: event.is_unlimited_guests || false,
    allow_accompanies: event.allow_accompanies || false,
    max_accompanies_per_guest: event.max_accompanies_per_guest || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      purpose: formData.purpose || null,
      goal: formData.goal || null,
      location: formData.location,
      event_date: formData.event_date,
      event_time: formData.event_time,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes as string) : null,
      max_guests: formData.is_unlimited_guests ? null : (formData.max_guests ? parseInt(formData.max_guests) : null),
      is_unlimited_guests: formData.is_unlimited_guests,
      allow_accompanies: formData.allow_accompanies,
      max_accompanies_per_guest: formData.allow_accompanies 
        ? (formData.max_accompanies_per_guest ? parseInt(formData.max_accompanies_per_guest) : null) 
        : null,
    };

    const { error } = await supabase
      .from('outreach_events')
      .update(payload)
      .eq('id', event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event settings updated successfully.",
      });
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event_time">Event Time *</Label>
              <Input
                id="event_time"
                type="time"
                required
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="1"
              placeholder="e.g., 120 for 2 hours"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              How long will the event last?
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Guest Management</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unlimited"
                checked={formData.is_unlimited_guests}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_unlimited_guests: checked as boolean })
                }
              />
              <Label htmlFor="unlimited" className="font-normal cursor-pointer">
                Allow unlimited guests
              </Label>
            </div>

            {!formData.is_unlimited_guests && (
              <div>
                <Label htmlFor="max_guests">Maximum Number of Guests</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
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
              <Label htmlFor="allow_accompanies" className="font-normal cursor-pointer">
                Allow guests to bring accompanies
              </Label>
            </div>

            {formData.allow_accompanies && (
              <div>
                <Label htmlFor="max_accompanies">Maximum Accompanies Per Guest</Label>
                <Input
                  id="max_accompanies"
                  type="number"
                  min="1"
                  value={formData.max_accompanies_per_guest}
                  onChange={(e) => setFormData({ ...formData, max_accompanies_per_guest: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
