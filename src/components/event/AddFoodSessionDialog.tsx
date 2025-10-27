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
  const [guestCategories, setGuestCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [chargeableCategories, setChargeableCategories] = useState<string[]>([]);
  const [allowAllGuestCategories, setAllowAllGuestCategories] = useState(true);
  const [chargeAmount, setChargeAmount] = useState("");

  useEffect(() => {
    if (open) {
      const fetchGuestCategories = async () => {
        const { data } = await supabase
          .from('event_guest_categories')
          .select('*')
          .eq('event_id', eventId)
          .order('category_level', { ascending: true });
        
        if (data) {
          setGuestCategories(data);
        }
      };
      
      fetchGuestCategories();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (open && session) {
      // Fetch guest category restrictions for this session
      const fetchSessionCategories = async () => {
        const { data } = await supabase
          .from('event_food_session_guest_categories')
          .select('guest_category_id, is_chargeable')
          .eq('food_session_id', session.id);
        
        if (data) {
          const selected = data.map(item => item.guest_category_id);
          const chargeable = data.filter(item => item.is_chargeable).map(item => item.guest_category_id);
          setSelectedCategories(selected);
          setChargeableCategories(chargeable);
        }
      };
      
      fetchSessionCategories();
    }
  }, [open, session]);

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
      setAllowAllGuestCategories(session.allow_all_guest_categories ?? true);
      setChargeAmount(session.default_charge_amount?.toString() || "");
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
      setNewBuildingName("");
      setNewRoomName("");
      setSelectedCategories([]);
      setChargeableCategories([]);
      setAllowAllGuestCategories(true);
      setChargeAmount("");
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
    
    // Validate guest category selection if restrictions are enabled
    if (!allowAllGuestCategories && selectedCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one guest category that can attend.",
        variant: "destructive",
      });
      return;
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
      default_charge_amount: parseFloat(chargeAmount) || null,
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

      // Handle guest category restrictions
      if (!allowAllGuestCategories && selectedCategories.length > 0) {
        // Delete existing category assignments
        await supabase
          .from('event_food_session_guest_categories')
          .delete()
          .eq('food_session_id', sessionId);

        // Insert new category assignments
        const categoryRecords = selectedCategories.map(categoryId => ({
          food_session_id: sessionId,
          guest_category_id: categoryId,
          is_chargeable: chargeableCategories.includes(categoryId),
        }));

        const { error: categoriesError } = await supabase
          .from('event_food_session_guest_categories')
          .insert(categoryRecords);

        if (categoriesError) {
          console.error("Error saving category restrictions:", categoriesError);
          toast({
            title: "Warning",
            description: "Session saved but there was an issue with category restrictions.",
            variant: "destructive",
          });
        }
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
            
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-all-categories"
                  checked={allowAllGuestCategories}
                  onCheckedChange={(checked) => setAllowAllGuestCategories(checked as boolean)}
                />
                <Label htmlFor="allow-all-categories" className="text-sm font-normal cursor-pointer">
                  No restrictions - Allow all guest categories
                </Label>
              </div>

              {!allowAllGuestCategories && (
                <div className="space-y-3 pl-6">
                  <Label className="text-sm">Select which guest categories can attend:</Label>
                  {guestCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            setChargeableCategories(chargeableCategories.filter(id => id !== category.id));
                          }
                        }}
                      />
                      <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal cursor-pointer">
                        {category.category_name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {(allowAllGuestCategories || selectedCategories.length > 0) && (
                <div className="pl-6 space-y-3 border-t pt-3">
                  <Label htmlFor="charge-amount">Charge Amount</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="charge-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00 (free for all)"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      className="w-32"
                    />
                  </div>

                  {!allowAllGuestCategories && parseFloat(chargeAmount) > 0 && selectedCategories.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <Label className="text-sm">Which categories should be charged ${chargeAmount}?</Label>
                      {selectedCategories.map(categoryId => {
                        const category = guestCategories.find(c => c.id === categoryId);
                        return (
                          <div key={categoryId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`charge-${categoryId}`}
                              checked={chargeableCategories.includes(categoryId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setChargeableCategories([...chargeableCategories, categoryId]);
                                } else {
                                  setChargeableCategories(chargeableCategories.filter(id => id !== categoryId));
                                }
                              }}
                            />
                            <Label htmlFor={`charge-${categoryId}`} className="text-sm font-normal cursor-pointer">
                              {category?.category_name}
                            </Label>
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground">
                        Categories not checked above will attend free
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Leave empty or 0 for free attendance
                  </p>

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>Coming Soon:</strong> Multiple charge tiers (different prices for veg/non-veg/vegan, etc.) are in development!
                    </p>
                  </div>
                </div>
              )}
            </div>
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