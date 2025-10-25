import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddSponsorDialog from "./AddSponsorDialog";
import SponsorTierManager from "./SponsorTierManager";
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

interface SponsorsTabProps {
  eventId: string;
}

const SponsorsTab = ({ eventId }: SponsorsTabProps) => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tierManagerOpen, setTierManagerOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSponsors(), fetchTiers(), fetchCategories()]);
    setLoading(false);
  };

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from("event_sponsors")
      .select("*, sponsor_tier:event_sponsor_tiers(*), business_category:event_business_categories(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sponsors.",
        variant: "destructive",
      });
    } else {
      setSponsors(data || []);
    }
  };

  const fetchTiers = async () => {
    const { data } = await supabase
      .from("event_sponsor_tiers")
      .select("*")
      .eq("event_id", eventId)
      .order("tier_level", { ascending: false });
    setTiers(data || []);
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
      .from("event_sponsors")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete sponsor.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sponsor deleted successfully.",
      });
      setDeleteId(null);
      fetchSponsors();
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

  const totalSponsorship = sponsors
    .filter((s) => s.status === "confirmed" && s.contribution_amount)
    .reduce((sum, s) => sum + parseFloat(s.contribution_amount), 0);

  const groupedByTier = tiers.map((tier) => ({
    tier,
    sponsors: sponsors.filter((s) => s.sponsor_tier_id === tier.id),
  }));

  const untieredSponsors = sponsors.filter((s) => !s.sponsor_tier_id);

  if (loading) {
    return <div className="text-center py-8">Loading sponsors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sponsors
          </h2>
          <p className="text-muted-foreground">
            Total: ${totalSponsorship.toLocaleString()} | {sponsors.length} sponsors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTierManagerOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Tiers
          </Button>
          <Button variant="outline" onClick={() => setCategoryManagerOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={() => { setEditingSponsor(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </div>
      </div>

      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsors Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first sponsor</p>
            <Button onClick={() => { setEditingSponsor(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Sponsor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByTier.map(({ tier, sponsors: tierSponsors }) => {
            if (tierSponsors.length === 0) return null;
            return (
              <div key={tier.id}>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tier.display_color || "#FFD700" }}
                  />
                  {tier.tier_name} Sponsors
                  {tier.contribution_amount && (
                    <span className="text-sm text-muted-foreground font-normal">
                      (${tier.contribution_amount.toLocaleString()}+)
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierSponsors.map((sponsor) => (
                    <Card key={sponsor.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{sponsor.organization_name}</h4>
                              {getStatusBadge(sponsor.status)}
                              {sponsor.is_also_vendor && (
                                <Badge variant="secondary">Also Vendor</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                Contact: {sponsor.contact_person} | {sponsor.contact_email}
                              </p>
                              {sponsor.business_category && (
                                <p>Category: {sponsor.business_category.category_name}</p>
                              )}
                              {sponsor.contribution_amount && (
                                <p className="font-medium text-foreground">
                                  Contribution: ${sponsor.contribution_amount.toLocaleString()}
                                  {sponsor.contribution_type !== "cash" && ` (${sponsor.contribution_type})`}
                                </p>
                              )}
                              {sponsor.in_kind_description && (
                                <p className="text-xs italic">{sponsor.in_kind_description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingSponsor(sponsor);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(sponsor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {untieredSponsors.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Other Sponsors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {untieredSponsors.map((sponsor) => (
                  <Card key={sponsor.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{sponsor.organization_name}</h4>
                            {getStatusBadge(sponsor.status)}
                            {sponsor.is_also_vendor && (
                              <Badge variant="secondary">Also Vendor</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              Contact: {sponsor.contact_person} | {sponsor.contact_email}
                            </p>
                            {sponsor.business_category && (
                              <p>Category: {sponsor.business_category.category_name}</p>
                            )}
                            {sponsor.contribution_amount && (
                              <p className="font-medium text-foreground">
                                Contribution: ${sponsor.contribution_amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingSponsor(sponsor);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(sponsor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddSponsorDialog
        eventId={eventId}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSponsor(null);
          fetchSponsors();
        }}
        sponsor={editingSponsor}
      />

      <SponsorTierManager
        eventId={eventId}
        open={tierManagerOpen}
        onClose={() => {
          setTierManagerOpen(false);
          fetchTiers();
        }}
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
            <AlertDialogTitle>Delete Sponsor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this sponsor.
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

export default SponsorsTab;
