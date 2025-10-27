import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddPersonalOrganizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  organizer?: any;
  onSuccess: () => void;
}

const AddPersonalOrganizerDialog = ({ open, onOpenChange, eventId, organizer, onSuccess }: AddPersonalOrganizerDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "helper",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizer) {
      setFormData({
        name: organizer.name || "",
        email: organizer.email || "",
        phone: organizer.phone || "",
        role: organizer.role || "helper",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "helper",
      });
    }
  }, [organizer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      event_id: eventId,
    };

    const { error } = organizer
      ? await supabase.from('personal_event_organizers').update(payload).eq('id', organizer.id)
      : await supabase.from('personal_event_organizers').insert([payload]);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${organizer ? 'update' : 'add'} organizer.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Organizer ${organizer ? 'updated' : 'added'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{organizer ? 'Edit' : 'Add'} Co-Organizer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="co_organizer">Co-Organizer (Full Access)</SelectItem>
                <SelectItem value="helper">Helper (Limited Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : organizer ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonalOrganizerDialog;
