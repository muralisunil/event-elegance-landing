import { useParams, useNavigate } from "react-router-dom";
import { useVendorDetails } from "@/hooks/useVendorDetails";
import { useVendorServices } from "@/hooks/useVendorServices";
import { useVendorPortfolio } from "@/hooks/useVendorPortfolio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookVendorDialog } from "@/components/vendor/BookVendorDialog";
import { VendorReviews } from "@/components/vendor/VendorReviews";
import { ArrowLeft, MapPin, Mail, Phone, Globe, Star, Calendar as CalendarIcon, Package, DollarSign } from "lucide-react";

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vendor, reviews, stats, loading } = useVendorDetails(id!);
  const { services, loading: servicesLoading } = useVendorServices(id);
  const { portfolio, loading: portfolioLoading } = useVendorPortfolio(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Vendor not found</p>
          <Button onClick={() => navigate("/vendors")} className="mt-4">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/vendors")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>

        {/* Vendor Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{vendor.business_name}</CardTitle>
                {vendor.business_type && (
                  <Badge variant="secondary" className="mb-3">
                    {vendor.business_type}
                  </Badge>
                )}
                {stats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">{stats.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              {vendor.logo_url && (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.description && (
              <p className="text-foreground">{vendor.description}</p>
            )}

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              
              {vendor.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span>
                    {vendor.address}
                    {(vendor.city || vendor.state || vendor.postal_code) && (
                      <>, {[vendor.city, vendor.state, vendor.postal_code].filter(Boolean).join(', ')}</>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {vendor.contact_email && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${vendor.contact_email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.contact_email}
                  </Button>
                )}
                {vendor.contact_phone && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${vendor.contact_phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    {vendor.contact_phone}
                  </Button>
                )}
                {vendor.website && (
                  <Button variant="outline" size="sm" onClick={() => window.open(vendor.website, '_blank')}>
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        {services.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Available services and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{service.service_name}</h4>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      )}
                    </div>
                    {service.base_price && (
                      <div className="flex items-center text-sm font-semibold ml-4">
                        <DollarSign className="w-4 h-4" />
                        {service.base_price}
                        {service.price_unit && (
                          <span className="ml-1 text-muted-foreground font-normal">{service.price_unit}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Section */}
        {portfolio.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>
                Work samples and past projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

         {/* Reviews Section */}
         <VendorReviews vendorId={id!} />
      </div>
    </div>
  );
};

export default VendorDetail;
