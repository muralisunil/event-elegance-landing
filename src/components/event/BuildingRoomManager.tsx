import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, Plus, Pencil, Trash2, DoorOpen, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BuildingRoomManagerProps {
  eventId: string;
}

interface Building {
  id: string;
  building_name: string;
  address: string | null;
  notes: string | null;
  order_index: number;
}

interface Room {
  id: string;
  event_id: string;
  building_id: string | null;
  room_name: string;
  capacity: number | null;
  facilities: string | null;
  notes: string | null;
  order_index: number;
}

const BuildingRoomManager = ({ eventId }: BuildingRoomManagerProps) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedBuildingForRoom, setSelectedBuildingForRoom] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'building' | 'room'; id: string } | null>(null);
  
  const [buildingFormData, setBuildingFormData] = useState({
    building_name: "",
    address: "",
    notes: "",
  });

  const [roomFormData, setRoomFormData] = useState({
    room_name: "",
    capacity: "",
    facilities: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    const [buildingsRes, roomsRes] = await Promise.all([
      supabase.from('event_buildings').select('*').eq('event_id', eventId).order('order_index'),
      supabase.from('event_rooms').select('*').eq('event_id', eventId).order('order_index'),
    ]);

    if (buildingsRes.data) setBuildings(buildingsRes.data);
    if (roomsRes.data) setRooms(roomsRes.data);
    setLoading(false);
  };

  const handleSaveBuilding = async () => {
    if (!buildingFormData.building_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Building name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBuilding) {
        const { error } = await supabase
          .from('event_buildings')
          .update(buildingFormData)
          .eq('id', editingBuilding.id);

        if (error) throw error;
        toast({ title: "Success", description: "Building updated successfully" });
      } else {
        const { error } = await supabase
          .from('event_buildings')
          .insert([{ ...buildingFormData, event_id: eventId, order_index: buildings.length }]);

        if (error) throw error;
        toast({ title: "Success", description: "Building added successfully" });
      }

      fetchData();
      setBuildingDialogOpen(false);
      setEditingBuilding(null);
      setBuildingFormData({ building_name: "", address: "", notes: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveRoom = async () => {
    if (!roomFormData.room_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const roomData = {
        ...roomFormData,
        capacity: roomFormData.capacity ? parseInt(roomFormData.capacity) : null,
        building_id: selectedBuildingForRoom,
        event_id: eventId,
      };

      if (editingRoom) {
        const { error } = await supabase
          .from('event_rooms')
          .update(roomData)
          .eq('id', editingRoom.id);

        if (error) throw error;
        toast({ title: "Success", description: "Room updated successfully" });
      } else {
        const { error } = await supabase
          .from('event_rooms')
          .insert([{ ...roomData, order_index: rooms.length }]);

        if (error) throw error;
        toast({ title: "Success", description: "Room added successfully" });
      }

      fetchData();
      setRoomDialogOpen(false);
      setEditingRoom(null);
      setSelectedBuildingForRoom(null);
      setRoomFormData({ room_name: "", capacity: "", facilities: "", notes: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const table = deleteDialog.type === 'building' ? 'event_buildings' : 'event_rooms';
      const { error } = await supabase.from(table).delete().eq('id', deleteDialog.id);

      if (error) throw error;
      toast({ title: "Success", description: `${deleteDialog.type === 'building' ? 'Building' : 'Room'} deleted successfully` });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading venues...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Buildings & Rooms
              </CardTitle>
              <CardDescription>Manage venues and rooms for your multi-location event</CardDescription>
            </div>
            <Button onClick={() => { setBuildingDialogOpen(true); setEditingBuilding(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {buildings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No buildings added yet.</p>
              <p className="text-sm">Add buildings to organize rooms for parallel sessions.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {buildings.map((building) => {
                const buildingRooms = rooms.filter(r => r.building_id === building.id);
                return (
                  <AccordionItem key={building.id} value={building.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">{building.building_name}</div>
                            {building.address && (
                              <div className="text-sm text-muted-foreground">{building.address}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {buildingRooms.length} room{buildingRooms.length !== 1 ? 's' : ''}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBuilding(building);
                              setBuildingFormData({
                                building_name: building.building_name,
                                address: building.address || "",
                                notes: building.notes || "",
                              });
                              setBuildingDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ type: 'building', id: building.id });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 space-y-3 pt-3">
                        {building.notes && (
                          <p className="text-sm text-muted-foreground mb-3">{building.notes}</p>
                        )}
                        
                        <div className="space-y-2">
                          {buildingRooms.map((room) => (
                            <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{room.room_name}</div>
                                  <div className="flex gap-3 text-sm text-muted-foreground">
                                    {room.capacity && (
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Capacity: {room.capacity}
                                      </span>
                                    )}
                                    {room.facilities && <span>{room.facilities}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingRoom(room);
                                    setSelectedBuildingForRoom(room.building_id);
                                    setRoomFormData({
                                      room_name: room.room_name,
                                      capacity: room.capacity?.toString() || "",
                                      facilities: room.facilities || "",
                                      notes: room.notes || "",
                                    });
                                    setRoomDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialog({ type: 'room', id: room.id })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBuildingForRoom(building.id);
                            setEditingRoom(null);
                            setRoomDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Room
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Building Dialog */}
      <Dialog open={buildingDialogOpen} onOpenChange={setBuildingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBuilding ? 'Edit Building' : 'Add Building'}</DialogTitle>
            <DialogDescription>
              {editingBuilding ? 'Update building details' : 'Add a new venue/building for your event'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="building_name">Building Name *</Label>
              <Input
                id="building_name"
                value={buildingFormData.building_name}
                onChange={(e) => setBuildingFormData({ ...buildingFormData, building_name: e.target.value })}
                placeholder="e.g., Main Conference Hall"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={buildingFormData.address}
                onChange={(e) => setBuildingFormData({ ...buildingFormData, address: e.target.value })}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <Label htmlFor="building_notes">Notes</Label>
              <Textarea
                id="building_notes"
                value={buildingFormData.notes}
                onChange={(e) => setBuildingFormData({ ...buildingFormData, notes: e.target.value })}
                placeholder="Parking info, access instructions, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuildingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBuilding}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room details' : 'Add a new room to a building'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="room_name">Room Name *</Label>
              <Input
                id="room_name"
                value={roomFormData.room_name}
                onChange={(e) => setRoomFormData({ ...roomFormData, room_name: e.target.value })}
                placeholder="e.g., Room A-101, Auditorium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="facilities">Facilities</Label>
                <Input
                  id="facilities"
                  value={roomFormData.facilities}
                  onChange={(e) => setRoomFormData({ ...roomFormData, facilities: e.target.value })}
                  placeholder="Projector, Whiteboard"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="room_notes">Notes</Label>
              <Textarea
                id="room_notes"
                value={roomFormData.notes}
                onChange={(e) => setRoomFormData({ ...roomFormData, notes: e.target.value })}
                placeholder="Additional information about this room"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRoom}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deleteDialog?.type}.
              {deleteDialog?.type === 'building' && " All rooms in this building will also be deleted."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuildingRoomManager;