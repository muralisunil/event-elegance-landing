import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DurationSelector } from "@/components/event/DurationSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { validateEventDates, calculateEndTime, formatDateForInput, getMinEventDate, getMaxEventDate } from "@/lib/utils";

const outreachEventTypes = [
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "community_service", label: "Community Service" },
  { value: "awareness_campaign", label: "Awareness Campaign" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "networking", label: "Networking Event" },
  { value: "training", label: "Training Session" },
  { value: "volunteer", label: "Volunteer Activity" },
  { value: "conference", label: "Conference" },
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "meetup", label: "Meetup" },
  { value: "exhibition", label: "Exhibition" },
  { value: "panel_discussion", label: "Panel Discussion" },
  { value: "town_hall", label: "Town Hall" },
  { value: "open_house", label: "Open House" },
  { value: "career_fair", label: "Career Fair" },
  { value: "health_screening", label: "Health Screening" },
  { value: "blood_donation", label: "Blood Donation" },
  { value: "food_drive", label: "Food Drive" },
  { value: "mentorship_program", label: "Mentorship Program" },
  { value: "educational_tour", label: "Educational Tour" },
  { value: "sports_event", label: "Sports Event" },
  { value: "cultural_event", label: "Cultural Event" },
  { value: "charity_auction", label: "Charity Auction" },
];

const ageRestrictions = [
  { value: "all_ages", label: "All Ages Welcome" },
  { value: "18+", label: "18+ (Adults Only)" },
  { value: "21+", label: "21+ (Legal Drinking Age)" },
  { value: "children_only", label: "Children Only (Under 13)" },
  { value: "teens_only", label: "Teens Only (13-17)" },
  { value: "adults_only", label: "Adults Only (18+)" },
  { value: "seniors_only", label: "Seniors Only (60+)" },
];

interface SettingsTabProps {
  event: any;
  onUpdate: () => void;
}

const SettingsTab = ({ event, onUpdate }: SettingsTabProps) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(event.event_types || []);
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    purpose: event.purpose || "",
    goal: event.goal || "",
    location: event.location || "",
    event_date: event.event_date || "",
    event_time: event.event_time || "",
    durationHours: event.duration_minutes ? String(Math.floor(event.duration_minutes / 60)) : "2",
    durationMinutes: event.duration_minutes ? String(event.duration_minutes % 60) : "0",
    event_end_time: event.event_end_time || "",
    is_multi_day: event.is_multi_day || false,
    event_end_date: event.event_end_date || "",
    age_restriction: event.age_restriction || "all_ages",
    max_guests: event.max_guests || "",
    is_unlimited_guests: event.is_unlimited_guests || false,
    allow_accompanies: event.allow_accompanies || false,
    max_accompanies_per_guest: event.max_accompanies_per_guest || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate dates
    const dateValidation = validateEventDates(
      formData.event_date,
      formData.event_end_date,
      formData.is_multi_day
    );
    if (!dateValidation.valid) {
      toast({
        title: "Invalid Date",
        description: dateValidation.error,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Calculate duration for single-day events
    const durationMinutes = formData.is_multi_day 
      ? null 
      : parseInt(formData.durationHours) * 60 + parseInt(formData.durationMinutes);

    // Calculate end time for single-day events if not manually set
    const endTime = formData.is_multi_day
      ? formData.event_end_time
      : formData.event_end_time || calculateEndTime(
          formData.event_time,
          parseInt(formData.durationHours),
          parseInt(formData.durationMinutes)
        );

    const payload = {
      name: formData.name,
      description: formData.description || null,
      purpose: formData.purpose || null,
      goal: formData.goal || null,
      location: formData.location,
      event_date: formData.event_date,
      event_time: formData.event_time,
      duration_minutes: durationMinutes,
      event_end_date: formData.is_multi_day ? formData.event_end_date : null,
      event_end_time: endTime,
      is_multi_day: formData.is_multi_day,
      age_restriction: formData.age_restriction,
      event_types: selectedTypes as any,
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
            <Label>Event Types *</Label>
            <ToggleGroup
              type="multiple"
              value={selectedTypes}
              onValueChange={setSelectedTypes}
              className="flex flex-wrap gap-2 justify-start mt-2"
            >
              {outreachEventTypes.map((type) => (
                <ToggleGroupItem
                  key={type.value}
                  value={type.value}
                  className="px-3 py-2"
                >
                  {type.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground mt-1">
              Select at least one event type
            </p>
          </div>

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
                min={formatDateForInput(getMinEventDate())}
                max={formatDateForInput(getMaxEventDate())}
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event_time">Start Time *</Label>
              <Input
                id="event_time"
                type="time"
                required
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_multi_day"
              checked={formData.is_multi_day}
              onCheckedChange={(checked) =>
                setFormData({ 
                  ...formData, 
                  is_multi_day: checked as boolean,
                  event_end_date: "",
                  event_end_time: "",
                })
              }
            />
            <Label htmlFor="is_multi_day" className="cursor-pointer">
              This is a multi-day event
            </Label>
          </div>

          {formData.is_multi_day ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_end_date">End Date *</Label>
                  <Input
                    id="event_end_date"
                    type="date"
                    required
                    min={formData.event_date || formatDateForInput(getMinEventDate())}
                    max={formatDateForInput(getMaxEventDate())}
                    value={formData.event_end_date}
                    onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event_end_time">End Time *</Label>
                  <Input
                    id="event_end_time"
                    type="time"
                    required
                    value={formData.event_end_time}
                    onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Multi-day events require an end date and time. Duration is not applicable.
              </p>
            </>
          ) : (
            <>
              <DurationSelector
                startTime={formData.event_time}
                durationHours={formData.durationHours}
                durationMinutes={formData.durationMinutes}
                onHoursChange={(value) => setFormData({ ...formData, durationHours: value })}
                onMinutesChange={(value) => setFormData({ ...formData, durationMinutes: value })}
              />
              <div>
                <Label htmlFor="event_end_time">End Time (optional - auto-calculated)</Label>
                <Input
                  id="event_end_time"
                  type="time"
                  value={formData.event_end_time}
                  onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                  placeholder="Leave empty for auto-calculation"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty to auto-calculate from duration
                </p>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="age_restriction">Age Restrictions</Label>
            <Select
              value={formData.age_restriction}
              onValueChange={(value) => setFormData({ ...formData, age_restriction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age restriction" />
              </SelectTrigger>
              <SelectContent>
                {ageRestrictions.map((restriction) => (
                  <SelectItem key={restriction.value} value={restriction.value}>
                    {restriction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
