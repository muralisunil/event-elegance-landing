import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Globe, Star } from "lucide-react";
import { Vendor } from "@/hooks/useVendors";
import { useNavigate } from "react-router-dom";

interface VendorCardProps {
  vendor: Vendor;
}

export const VendorCard = ({ vendor }: VendorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/vendors/${vendor.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{vendor.business_name}</CardTitle>
            {vendor.business_type && (
              <Badge variant="secondary" className="mt-2">
                {vendor.business_type}
              </Badge>
            )}
          </div>
          {vendor.logo_url && (
            <img
              src={vendor.logo_url}
              alt={vendor.business_name}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
        </div>
        {vendor.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {vendor.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {(vendor.city || vendor.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {[vendor.city, vendor.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-2">
          {vendor.contact_email && (
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${vendor.contact_email}`;
            }}>
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          )}
          {vendor.contact_phone && (
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${vendor.contact_phone}`;
            }}>
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          )}
          {vendor.website && (
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              window.open(vendor.website, '_blank');
            }}>
              <Globe className="w-4 h-4 mr-1" />
              Website
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
