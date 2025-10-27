import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForInput } from "@/lib/utils";
import { checkIsPotLuckEvent } from "@/lib/potLuckHelpers";

interface AddPersonalFoodSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  event: any;
  session?: any | null;
  onSuccess: () => void;
}

export const AddPersonalFoodSessionDialog = ({ 
  open, 
  onOpenChange, 
  eventId, 
  event, 
  session, 
  onSuccess 
}: AddPersonalFoodSessionDialogProps) => {
  const [formData, setFormData] = useState({
    session_date: "",
    meal_type: "lunch",
    session_time: "",
    venue_name: "",
    estimated_attendees: "",
    notes: "",
    is_pot_luck_style: false,
  });
  const [loading, setLoading] = useState(false);
  const isPotLuckEvent = checkIsPotLuckEvent(event?.event_types || []);

  useEffect(() => {
    if (session) {
      setFormData({
        session_date: session.session_date || "",
        meal_type: session.meal_type || "lunch",
        session_time: session.session_time || "",
        venue_name: session.venue_name || "",
        estimated_attendees: session.estimated_attendees?.toString() || "",
        notes: session.notes || "",
        is_pot_luck_style: session.is_pot_luck_style || false,
      });
    } else if (open) {
      setFormData({
        session_date: "",
        meal_type: "lunch",
        session_time: "",
        venue_name: "",
        estimated_attendees: "",
        notes: "",
        is_pot_luck_style: isPotLuckEvent,
      });
    }
  }, [session, open, isPotLuckEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const sessionData = {
      event_id: eventId,
      session_date: formData.session_date,
      meal_type: formData.meal_type,
      session_time: formData.session_time || null,
      venue_name: formData.venue_name || null,
      estimated_attendees: formData.estimated_attendees ? parseInt(formData.estimated_attendees) : null,
      notes: formData.notes || null,
      is_pot_luck_style: formData.is_pot_luck_style,
    };

    try {
      if (session) {
        const { error } = await supabase
          .from("personal_event_food_sessions")
          .update(sessionData)
          .eq("id", session.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("personal_event_food_sessions")
          .insert(sessionData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Food session ${session ? "updated" : "created"} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit' : 'Add'} Food Session</DialogTitle>
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
                <SelectItem value="brunch">Brunch</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
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
            <Label htmlFor="venue_name">Venue Name</Label>
            <Input
              id="venue_name"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              placeholder="e.g., Main Hall, Backyard, etc."
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

          {isPotLuckEvent && (
            <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/50">
              <Checkbox
                id="is_pot_luck_style"
                checked={formData.is_pot_luck_style}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_pot_luck_style: checked as boolean })
                }
              />
              <Label htmlFor="is_pot_luck_style" className="cursor-pointer">
                This is a Pot Luck style session (guests bring food)
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : session ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
