import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Leaf, Drumstick } from "lucide-react";
import { AddFoodItemDialog } from "./AddFoodItemDialog";
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

interface FoodItem {
  id: string;
  item_name: string;
  food_type: string;
  source: string | null;
  quantity: string | null;
  assigned_volunteer_id: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: string;
  notes: string | null;
}

interface FoodMenuManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  eventId: string;
  onSuccess: () => void;
}

export const FoodMenuManager = ({ open, onOpenChange, session, eventId, onSuccess }: FoodMenuManagerProps) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open, session.id]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("event_food_items")
      .select("*")
      .eq("food_session_id", session.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching food items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items.",
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_food_items")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });
      fetchItems();
      onSuccess();
    }
    setDeleteId(null);
  };

  const getFoodTypeIcon = (type: string) => {
    if (type === "veg" || type === "vegan" || type === "gluten-free") {
      return <Leaf className="h-4 w-4 text-green-600" />;
    }
    return <Drumstick className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-gray-100 text-gray-800",
      ordered: "bg-blue-100 text-blue-800",
      prepared: "bg-yellow-100 text-yellow-800",
      served: "bg-green-100 text-green-800",
    };
    return colors[status] || colors.planned;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Menu for {session.meal_type.charAt(0).toUpperCase() + session.meal_type.slice(1)} -{" "}
              {new Date(session.session_date).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>

          <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No menu items yet. Add items to build your menu.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getFoodTypeIcon(item.food_type)}
                          <span className="font-medium">{item.item_name}</span>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Type: {item.food_type}</div>
                          {item.source && <div>Source: {item.source}</div>}
                          {item.quantity && <div>Quantity: {item.quantity}</div>}
                          {(item.estimated_cost || item.actual_cost) && (
                            <div>
                              Cost: ${(item.actual_cost || item.estimated_cost)?.toFixed(2)}
                            </div>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingItem(item); setDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddFoodItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sessionId={session.id}
        eventId={eventId}
        item={editingItem}
        onSuccess={() => {
          fetchItems();
          onSuccess();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item?
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
