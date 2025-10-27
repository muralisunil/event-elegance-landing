import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateForInput } from "@/lib/utils";

interface AddFoodSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  event: any;
  onSuccess: () => void;
}

export const AddFoodSessionDialog = ({ open, onOpenChange, eventId, event, onSuccess }: AddFoodSessionDialogProps) => {
  const [formData, setFormData] = useState({
    session_date: "",
    meal_type: "lunch",
    session_time: "",
    location: "",
    estimated_attendees: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("event_food_sessions").insert({
      event_id: eventId,
      session_date: formData.session_date,
      meal_type: formData.meal_type,
      session_time: formData.session_time || null,
      location: formData.location || null,
      estimated_attendees: formData.estimated_attendees ? parseInt(formData.estimated_attendees) : null,
      notes: formData.notes || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create food session.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Food session created successfully.",
      });
      onSuccess();
      onOpenChange(false);
      setFormData({
        session_date: "",
        meal_type: "lunch",
        session_time: "",
        location: "",
        estimated_attendees: "",
        notes: "",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Food Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="session_date">Date *</Label>
            <Input
              id="session_date"
              type="date"
              required
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              min={formatDateForInput(new Date(event.event_date))}
              max={event.event_end_date ? formatDateForInput(new Date(event.event_end_date)) : undefined}
            />
          </div>

          <div>
            <Label htmlFor="meal_type">Meal Type *</Label>
            <Select
              value={formData.meal_type}
              onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="session_time">Time</Label>
            <Input
              id="session_time"
              type="time"
              value={formData.session_time}
              onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Main Hall, Cafeteria"
            />
          </div>

          <div>
            <Label htmlFor="estimated_attendees">Estimated Attendees</Label>
            <Input
              id="estimated_attendees"
              type="number"
              min="1"
              value={formData.estimated_attendees}
              onChange={(e) => setFormData({ ...formData, estimated_attendees: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Any additional details..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
