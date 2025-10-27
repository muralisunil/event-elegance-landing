import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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

interface GuestCategory {
  id: string;
  category_name: string;
  category_level: number;
  benefits: string | null;
  max_guests: number | null;
  display_color: string;
}

interface GuestCategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

export const GuestCategoryManager = ({ open, onOpenChange, eventId, onSuccess }: GuestCategoryManagerProps) => {
  const [categories, setCategories] = useState<GuestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<GuestCategory | null>(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, eventId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("event_guest_categories")
      .select("*")
      .eq("event_id", eventId)
      .order("category_level", { ascending: true });

    if (error) {
      console.error("Error fetching guest categories:", error);
      toast({
        title: "Error",
        description: "Failed to load guest categories.",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: GuestCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_guest_categories")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
      fetchCategories();
      onSuccess();
    }
    setDeleteId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Guest Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleAdd} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No guest categories yet. Add your first category to organize guests.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge style={{ backgroundColor: category.display_color }}>
                            {category.category_name}
                          </Badge>
                          {category.max_guests && (
                            <span className="text-sm text-muted-foreground">
                              Max: {category.max_guests} guests
                            </span>
                          )}
                        </div>
                        {category.benefits && (
                          <p className="text-sm text-muted-foreground">{category.benefits}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        category={editingCategory}
        onSuccess={() => {
          fetchCategories();
          onSuccess();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this guest category? Guests assigned to this category will have their category unassigned.
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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  category: GuestCategory | null;
  onSuccess: () => void;
}

const AddCategoryDialog = ({ open, onOpenChange, eventId, category, onSuccess }: AddCategoryDialogProps) => {
  const [formData, setFormData] = useState({
    category_name: "",
    category_level: "0",
    benefits: "",
    max_guests: "",
    display_color: "#3b82f6",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name,
        category_level: String(category.category_level),
        benefits: category.benefits || "",
        max_guests: category.max_guests ? String(category.max_guests) : "",
        display_color: category.display_color,
      });
    } else {
      setFormData({
        category_name: "",
        category_level: "0",
        benefits: "",
        max_guests: "",
        display_color: "#3b82f6",
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      event_id: eventId,
      category_name: formData.category_name,
      category_level: parseInt(formData.category_level),
      benefits: formData.benefits || null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
      display_color: formData.display_color,
    };

    if (category) {
      const { error } = await supabase
        .from("event_guest_categories")
        .update(payload)
        .eq("id", category.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update category.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Category updated successfully.",
        });
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase
        .from("event_guest_categories")
        .insert(payload);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create category.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Category created successfully.",
        });
        onSuccess();
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Add"} Guest Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category_name">Category Name *</Label>
            <Input
              id="category_name"
              required
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              placeholder="e.g., VIP, VVIP, General"
            />
          </div>

          <div>
            <Label htmlFor="category_level">Priority Level</Label>
            <Input
              id="category_level"
              type="number"
              min="0"
              value={formData.category_level}
              onChange={(e) => setFormData({ ...formData, category_level: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Higher numbers = higher priority</p>
          </div>

          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="Special perks for this category"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="max_guests">Maximum Guests (Optional)</Label>
            <Input
              id="max_guests"
              type="number"
              min="1"
              value={formData.max_guests}
              onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <Label htmlFor="display_color">Display Color</Label>
            <Input
              id="display_color"
              type="color"
              value={formData.display_color}
              onChange={(e) => setFormData({ ...formData, display_color: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : category ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
