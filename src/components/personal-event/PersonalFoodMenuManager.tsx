import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Leaf, Drumstick, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddPersonalFoodItemDialog } from "./AddPersonalFoodItemDialog";

interface PersonalFoodMenuManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  eventId: string;
  onSuccess: () => void;
}

export const PersonalFoodMenuManager = ({ open, onOpenChange, session, eventId, onSuccess }: PersonalFoodMenuManagerProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  useEffect(() => {
    if (open && session) {
      fetchItems();
    }
  }, [open, session]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_event_food_items')
      .select(`
        *,
        assigned_guest:personal_event_guests!personal_event_food_items_assigned_guest_id_fkey(id, name)
      `)
      .eq('food_session_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching food items:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    const { error } = await supabase
      .from('personal_event_food_items')
      .delete()
      .eq('id', deletingItem.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete food item.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Food item deleted successfully.",
      });
      fetchItems();
      onSuccess();
    }
    setDeletingItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'guest-provided':
        return '👤';
      case 'host-provided':
        return '🏠';
      case 'catered':
        return '🛒';
      default:
        return '📦';
    }
  };

  const isPotLuckStyle = session.is_pot_luck_style;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Menu Items - {session.meal_type} 
              {session.session_date && ` on ${new Date(session.session_date).toLocaleDateString()}`}
              {isPotLuckStyle && <Badge className="ml-2" variant="outline">Pot Luck Style</Badge>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={() => setAddDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No menu items yet. Add your first item!
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>{getSourceIcon(item.source)}</span>
                            {item.item_name}
                          </CardTitle>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">{item.food_type}</Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            {item.assigned_guest && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.assigned_guest.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setAddDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {(item.quantity || item.notes) && (
                      <CardContent className="pt-0">
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Quantity:</strong> {item.quantity}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddPersonalFoodItemDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        sessionId={session.id}
        eventId={eventId}
        item={editingItem}
        onSuccess={() => {
          fetchItems();
          onSuccess();
        }}
        isPotLuckMode={isPotLuckStyle}
      />

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.item_name}"? This action cannot be undone.
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
