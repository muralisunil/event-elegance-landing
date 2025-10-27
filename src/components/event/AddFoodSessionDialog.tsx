import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForInput } from "@/lib/utils";

interface AddFoodSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  event: any;
  session?: any | null;
  buildings: any[];
  rooms: any[];
  onSuccess: () => void;
}

export const AddFoodSessionDialog = ({ open, onOpenChange, eventId, event, session, buildings, rooms, onSuccess }: AddFoodSessionDialogProps) => {
  const [formData, setFormData] = useState({
    session_date: "",
    meal_type: "lunch",
    session_time: "",
    building_id: "",
    room_id: "",
    location: "",
    estimated_attendees: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [addingBuilding, setAddingBuilding] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [allowAllGuestCategories, setAllowAllGuestCategories] = useState(true);
  const [defaultCharge, setDefaultCharge] = useState<string>("");
  const [guestCategoryCharges, setGuestCategoryCharges] = useState<Record<string, string>>({});
  const [guestCategories, setGuestCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchGuestCategories = async () => {
      const { data, error } = await supabase
        .from('event_guest_categories')
        .select('*')
        .eq('event_id', eventId)
        .order('category_level');
      
      if (!error && data) {
        setGuestCategories(data);
        const initialCharges: Record<string, string> = {};
        data.forEach(cat => {
          initialCharges[cat.id] = "0.00";
        });
        setGuestCategoryCharges(initialCharges);
      }
    };
    
    if (open) {
      fetchGuestCategories();
    }
  }, [open, eventId]);

  useEffect(() => {
    const fetchExistingCharges = async () => {
      if (session?.id) {
        const { data } = await supabase
          .from('event_food_session_guest_categories')
          .select('guest_category_id, charge_amount')
          .eq('food_session_id', session.id);
        
        if (data && data.length > 0) {
          setAllowAllGuestCategories(false);
          const charges: Record<string, string> = {};
          data.forEach(item => {
            charges[item.guest_category_id] = item.charge_amount?.toString() || "0.00";
          });
          setGuestCategoryCharges(charges);
        } else {
          setAllowAllGuestCategories(session.allow_all_guest_categories ?? true);
          setDefaultCharge(session.default_charge_amount?.toString() || "");
        }
      } else {
        setAllowAllGuestCategories(true);
        setDefaultCharge("");
      }
    };
    
    if (session) {
      fetchExistingCharges();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setFormData({
        session_date: session.session_date || "",
        meal_type: session.meal_type || "lunch",
        session_time: session.session_time || "",
        building_id: session.building_id || "",
        room_id: session.room_id || "",
        location: session.location || "",
        estimated_attendees: session.estimated_attendees?.toString() || "",
        notes: session.notes || "",
      });
    } else if (open) {
      setFormData({
        session_date: "",
        meal_type: "lunch",
        session_time: "",
        building_id: "",
        room_id: "",
        location: "",
        estimated_attendees: "",
        notes: "",
      });
    }
  }, [session, open]);

  useEffect(() => {
    if (formData.building_id || formData.room_id) {
      const building = buildings.find(b => b.id === formData.building_id);
      const room = rooms.find(r => r.id === formData.room_id);
      
      let autoLocation = '';
      if (building && room) {
        autoLocation = `${building.building_name} - ${room.room_name}`;
      } else if (building) {
        autoLocation = building.building_name;
      }
      
      if (autoLocation && !session) {
        setFormData(prev => ({ ...prev, location: autoLocation }));
      }
    }
  }, [formData.building_id, formData.room_id, buildings, rooms, session]);

  const handleQuickAddBuilding = async () => {
    if (!newBuildingName.trim()) return;
    
    setAddingBuilding(true);
    const { data, error } = await supabase
      .from("event_buildings")
      .insert({
        event_id: eventId,
        building_name: newBuildingName.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add building.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Building added successfully." });
      setFormData(prev => ({ ...prev, building_id: data.id }));
      setNewBuildingName("");
      onSuccess();
    }
    setAddingBuilding(false);
  };

  const handleQuickAddRoom = async () => {
    if (!newRoomName.trim() || !formData.building_id) return;
    
    setAddingRoom(true);
    const { data, error } = await supabase
      .from("event_rooms")
      .insert({
        event_id: eventId,
        building_id: formData.building_id,
        room_name: newRoomName.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add room.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Room added successfully." });
      setFormData(prev => ({ ...prev, room_id: data.id }));
      setNewRoomName("");
      onSuccess();
    }
    setAddingRoom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allowAllGuestCategories) {
      const hasAtLeastOneCategory = Object.keys(guestCategoryCharges).length > 0;
      if (!hasAtLeastOneCategory) {
        toast({
          title: "Validation Error",
          description: "Please add at least one guest category or enable 'No restrictions'.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);

    const sessionData = {
      event_id: eventId,
      session_date: formData.session_date,
      meal_type: formData.meal_type,
      session_time: formData.session_time || null,
      building_id: formData.building_id || null,
      room_id: formData.room_id || null,
      location: formData.location || null,
      estimated_attendees: formData.estimated_attendees ? parseInt(formData.estimated_attendees) : null,
      notes: formData.notes || null,
      allow_all_guest_categories: allowAllGuestCategories,
      default_charge_amount: allowAllGuestCategories && defaultCharge 
        ? parseFloat(defaultCharge) 
        : null,
    };

    try {
      let sessionId: string;
      
      if (session) {
        const { error } = await supabase
          .from("event_food_sessions")
          .update(sessionData)
          .eq("id", session.id);

        if (error) throw error;
        sessionId = session.id;
      } else {
        const { data, error } = await supabase
          .from("event_food_sessions")
          .insert(sessionData)
          .select()
          .single();

        if (error) throw error;
        sessionId = data.id;
      }

      // Handle guest category charges
      if (!allowAllGuestCategories) {
        await supabase
          .from('event_food_session_guest_categories')
          .delete()
          .eq('food_session_id', sessionId);
        
        const charges = Object.entries(guestCategoryCharges)
          .map(([categoryId, amount]) => ({
            food_session_id: sessionId,
            guest_category_id: categoryId,
            charge_amount: parseFloat(amount) || 0.00,
          }));
        
        if (charges.length > 0) {
          const { error: chargeError } = await supabase
            .from('event_food_session_guest_categories')
            .insert(charges);
          
          if (chargeError) {
            toast({
              title: "Warning",
              description: "Food session created but failed to save pricing.",
              variant: "destructive",
            });
          }
        }
      } else if (allowAllGuestCategories) {
        await supabase
          .from('event_food_session_guest_categories')
          .delete()
          .eq('food_session_id', sessionId);
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
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Guest Category Pricing</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-all-food"
                checked={allowAllGuestCategories}
                onCheckedChange={(checked) => {
                  setAllowAllGuestCategories(!!checked);
                }}
              />
              <Label htmlFor="allow-all-food" className="cursor-pointer font-normal">
                No restrictions - Allow all guest categories
              </Label>
            </div>

            {allowAllGuestCategories ? (
              <div className="space-y-2">
                <Label htmlFor="default-charge">Charge Amount (for all guests)</Label>
                <Input
                  id="default-charge"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 (free)"
                  value={defaultCharge}
                  onChange={(e) => setDefaultCharge(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty or set to 0.00 to make this session free for all guests
                </p>
              </div>
            ) : (
              <div className="space-y-3 border rounded-lg p-4 max-h-64 overflow-y-auto">
                <Label className="text-sm text-muted-foreground">
                  Set charges per guest category (0.00 = free):
                </Label>
                
                {guestCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: category.display_color }}
                      />
                      <Label htmlFor={`charge-${category.id}`} className="flex-1">
                        {category.category_name}
                      </Label>
                      <Input
                        id={`charge-${category.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={guestCategoryCharges[category.id] || "0.00"}
                        onChange={(e) => {
                          setGuestCategoryCharges({
                            ...guestCategoryCharges,
                            [category.id]: e.target.value,
                          });
                        }}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
                
                <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                  <p>• Categories not listed will not be allowed to access this food session</p>
                  <p>• Set to 0.00 to make it free for specific categories</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : session ? "Update Session" : "Add Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
