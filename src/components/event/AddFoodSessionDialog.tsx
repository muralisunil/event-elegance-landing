import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateForInput } from "@/lib/utils";
import { Plus } from "lucide-react";

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
      onSuccess(); // Refresh buildings list
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
      onSuccess(); // Refresh rooms list
    }
    setAddingRoom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    };

    let error;
    
    if (session) {
      ({ error } = await supabase
        .from("event_food_sessions")
        .update(sessionData)
        .eq("id", session.id));
    } else {
      ({ error } = await supabase
        .from("event_food_sessions")
        .insert(sessionData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${session ? 'update' : 'create'} food session.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Food session ${session ? 'updated' : 'created'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
      if (!session) {
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
    }
    setLoading(false);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="building_id">Building/Venue</Label>
              <Select
                value={formData.building_id || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setFormData({ ...formData, building_id: '', room_id: '' });
                  } else {
                    setFormData({ 
                      ...formData, 
                      building_id: value,
                      room_id: '' 
                    });
                  }
                }}
              >
                <SelectTrigger id="building_id" className="bg-background">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No building</span>
                  </SelectItem>
                  {buildings.map(building => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.building_name}
                    </SelectItem>
                  ))}
                  <Separator className="my-2" />
                  <div className="p-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Add</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Building name"
                        value={newBuildingName}
                        onChange={(e) => setNewBuildingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddBuilding();
                          }
                        }}
                        className="h-8"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleQuickAddBuilding}
                        disabled={!newBuildingName.trim() || addingBuilding}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="room_id">Room</Label>
              <Select
                value={formData.room_id || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setFormData({ ...formData, room_id: '' });
                  } else {
                    setFormData({ ...formData, room_id: value });
                  }
                }}
                disabled={!formData.building_id}
              >
                <SelectTrigger id="room_id" className="bg-background">
                  <SelectValue placeholder={formData.building_id ? "Select room" : "Select building first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No room</span>
                  </SelectItem>
                  {rooms
                    .filter(room => room.building_id === formData.building_id)
                    .map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_name}
                      </SelectItem>
                    ))}
                  <Separator className="my-2" />
                  <div className="p-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Add</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Room name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddRoom();
                          }
                        }}
                        className="h-8"
                        disabled={!formData.building_id}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleQuickAddRoom}
                        disabled={!newRoomName.trim() || !formData.building_id || addingRoom}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Additional location details..."
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
              {loading ? (session ? "Updating..." : "Creating...") : (session ? "Update Session" : "Create Session")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
