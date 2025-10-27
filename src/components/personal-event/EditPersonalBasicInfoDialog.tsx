import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditPersonalBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess: () => void;
}

export const EditPersonalBasicInfoDialog = ({ open, onOpenChange, event, onSuccess }: EditPersonalBasicInfoDialogProps) => {
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    theme: event.theme || "",
    location: event.location || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("personal_events")
      .update({
        name: formData.name,
        description: formData.description || null,
        theme: formData.theme || null,
        location: formData.location,
      })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event information.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event information updated successfully.",
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="theme">Theme</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              placeholder="e.g., Garden Party, Black Tie, Casual"
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
