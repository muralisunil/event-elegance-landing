import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  display_color: string;
}

interface PersonalGuestCategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

export const PersonalGuestCategoryManager = ({ open, onOpenChange, eventId, onSuccess }: PersonalGuestCategoryManagerProps) => {
  const [categories, setCategories] = useState<GuestCategory[]>([]);
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
      .from("personal_event_guest_categories")
      .select("*")
      .eq("event_id", eventId)
      .order("category_name", { ascending: true });

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
      .from("personal_event_guest_categories")
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
              <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No guest categories yet. Add your first category to organize guests.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge style={{ backgroundColor: category.display_color }}>
                          {category.category_name}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(category.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
    display_color: "#3b82f6",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name,
        display_color: category.display_color,
      });
    } else {
      setFormData({
        category_name: "",
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
      display_color: formData.display_color,
    };

    if (category) {
      const { error } = await supabase
        .from("personal_event_guest_categories")
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
        .from("personal_event_guest_categories")
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
              placeholder="e.g., Family, Friends, Colleagues"
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
