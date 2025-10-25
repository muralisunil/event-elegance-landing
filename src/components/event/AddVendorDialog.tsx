import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface AddVendorDialogProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  vendor?: any;
}

const AddVendorDialog = ({ eventId, open, onClose, vendor }: AddVendorDialogProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [linkedSponsor, setLinkedSponsor] = useState<any>(null);
  const [formData, setFormData] = useState({
    organization_name: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    business_category_id: "",
    services_provided: "",
    booth_number: "",
    setup_requirements: "",
    contract_amount: "",
    payment_status: "pending",
    website: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (vendor) {
      setFormData({
        organization_name: vendor.organization_name || "",
        contact_person: vendor.contact_person || "",
        contact_email: vendor.contact_email || "",
        contact_phone: vendor.contact_phone || "",
        business_category_id: vendor.business_category_id || "",
        services_provided: vendor.services_provided || "",
        booth_number: vendor.booth_number || "",
        setup_requirements: vendor.setup_requirements || "",
        contract_amount: vendor.contract_amount?.toString() || "",
        payment_status: vendor.payment_status || "pending",
        website: vendor.website || "",
        status: vendor.status || "pending",
        notes: vendor.notes || "",
      });
      if (vendor.linked_sponsor_id) {
        fetchLinkedSponsor(vendor.linked_sponsor_id);
      }
    } else {
      setFormData({
        organization_name: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        business_category_id: "",
        services_provided: "",
        booth_number: "",
        setup_requirements: "",
        contract_amount: "",
        payment_status: "pending",
        website: "",
        status: "pending",
        notes: "",
      });
      setLinkedSponsor(null);
    }
  }, [vendor, open]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("event_business_categories")
      .select("*")
      .eq("event_id", eventId)
      .order("category_name");
    setCategories(data || []);
  };

  const fetchLinkedSponsor = async (sponsorId: string) => {
    const { data } = await supabase
      .from("event_sponsors")
      .select("*, sponsor_tier:event_sponsor_tiers(*)")
      .eq("id", sponsorId)
      .single();
    setLinkedSponsor(data);
  };

  const handleSubmit = async () => {
    if (!formData.organization_name.trim() || !formData.contact_person.trim() || !formData.contact_email.trim() || !formData.services_provided.trim()) {
      toast({
        title: "Error",
        description: "Organization name, contact person, email, and services provided are required.",
        variant: "destructive",
      });
      return;
    }

    const vendorData = {
      event_id: eventId,
      organization_name: formData.organization_name.trim(),
      contact_person: formData.contact_person.trim(),
      contact_email: formData.contact_email.trim(),
      contact_phone: formData.contact_phone.trim() || null,
      business_category_id: formData.business_category_id || null,
      services_provided: formData.services_provided.trim(),
      booth_number: formData.booth_number.trim() || null,
      setup_requirements: formData.setup_requirements.trim() || null,
      contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : null,
      payment_status: formData.payment_status,
      website: formData.website.trim() || null,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    if (vendor) {
      const { error } = await supabase
        .from("event_vendors")
        .update(vendorData)
        .eq("id", vendor.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update vendor.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Vendor updated successfully." });
        onClose();
      }
    } else {
      const { error } = await supabase.from("event_vendors").insert(vendorData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add vendor.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Vendor added successfully." });
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {linkedSponsor && (
            <div className="col-span-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Badge>Sponsor</Badge>
                <span className="font-medium">{linkedSponsor.organization_name}</span>
                {linkedSponsor.sponsor_tier && (
                  <Badge variant="secondary">{linkedSponsor.sponsor_tier.tier_name}</Badge>
                )}
              </div>
            </div>
          )}
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
          <div className="col-span-2">
            <Label>Services Provided *</Label>
            <Textarea
              value={formData.services_provided}
              onChange={(e) => setFormData({ ...formData, services_provided: e.target.value })}
              placeholder="What are they providing or selling?"
              rows={2}
            />
          </div>
          <div>
            <Label>Booth/Stall Number</Label>
            <Input
              value={formData.booth_number}
              onChange={(e) => setFormData({ ...formData, booth_number: e.target.value })}
              placeholder="e.g., #12"
            />
          </div>
          <div>
            <Label>Contract Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.contract_amount}
              onChange={(e) => setFormData({ ...formData, contract_amount: e.target.value })}
              placeholder="2500.00"
            />
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="col-span-2">
            <Label>Setup Requirements</Label>
            <Textarea
              value={formData.setup_requirements}
              onChange={(e) => setFormData({ ...formData, setup_requirements: e.target.value })}
              placeholder="Power outlets, tables, water access, etc."
              rows={2}
            />
          </div>
          <div>
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {vendor ? "Update" : "Add"} Vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorDialog;
