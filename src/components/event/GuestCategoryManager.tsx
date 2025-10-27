import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users, Lock } from "lucide-react";
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
  category_level: number;
  benefits: string | null;
  max_guests: number | null;
  display_color: string;
  is_system_category: boolean;
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

    // Check if it's a system category
    const category = categories.find(c => c.id === deleteId);
    if (category?.is_system_category) {
      toast({
        title: "Cannot Delete",
        description: "System categories cannot be deleted manually.",
        variant: "destructive",
      });
      setDeleteId(null);
      return;
    }

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
                        {category.is_system_category && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            System
                          </Badge>
                        )}
                        {category.max_guests && (
                          <span className="text-xs text-muted-foreground">
                            Max: {category.max_guests}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Priority Level</p>
                          <p className="text-sm font-medium">{category.category_level}</p>
                        </div>
                        {category.benefits && (
                          <div>
                            <p className="text-xs text-muted-foreground">Benefits</p>
                            <p className="text-sm">{category.benefits}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            disabled={category.is_system_category}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(category.id)}
                            disabled={category.is_system_category}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        {category.is_system_category && (
                          <p className="text-xs text-muted-foreground">
                            System categories are managed automatically and cannot be edited or deleted.
                          </p>
                        )}
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

    // Prevent manual creation of "Volunteer" category
    if (formData.category_name.toLowerCase() === "volunteer" && !category) {
      toast({
        title: "Cannot Create",
        description: "The 'Volunteer' category is system-managed. Enable volunteer management in Settings to create it automatically.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const payload = {
      event_id: eventId,
      category_name: formData.category_name,
      category_level: parseInt(formData.category_level),
      benefits: formData.benefits || null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
      display_color: formData.display_color,
      is_system_category: false,
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
