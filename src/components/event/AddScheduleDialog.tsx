import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { scheduleTemplates, getEventTypeLabel, type ScheduleField } from "@/lib/scheduleTemplates";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Plus } from "lucide-react";

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTypes: string[];
  schedule?: any;
  onSuccess: () => void;
  preselectedSessionType?: string;
  buildings?: any[];
  rooms?: any[];
}

const AddScheduleDialog = ({ open, onOpenChange, eventId, eventTypes, schedule, onSuccess, preselectedSessionType, buildings = [], rooms = [] }: AddScheduleDialogProps) => {
  const [formData, setFormData] = useState({
    session_title: "",
    start_time: "",
    end_time: "",
    description: "",
    location: "",
    session_type: preselectedSessionType || eventTypes[0] || 'default',
    metadata: {} as Record<string, any>,
    building_id: "",
    room_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [addingBuilding, setAddingBuilding] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [allowAllGuestCategories, setAllowAllGuestCategories] = useState(true);
  const [selectedGuestCategories, setSelectedGuestCategories] = useState<string[]>([]);
  const [guestCategories, setGuestCategories] = useState<any[]>([]);
  const [sessionMode, setSessionMode] = useState<'in_person' | 'online' | 'hybrid'>('in_person');
  const [onlineLink, setOnlineLink] = useState("");

  const currentTemplate = scheduleTemplates[formData.session_type] || scheduleTemplates.default;

  useEffect(() => {
    const fetchGuestCategories = async () => {
      const { data, error } = await supabase
        .from('event_guest_categories')
        .select('*')
        .eq('event_id', eventId)
        .order('category_level');
      
      if (!error && data) {
        setGuestCategories(data);
      }
    };
    
    if (open) {
      fetchGuestCategories();
    }
  }, [open, eventId]);

  useEffect(() => {
    const fetchExistingRestrictions = async () => {
      if (schedule?.id) {
        const { data } = await supabase
          .from('event_schedule_guest_categories')
          .select('guest_category_id')
          .eq('schedule_id', schedule.id);
        
        if (data && data.length > 0) {
          setAllowAllGuestCategories(false);
          setSelectedGuestCategories(data.map(r => r.guest_category_id));
        } else {
          setAllowAllGuestCategories(schedule.allow_all_guest_categories ?? true);
        }
      } else {
        setAllowAllGuestCategories(true);
        setSelectedGuestCategories([]);
      }
    };
    
    if (schedule) {
      fetchExistingRestrictions();
    }
  }, [schedule]);

  useEffect(() => {
    if (schedule) {
      setFormData({
        session_title: schedule.session_title || "",
        start_time: schedule.start_time || "",
        end_time: schedule.end_time || "",
        description: schedule.description || "",
        location: schedule.location || "",
        session_type: schedule.session_type || eventTypes[0] || 'default',
        metadata: schedule.metadata || {},
        building_id: schedule.building_id || "",
        room_id: schedule.room_id || "",
      });
      setAllowAllGuestCategories(schedule.allow_all_guest_categories ?? true);
      setSessionMode(schedule.session_mode || 'in_person');
      setOnlineLink(schedule.online_link || "");
    } else if (open) {
      setFormData({
        session_title: "",
        start_time: "",
        end_time: "",
        description: "",
        location: "",
        session_type: preselectedSessionType || eventTypes[0] || 'default',
        metadata: {},
        building_id: "",
        room_id: "",
      });
      setNewBuildingName("");
      setNewRoomName("");
      setAllowAllGuestCategories(true);
      setSelectedGuestCategories([]);
      setSessionMode('in_person');
      setOnlineLink("");
    }
  }, [schedule, open, eventTypes, preselectedSessionType]);

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
    
    if (!formData.session_title.trim() || !formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate based on session mode
    if (sessionMode === 'online' && !onlineLink.trim()) {
      toast({
        title: "Validation Error",
        description: "Online link is required for online sessions.",
        variant: "destructive",
      });
      return;
    }

    if (sessionMode === 'in_person' && !formData.building_id) {
      toast({
        title: "Validation Error",
        description: "Building/venue is required for in-person sessions.",
        variant: "destructive",
      });
      return;
    }
    
    if (!allowAllGuestCategories && selectedGuestCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one guest category or enable 'No restrictions'.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const missingFields = currentTemplate.specificFields
      .filter(field => field.required && !formData.metadata[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const payload = {
      session_title: formData.session_title,
      start_time: formData.start_time,
      end_time: formData.end_time,
      description: formData.description,
      location: null, // No longer using this field
      session_type: formData.session_type,
      metadata: formData.metadata,
      event_id: eventId,
      building_id: (sessionMode === 'in_person' || sessionMode === 'hybrid') ? formData.building_id || null : null,
      room_id: (sessionMode === 'in_person' || sessionMode === 'hybrid') ? formData.room_id || null : null,
      allow_all_guest_categories: allowAllGuestCategories,
      session_mode: sessionMode,
      online_link: (sessionMode === 'online' || sessionMode === 'hybrid') ? onlineLink : null,
    };

    try {
      let scheduleId: string;
      
      if (schedule) {
        const { error } = await supabase
          .from("event_schedules")
          .update(payload)
          .eq("id", schedule.id);

        if (error) throw error;
        scheduleId = schedule.id;
      } else {
        const { data, error } = await supabase
          .from("event_schedules")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        scheduleId = data.id;
      }

      // Handle guest category restrictions
      if (!allowAllGuestCategories && selectedGuestCategories.length > 0) {
        await supabase
          .from('event_schedule_guest_categories')
          .delete()
          .eq('schedule_id', scheduleId);
        
        const restrictions = selectedGuestCategories.map(categoryId => ({
          schedule_id: scheduleId,
          guest_category_id: categoryId,
        }));
        
        const { error: restrictionError } = await supabase
          .from('event_schedule_guest_categories')
          .insert(restrictions);
        
        if (restrictionError) {
          toast({
            title: "Warning",
            description: "Schedule created but failed to save guest category restrictions.",
            variant: "destructive",
          });
        }
      } else if (allowAllGuestCategories) {
        await supabase
          .from('event_schedule_guest_categories')
          .delete()
          .eq('schedule_id', scheduleId);
      }

      toast({
        title: "Success",
        description: `Session ${schedule ? "updated" : "added"} successfully.`,
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

  const renderDynamicField = (field: ScheduleField) => {
    const value = formData.metadata[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: val },
                })
              }
            >
              <SelectTrigger id={field.name} className="bg-background">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
              rows={3}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      default: // text
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, [field.name]: e.target.value },
                })
              }
              placeholder={field.placeholder}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit' : 'Add'} Schedule Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {eventTypes.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type *</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, session_type: value, metadata: {} })
                }
              >
                <SelectTrigger id="session_type" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEventTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select which type of session this is for your multi-type event
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <h3 className="font-medium text-sm">Basic Information</h3>
            
            <div>
              <Label htmlFor="session_title">Session Title *</Label>
              <Input
                id="session_title"
                required
                value={formData.session_title}
                onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            {currentTemplate.commonFields.includes('description') && (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Session Mode Section */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <h3 className="font-medium text-sm">Session Mode</h3>
            
            <div className="space-y-2">
              <Label>How will this session be conducted?</Label>
              <Select
                value={sessionMode}
                onValueChange={(value: any) => setSessionMode(value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="in_person">In-Person Only</SelectItem>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid (In-Person + Online)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(sessionMode === 'online' || sessionMode === 'hybrid') && (
              <div>
                <Label htmlFor="online_link">
                  Online Meeting Link {sessionMode === 'online' && '*'}
                </Label>
                <Input
                  id="online_link"
                  type="url"
                  placeholder="https://zoom.us/j/... or meet.google.com/..."
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  required={sessionMode === 'online'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Zoom, Google Meet, Teams, or any video conferencing link
                </p>
              </div>
            )}
          </div>

          {/* Venue & Room Section */}
          {(sessionMode === 'in_person' || sessionMode === 'hybrid') && buildings.length > 0 && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium text-sm">
                Venue & Room {sessionMode === 'in_person' && '(Required)'}
              </h3>
              
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
                            {room.room_name} {room.capacity && `(${room.capacity} pax)`}
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
              
              {!formData.building_id && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No building selected. Add buildings in the Venues tab to organize rooms.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentTemplate.specificFields.length > 0 && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <h3 className="font-medium text-sm">Session Specific Fields</h3>
              {currentTemplate.specificFields.map(field => renderDynamicField(field))}
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Guest Category Access</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-all"
                checked={allowAllGuestCategories}
                onCheckedChange={(checked) => {
                  setAllowAllGuestCategories(!!checked);
                  if (checked) {
                    setSelectedGuestCategories([]);
                  }
                }}
              />
              <Label htmlFor="allow-all" className="cursor-pointer font-normal">
                No restrictions - Allow all guest categories
              </Label>
            </div>

            {!allowAllGuestCategories && (
              <div className="space-y-2 border rounded-lg p-4">
                <Label className="text-sm text-muted-foreground">
                  Select which guest categories can attend this session:
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {guestCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedGuestCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGuestCategories([...selectedGuestCategories, category.id]);
                          } else {
                            setSelectedGuestCategories(selectedGuestCategories.filter(id => id !== category.id));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`cat-${category.id}`} 
                        className="cursor-pointer flex items-center gap-2 font-normal"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.display_color }}
                        />
                        {category.category_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : schedule ? "Update Session" : "Add Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddScheduleDialog;