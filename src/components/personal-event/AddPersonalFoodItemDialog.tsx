import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { foodCategories } from "@/lib/potLuckHelpers";

interface AddPersonalFoodItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  eventId: string;
  item?: any | null;
  onSuccess: () => void;
  isPotLuckMode?: boolean;
}

export const AddPersonalFoodItemDialog = ({ 
  open, 
  onOpenChange, 
  sessionId, 
  eventId, 
  item, 
  onSuccess,
  isPotLuckMode = false 
}: AddPersonalFoodItemDialogProps) => {
  const [formData, setFormData] = useState({
    item_name: "",
    food_type: "other",
    source: "guest-provided",
    quantity: "",
    assigned_guest_id: "",
    status: "pending",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<any[]>([]);
  const [guestSearchOpen, setGuestSearchOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchGuests();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || "",
        food_type: item.food_type || "other",
        source: item.source || "guest-provided",
        quantity: item.quantity || "",
        assigned_guest_id: item.assigned_guest_id || "",
        status: item.status || "pending",
        notes: item.notes || "",
      });
    } else if (open) {
      setFormData({
        item_name: "",
        food_type: "other",
        source: isPotLuckMode ? "guest-provided" : "host-provided",
        quantity: "",
        assigned_guest_id: "",
        status: "pending",
        notes: "",
      });
    }
  }, [item, open, isPotLuckMode]);

  const fetchGuests = async () => {
    const { data } = await supabase
      .from('personal_event_guests')
      .select('*')
      .eq('event_id', eventId)
      .order('name');
    
    if (data) {
      setGuests(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const itemData = {
      food_session_id: sessionId,
      item_name: formData.item_name,
      food_type: formData.food_type,
      source: formData.source,
      quantity: formData.quantity || null,
      assigned_guest_id: formData.assigned_guest_id || null,
      status: formData.status,
      notes: formData.notes || null,
    };

    try {
      if (item) {
        const { error } = await supabase
          .from("personal_event_food_items")
          .update(itemData)
          .eq("id", item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("personal_event_food_items")
          .insert(itemData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Food item ${item ? "updated" : "added"} successfully.`,
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

  const selectedGuest = guests.find(g => g.id === formData.assigned_guest_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} Food Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              required
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Caesar Salad, Chicken Curry"
            />
          </div>

          <div>
            <Label htmlFor="food_type">Category *</Label>
            <Select
              value={formData.food_type}
              onValueChange={(value) => setFormData({ ...formData, food_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Source *</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest-provided">Guest Provided</SelectItem>
                <SelectItem value="host-provided">Host Provided</SelectItem>
                <SelectItem value="catered">Catered/Purchased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.source === "guest-provided" && (
            <div>
              <Label>Assigned Guest {isPotLuckMode && "*"}</Label>
              <Popover open={guestSearchOpen} onOpenChange={setGuestSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedGuest ? selectedGuest.name : "Select guest..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search guests..." />
                    <CommandEmpty>No guest found.</CommandEmpty>
                    <CommandGroup>
                      {guests.map((guest) => (
                        <CommandItem
                          key={guest.id}
                          value={guest.name}
                          onSelect={() => {
                            setFormData({ ...formData, assigned_guest_id: guest.id });
                            setGuestSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.assigned_guest_id === guest.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {guest.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Quantity/Servings</Label>
            <Input
              id="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g., Serves 10, 2 trays"
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                <SelectItem value="delivered">🚚 Delivered</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {loading ? "Saving..." : item ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
