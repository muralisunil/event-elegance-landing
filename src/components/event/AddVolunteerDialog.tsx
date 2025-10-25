import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface AddVolunteerDialogProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  volunteer?: any;
}

const volunteerRoles = [
  "Registration Desk",
  "Setup Crew",
  "Guide",
  "Security",
  "Food Service",
  "Technical Support",
  "Photography",
  "Parking",
  "Information Desk",
  "Other",
];

const shiftTimes = [
  "Morning (8am-12pm)",
  "Afternoon (12pm-5pm)",
  "Evening (5pm-9pm)",
  "All Day",
];

const statuses = ["pending", "confirmed", "declined", "completed"];

const AddVolunteerDialog = ({ eventId, open, onClose, volunteer }: AddVolunteerDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    shift_time: "",
    skills: "",
    notes: "",
    status: "pending",
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name || "",
        email: volunteer.email || "",
        phone: volunteer.phone || "",
        role: volunteer.role || "",
        shift_time: volunteer.shift_time || "",
        skills: volunteer.skills || "",
        notes: volunteer.notes || "",
        status: volunteer.status || "pending",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        shift_time: "",
        skills: "",
        notes: "",
        status: "pending",
      });
    }
  }, [volunteer, open]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    const volunteerData = {
      event_id: eventId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role || null,
      shift_time: formData.shift_time || null,
      skills: formData.skills.trim() || null,
      notes: formData.notes.trim() || null,
      status: formData.status,
    };

    if (volunteer) {
      const { error } = await supabase
        .from("event_volunteers")
        .update(volunteerData)
        .eq("id", volunteer.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update volunteer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Volunteer updated successfully.",
        });
        onClose();
      }
    } else {
      const { error } = await supabase.from("event_volunteers").insert(volunteerData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add volunteer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Volunteer added successfully.",
        });
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{volunteer ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {volunteerRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Shift Time</Label>
            <Select value={formData.shift_time} onValueChange={(value) => setFormData({ ...formData, shift_time: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                {shiftTimes.map((shift) => (
                  <SelectItem key={shift} value={shift}>
                    {shift}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Skills / Certifications</Label>
            <Textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Special skills, certifications, languages spoken..."
              rows={2}
            />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {volunteer ? "Update" : "Add"} Volunteer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVolunteerDialog;
