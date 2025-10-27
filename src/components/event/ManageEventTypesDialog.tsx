import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface ManageEventTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess: () => void;
}

export const ManageEventTypesDialog = ({ open, onOpenChange, event, onSuccess }: ManageEventTypesDialogProps) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(event.event_types || []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTypes.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one event type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("outreach_events")
      .update({ event_types: selectedTypes as any })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event types.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event types updated successfully.",
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Event Types</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <ToggleGroup
              type="multiple"
              value={selectedTypes}
              onValueChange={setSelectedTypes}
              className="flex flex-wrap gap-2 justify-start"
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
            <p className="text-sm text-muted-foreground mt-4">
              Select at least one event type. Currently selected: {selectedTypes.length}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedTypes.length === 0}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
