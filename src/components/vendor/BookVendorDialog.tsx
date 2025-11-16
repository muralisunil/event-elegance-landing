import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVendorBookings } from "@/hooks/useVendorBookings";
import { Vendor } from "@/hooks/useVendors";
import { CalendarIcon } from "lucide-react";

interface BookVendorDialogProps {
  vendor: Vendor;
  eventId: string;
  eventDate: string;
  children?: React.ReactNode;
}

export const BookVendorDialog = ({ vendor, eventId, eventDate, children }: BookVendorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { createBooking } = useVendorBookings('organizer');
  
  const [formData, setFormData] = useState({
    services_required: "",
    contract_amount: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await createBooking({
        event_id: eventId,
        vendor_id: vendor.id,
        services_required: formData.services_required,
        event_date: eventDate,
        contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : undefined,
        notes: formData.notes || undefined,
      });
      
      setOpen(false);
      setFormData({
        services_required: "",
        contract_amount: "",
        notes: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Book Vendor</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {vendor.business_name}</DialogTitle>
          <DialogDescription>
            Send a booking request to this vendor for your event
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="services">Services Required *</Label>
            <Textarea
              id="services"
              placeholder="Describe the services you need..."
              value={formData.services_required}
              onChange={(e) => setFormData({ ...formData, services_required: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Contract Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.contract_amount}
              onChange={(e) => setFormData({ ...formData, contract_amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
