import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddFoodItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  eventId: string;
  item: any;
  onSuccess: () => void;
}

export const AddFoodItemDialog = ({ open, onOpenChange, sessionId, eventId, item, onSuccess }: AddFoodItemDialogProps) => {
  const [formData, setFormData] = useState({
    item_name: "",
    food_type: "veg",
    source: "",
    quantity: "",
    assigned_volunteer_id: "",
    estimated_cost: "",
    actual_cost: "",
    status: "planned",
    notes: "",
  });
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchVolunteers();
      if (item) {
        setFormData({
          item_name: item.item_name || "",
          food_type: item.food_type || "veg",
          source: item.source || "",
          quantity: item.quantity || "",
          assigned_volunteer_id: item.assigned_volunteer_id || "",
          estimated_cost: item.estimated_cost ? String(item.estimated_cost) : "",
          actual_cost: item.actual_cost ? String(item.actual_cost) : "",
          status: item.status || "planned",
          notes: item.notes || "",
        });
      } else {
        setFormData({
          item_name: "",
          food_type: "veg",
          source: "",
          quantity: "",
          assigned_volunteer_id: "",
          estimated_cost: "",
          actual_cost: "",
          status: "planned",
          notes: "",
        });
      }
    }
  }, [open, item, eventId]);

  const fetchVolunteers = async () => {
    const { data } = await supabase
      .from("event_volunteers")
      .select("id, name")
      .eq("event_id", eventId)
      .order("name");
    setVolunteers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      food_session_id: sessionId,
      item_name: formData.item_name,
      food_type: formData.food_type,
      source: formData.source || null,
      quantity: formData.quantity || null,
      assigned_volunteer_id: formData.assigned_volunteer_id || null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
      status: formData.status,
      notes: formData.notes || null,
    };

    if (item) {
      const { error } = await supabase
        .from("event_food_items")
        .update(payload)
        .eq("id", item.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update menu item.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Menu item updated successfully.",
        });
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase
        .from("event_food_items")
        .insert(payload);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add menu item.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Menu item added successfully.",
        });
        onSuccess();
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              required
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Chicken Curry, Pasta Salad"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="food_type">Food Type *</Label>
              <Select
                value={formData.food_type}
                onValueChange={(value) => setFormData({ ...formData, food_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="prepared">Prepared</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Vendor, In-house"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 50 servings, 10kg"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_volunteer_id">Assigned Volunteer (Optional)</Label>
            <Select
              value={formData.assigned_volunteer_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, assigned_volunteer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select volunteer" />
              </SelectTrigger>
              <SelectContent>
                {volunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.assigned_volunteer_id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() => setFormData({ ...formData, assigned_volunteer_id: "" })}
              >
                Clear volunteer
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.actual_cost}
                onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
              />
            </div>
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
              {loading ? "Saving..." : item ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
