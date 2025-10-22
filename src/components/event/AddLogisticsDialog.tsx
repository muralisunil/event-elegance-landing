import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddLogisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  item?: any;
  onSuccess: () => void;
}

const AddLogisticsDialog = ({ open, onOpenChange, eventId, item, onSuccess }: AddLogisticsDialogProps) => {
  const [formData, setFormData] = useState({
    category: "other",
    item_name: "",
    quantity: "",
    estimated_cost: "",
    actual_cost: "",
    vendor: "",
    status: "planned",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category || "other",
        item_name: item.item_name || "",
        quantity: item.quantity?.toString() || "",
        estimated_cost: item.estimated_cost?.toString() || "",
        actual_cost: item.actual_cost?.toString() || "",
        vendor: item.vendor || "",
        status: item.status || "planned",
        notes: item.notes || "",
      });
    } else {
      setFormData({
        category: "other",
        item_name: "",
        quantity: "",
        estimated_cost: "",
        actual_cost: "",
        vendor: "",
        status: "planned",
        notes: "",
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      category: formData.category,
      item_name: formData.item_name,
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
      vendor: formData.vendor || null,
      status: formData.status,
      notes: formData.notes || null,
      event_id: eventId,
    };

    const { error } = item
      ? await supabase.from('event_logistics').update(payload).eq('id', item.id)
      : await supabase.from('event_logistics').insert([payload]);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${item ? 'update' : 'add'} item.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Item ${item ? 'updated' : 'added'} successfully.`,
      });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} Logistics Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food & Catering</SelectItem>
                <SelectItem value="gifts">Gifts</SelectItem>
                <SelectItem value="memos">Memos & Stationery</SelectItem>
                <SelectItem value="awards">Awards & Trophies</SelectItem>
                <SelectItem value="flowers">Flowers & Decoration</SelectItem>
                <SelectItem value="decoration">General Decoration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              required
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.actual_cost}
                onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : item ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLogisticsDialog;
