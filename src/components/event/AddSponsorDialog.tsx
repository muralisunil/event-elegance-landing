import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface AddSponsorDialogProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  sponsor?: any;
}

const AddSponsorDialog = ({ eventId, open, onClose, sponsor }: AddSponsorDialogProps) => {
  const [tiers, setTiers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    organization_name: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    sponsor_tier_id: "",
    business_category_id: "",
    contribution_amount: "",
    contribution_type: "cash",
    in_kind_description: "",
    website: "",
    is_also_vendor: false,
    vendor_id: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchTiers();
      fetchCategories();
      fetchVendors();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (sponsor) {
      setFormData({
        organization_name: sponsor.organization_name || "",
        contact_person: sponsor.contact_person || "",
        contact_email: sponsor.contact_email || "",
        contact_phone: sponsor.contact_phone || "",
        sponsor_tier_id: sponsor.sponsor_tier_id || "",
        business_category_id: sponsor.business_category_id || "",
        contribution_amount: sponsor.contribution_amount?.toString() || "",
        contribution_type: sponsor.contribution_type || "cash",
        in_kind_description: sponsor.in_kind_description || "",
        website: sponsor.website || "",
        is_also_vendor: sponsor.is_also_vendor || false,
        vendor_id: sponsor.vendor_id || "",
        status: sponsor.status || "pending",
        notes: sponsor.notes || "",
      });
    } else {
      setFormData({
        organization_name: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        sponsor_tier_id: "",
        business_category_id: "",
        contribution_amount: "",
        contribution_type: "cash",
        in_kind_description: "",
        website: "",
        is_also_vendor: false,
        vendor_id: "",
        status: "pending",
        notes: "",
      });
    }
  }, [sponsor, open]);

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
      .eq("event_id", eventId)
      .order("category_name");
    setCategories(data || []);
  };

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("event_vendors")
      .select("*")
      .eq("event_id", eventId)
      .is("linked_sponsor_id", null)
      .order("organization_name");
    setVendors(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.organization_name.trim() || !formData.contact_person.trim() || !formData.contact_email.trim()) {
      toast({
        title: "Error",
        description: "Organization name, contact person, and email are required.",
        variant: "destructive",
      });
      return;
    }

    let vendorId = formData.vendor_id || null;

    // If marked as vendor and "new" selected, create vendor first
    if (formData.is_also_vendor && formData.vendor_id === "new") {
      const { data: newVendor, error: vendorError } = await supabase
        .from("event_vendors")
        .insert({
          event_id: eventId,
          organization_name: formData.organization_name,
          contact_person: formData.contact_person,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          business_category_id: formData.business_category_id || null,
          services_provided: "To be determined",
          status: "pending",
        })
        .select()
        .single();

      if (vendorError) {
        toast({
          title: "Error",
          description: "Failed to create vendor entry.",
          variant: "destructive",
        });
        return;
      }
      vendorId = newVendor.id;
    }

    const sponsorData = {
      event_id: eventId,
      organization_name: formData.organization_name.trim(),
      contact_person: formData.contact_person.trim(),
      contact_email: formData.contact_email.trim(),
      contact_phone: formData.contact_phone.trim() || null,
      sponsor_tier_id: formData.sponsor_tier_id || null,
      business_category_id: formData.business_category_id || null,
      contribution_amount: formData.contribution_amount ? parseFloat(formData.contribution_amount) : null,
      contribution_type: formData.contribution_type,
      in_kind_description: formData.in_kind_description.trim() || null,
      website: formData.website.trim() || null,
      is_also_vendor: formData.is_also_vendor,
      vendor_id: vendorId,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    if (sponsor) {
      const { error } = await supabase
        .from("event_sponsors")
        .update(sponsorData)
        .eq("id", sponsor.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update sponsor.",
          variant: "destructive",
        });
      } else {
        // Update vendor linkage
        if (vendorId) {
          await supabase
            .from("event_vendors")
            .update({ linked_sponsor_id: sponsor.id })
            .eq("id", vendorId);
        }
        toast({ title: "Success", description: "Sponsor updated successfully." });
        onClose();
      }
    } else {
      const { data: newSponsor, error } = await supabase
        .from("event_sponsors")
        .insert(sponsorData)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add sponsor.",
          variant: "destructive",
        });
      } else {
        // Update vendor linkage
        if (vendorId) {
          await supabase
            .from("event_vendors")
            .update({ linked_sponsor_id: newSponsor.id })
            .eq("id", vendorId);
        }
        toast({ title: "Success", description: "Sponsor added successfully." });
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sponsor ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Organization Name *</Label>
            <Input
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              placeholder="Company or Organization"
            />
          </div>
          <div>
            <Label>Contact Person *</Label>
            <Input
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <Label>Contact Email *</Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label>Sponsor Tier</Label>
            <Select value={formData.sponsor_tier_id} onValueChange={(value) => setFormData({ ...formData, sponsor_tier_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.tier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Business Category</Label>
            <Select value={formData.business_category_id} onValueChange={(value) => setFormData({ ...formData, business_category_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contribution Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.contribution_amount}
              onChange={(e) => setFormData({ ...formData, contribution_amount: e.target.value })}
              placeholder="5000.00"
            />
          </div>
          <div>
            <Label>Contribution Type</Label>
            <Select value={formData.contribution_type} onValueChange={(value) => setFormData({ ...formData, contribution_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="in-kind">In-Kind</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(formData.contribution_type === "in-kind" || formData.contribution_type === "both") && (
            <div className="col-span-2">
              <Label>In-Kind Description</Label>
              <Textarea
                value={formData.in_kind_description}
                onChange={(e) => setFormData({ ...formData, in_kind_description: e.target.value })}
                placeholder="Describe what they're providing..."
                rows={2}
              />
            </div>
          )}
          <div>
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="is_also_vendor"
              checked={formData.is_also_vendor}
              onCheckedChange={(checked) => setFormData({ ...formData, is_also_vendor: checked as boolean })}
            />
            <label htmlFor="is_also_vendor" className="text-sm font-medium">
              This sponsor is also a vendor
            </label>
          </div>
          {formData.is_also_vendor && (
            <div className="col-span-2">
              <Label>Link to Vendor</Label>
              <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or create vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create new vendor entry</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.organization_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {sponsor ? "Update" : "Add"} Sponsor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSponsorDialog;
