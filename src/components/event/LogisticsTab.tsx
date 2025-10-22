import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddLogisticsDialog from "./AddLogisticsDialog";
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
import { Badge } from "@/components/ui/badge";

interface LogisticsTabProps {
  eventId: string;
}

const categories = [
  { value: 'food', label: 'Food & Catering' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'memos', label: 'Memos & Stationery' },
  { value: 'awards', label: 'Awards & Trophies' },
  { value: 'flowers', label: 'Flowers & Decoration' },
  { value: 'decoration', label: 'General Decoration' },
  { value: 'other', label: 'Other' },
];

const LogisticsTab = ({ eventId }: LogisticsTabProps) => {
  const [logistics, setLogistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogistics();
  }, [eventId]);

  const fetchLogistics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_logistics')
      .select('*')
      .eq('event_id', eventId)
      .order('category', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load logistics.",
        variant: "destructive",
      });
    } else {
      setLogistics(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('event_logistics')
      .delete()
      .eq('id', deleteId);

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
      fetchLogistics();
    }
    setDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      planned: "secondary",
      ordered: "outline",
      confirmed: "default",
      delivered: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const groupedByCategory = categories.map(cat => ({
    ...cat,
    items: logistics.filter(item => item.category === cat.value)
  })).filter(cat => cat.items.length > 0);

  const totalBudget = logistics.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0);

  if (loading) {
    return <div className="text-center py-8">Loading logistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Logistics</h2>
          <p className="text-sm text-muted-foreground">
            Total Budget: ${totalBudget.toFixed(2)}
          </p>
        </div>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {logistics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No logistics items yet</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByCategory.map((category) => (
            <div key={category.value}>
              <h3 className="text-lg font-semibold mb-3">{category.label}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {category.items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{item.item_name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingItem(item); setDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {item.quantity && <p className="text-sm">Quantity: {item.quantity}</p>}
                      {item.estimated_cost && (
                        <p className="text-sm">Estimated: ${Number(item.estimated_cost).toFixed(2)}</p>
                      )}
                      {item.actual_cost && (
                        <p className="text-sm">Actual: ${Number(item.actual_cost).toFixed(2)}</p>
                      )}
                      {item.vendor && <p className="text-sm text-muted-foreground">Vendor: {item.vendor}</p>}
                      <div>{getStatusBadge(item.status)}</div>
                      {item.notes && <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddLogisticsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        item={editingItem}
        onSuccess={fetchLogistics}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this logistics item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LogisticsTab;
