import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SponsorTierManagerProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
}

interface Tier {
  id: string;
  tier_name: string;
  tier_level: number;
  benefits: string | null;
  contribution_amount: number | null;
  display_color: string | null;
}

const SponsorTierManager = ({ eventId, open, onClose }: SponsorTierManagerProps) => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [formData, setFormData] = useState({
    tier_name: "",
    tier_level: 0,
    benefits: "",
    contribution_amount: "",
    display_color: "#FFD700",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTiers();
    }
  }, [eventId, open]);

  const fetchTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_sponsor_tiers")
      .select("*")
      .eq("event_id", eventId)
      .order("tier_level", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sponsor tiers.",
        variant: "destructive",
      });
    } else {
      setTiers(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.tier_name.trim()) {
      toast({ title: "Error", description: "Tier name is required.", variant: "destructive" });
      return;
    }

    const tierData = {
      event_id: eventId,
      tier_name: formData.tier_name.trim(),
      tier_level: formData.tier_level,
      benefits: formData.benefits.trim() || null,
      contribution_amount: formData.contribution_amount ? parseFloat(formData.contribution_amount) : null,
      display_color: formData.display_color,
    };

    if (editingTier) {
      const { error } = await supabase
        .from("event_sponsor_tiers")
        .update(tierData)
        .eq("id", editingTier.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update tier.", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Tier updated successfully." });
        handleCloseDialog();
        fetchTiers();
      }
    } else {
      const { error } = await supabase.from("event_sponsor_tiers").insert(tierData);

      if (error) {
        toast({ title: "Error", description: "Failed to create tier.", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Tier created successfully." });
        handleCloseDialog();
        fetchTiers();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_sponsor_tiers")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete tier.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Tier deleted successfully." });
      setDeleteId(null);
      fetchTiers();
    }
  };

  const handleEdit = (tier: Tier) => {
    setEditingTier(tier);
    setFormData({
      tier_name: tier.tier_name,
      tier_level: tier.tier_level,
      benefits: tier.benefits || "",
      contribution_amount: tier.contribution_amount?.toString() || "",
      display_color: tier.display_color || "#FFD700",
    });
  };

  const handleCloseDialog = () => {
    setEditingTier(null);
    setFormData({
      tier_name: "",
      tier_level: 0,
      benefits: "",
      contribution_amount: "",
      display_color: "#FFD700",
    });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sponsor Tiers
              <div className="flex gap-2">
                <Button onClick={() => setEditingTier({} as Tier)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tier
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : tiers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No tiers yet</p>
            ) : (
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <div key={tier.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: tier.display_color || "#FFD700" }}
                          />
                          <h3 className="font-semibold text-lg">{tier.tier_name}</h3>
                          <span className="text-sm text-muted-foreground">Level: {tier.tier_level}</span>
                        </div>
                        {tier.benefits && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Benefits: {tier.benefits}
                          </p>
                        )}
                        {tier.contribution_amount && (
                          <p className="text-sm font-medium">
                            Suggested Amount: ${tier.contribution_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(tier)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(tier.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingTier} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier?.id ? "Edit Tier" : "Add Tier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tier Name *</Label>
              <Input
                value={formData.tier_name}
                onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                placeholder="e.g., Gold, Platinum"
              />
            </div>
            <div>
              <Label>Tier Level *</Label>
              <Input
                type="number"
                value={formData.tier_level}
                onChange={(e) => setFormData({ ...formData, tier_level: parseInt(e.target.value) || 0 })}
                placeholder="Higher = more prominent"
              />
            </div>
            <div>
              <Label>Benefits</Label>
              <Textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="What does this tier get?"
              />
            </div>
            <div>
              <Label>Suggested Contribution Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.contribution_amount}
                onChange={(e) => setFormData({ ...formData, contribution_amount: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <Label>Display Color</Label>
              <Input
                type="color"
                value={formData.display_color}
                onChange={(e) => setFormData({ ...formData, display_color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingTier?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tier. Any sponsors using this tier will have it unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SponsorTierManager;
