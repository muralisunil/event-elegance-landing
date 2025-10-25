import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

interface BusinessCategoryManagerProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  category_name: string;
  description: string | null;
}

const BusinessCategoryManager = ({ eventId, open, onClose }: BusinessCategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [eventId, open]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_business_categories")
      .select("*")
      .eq("event_id", eventId)
      .order("category_name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load business categories.",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from("event_business_categories")
      .insert({
        event_id: eventId,
        category_name: newCategory.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Category added successfully." });
      setNewCategory("");
      fetchCategories();
    }
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;

    const { error } = await supabase
      .from("event_business_categories")
      .update({ category_name: editValue.trim() })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Category updated successfully." });
      setEditingId(null);
      setEditValue("");
      fetchCategories();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_business_categories")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Category deleted successfully." });
      setDeleteId(null);
      fetchCategories();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Business Categories
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button onClick={handleAdd} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No categories yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2 p-2 rounded-md border">
                      {editingId === category.id ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEdit(category.id)}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(category.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditValue("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{category.category_name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditValue(category.category_name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Any sponsors or vendors using this category will have it unlinked.
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

export default BusinessCategoryManager;
