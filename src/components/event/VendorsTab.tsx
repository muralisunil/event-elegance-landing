import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Store, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddVendorDialog from "./AddVendorDialog";
import BusinessCategoryManager from "./BusinessCategoryManager";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VendorsTabProps {
  eventId: string;
}

const VendorsTab = ({ eventId }: VendorsTabProps) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchVendors(), fetchCategories()]);
    setLoading(false);
  };

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from("event_vendors")
      .select("*, business_category:event_business_categories(*), linked_sponsor:event_sponsors(*, sponsor_tier:event_sponsor_tiers(*))")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load vendors.",
        variant: "destructive",
      });
    } else {
      setVendors(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("event_business_categories")
      .select("*")
      .eq("event_id", eventId);
    setCategories(data || []);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("event_vendors")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Vendor deleted successfully.",
      });
      setDeleteId(null);
      fetchVendors();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      declined: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      partial: "secondary",
      paid: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filteredVendors = vendors.filter((v) => {
    if (categoryFilter !== "all" && v.business_category_id !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Vendors
          </h2>
          <p className="text-muted-foreground">{vendors.length} total vendors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryManagerOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={() => { setEditingVendor(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vendors Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first vendor</p>
            <Button onClick={() => { setEditingVendor(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Vendor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{vendor.organization_name}</h3>
                      {getStatusBadge(vendor.status)}
                      {vendor.linked_sponsor && (
                        <Badge variant="secondary">
                          {vendor.linked_sponsor.sponsor_tier?.tier_name || "Sponsor"}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Contact: {vendor.contact_person} | {vendor.contact_email}
                        {vendor.contact_phone && ` | ${vendor.contact_phone}`}
                      </p>
                      {vendor.business_category && (
                        <p>Category: {vendor.business_category.category_name}</p>
                      )}
                      <p className="text-foreground">Services: {vendor.services_provided}</p>
                      <div className="flex gap-4 mt-2">
                        {vendor.booth_number && (
                          <span>Booth: {vendor.booth_number}</span>
                        )}
                        {vendor.contract_amount && (
                          <span>
                            Contract: ${vendor.contract_amount.toLocaleString()} | Payment: {getPaymentBadge(vendor.payment_status)}
                          </span>
                        )}
                      </div>
                      {vendor.setup_requirements && (
                        <p className="text-xs mt-2">Setup: {vendor.setup_requirements}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingVendor(vendor);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(vendor.id)}
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

      <AddVendorDialog
        eventId={eventId}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingVendor(null);
          fetchVendors();
        }}
        vendor={editingVendor}
      />

      <BusinessCategoryManager
        eventId={eventId}
        open={categoryManagerOpen}
        onClose={() => {
          setCategoryManagerOpen(false);
          fetchCategories();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this vendor.
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

export default VendorsTab;
