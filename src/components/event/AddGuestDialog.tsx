import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  guest?: any;
  event: any;
  onSuccess: () => void;
}

const AddGuestDialog = ({ open, onOpenChange, eventId, guest, event, onSuccess }: AddGuestDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    invitation_status: "pending",
    dietary_preferences: "",
    special_requirements: "",
    num_accompanies: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || "",
        email: guest.email || "",
        phone: guest.phone || "",
        invitation_status: guest.invitation_status || "pending",
        dietary_preferences: guest.dietary_preferences || "",
        special_requirements: guest.special_requirements || "",
        num_accompanies: guest.num_accompanies || 0,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        invitation_status: "pending",
        dietary_preferences: "",
        special_requirements: "",
        num_accompanies: 0,
      });
    }
  }, [guest, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      event_id: eventId,
    };

    const { error } = guest
      ? await supabase.from('event_guests').update(payload).eq('id', guest.id)
      : await supabase.from('event_guests').insert([payload]);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${guest ? 'update' : 'add'} guest.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Guest ${guest ? 'updated' : 'added'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  const maxAccompanies = event.allow_accompanies ? (event.max_accompanies_per_guest || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edit' : 'Add'} Guest</DialogTitle>
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
            <Label htmlFor="status">Invitation Status</Label>
            <Select
              value={formData.invitation_status}
              onValueChange={(value) => setFormData({ ...formData, invitation_status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {event.allow_accompanies && (
            <div>
              <Label htmlFor="accompanies">Number of Accompanies (Max: {maxAccompanies})</Label>
              <Input
                id="accompanies"
                type="number"
                min="0"
                max={maxAccompanies}
                value={formData.num_accompanies}
                onChange={(e) => setFormData({ ...formData, num_accompanies: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="dietary">Dietary Preferences</Label>
            <Textarea
              id="dietary"
              value={formData.dietary_preferences}
              onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="special">Special Requirements</Label>
            <Textarea
              id="special"
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : guest ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestDialog;
