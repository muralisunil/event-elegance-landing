import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useVendorServices, VendorService } from "@/hooks/useVendorServices";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface VendorServicesManagerProps {
  vendorId: string;
}

export const VendorServicesManager = ({ vendorId }: VendorServicesManagerProps) => {
  const { services, loading, addService, updateService, deleteService } = useVendorServices(vendorId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<VendorService | null>(null);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    base_price: "",
    price_unit: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      vendor_id: vendorId,
      service_name: formData.service_name,
      description: formData.description || null,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      price_unit: formData.price_unit || null,
      is_active: formData.is_active,
      display_order: services.length,
    };

    if (editingService) {
      await updateService(editingService.id, serviceData);
    } else {
      await addService(serviceData);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      base_price: "",
      price_unit: "",
      is_active: true,
    });
    setEditingService(null);
  };

  const handleEdit = (service: VendorService) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || "",
      base_price: service.base_price?.toString() || "",
      price_unit: service.price_unit || "",
      is_active: service.is_active,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Services Catalog</h3>
          <p className="text-sm text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_unit">Price Unit</Label>
                  <Input
                    id="price_unit"
                    placeholder="e.g., per hour, per event"
                    value={formData.price_unit}
                    onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? "Update" : "Add"} Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No services added yet. Add your first service to showcase your offerings.
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {service.service_name}
                      {!service.is_active && (
                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                      )}
                    </CardTitle>
                    {service.description && (
                      <CardDescription>{service.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {service.base_price && (
                <CardContent>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">${service.base_price}</span>
                    {service.price_unit && (
                      <span className="ml-1 text-muted-foreground">{service.price_unit}</span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
