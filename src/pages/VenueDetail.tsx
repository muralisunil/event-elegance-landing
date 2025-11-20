import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useVenueDetails } from "@/hooks/useVenueDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, MapPin, Phone, Mail, Globe, Users, 
  ArrowLeft, DollarSign, Maximize2, Check 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { venue, halls, amenities, loading } = useVenueDetails(id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Venue not found</h2>
          <Button onClick={() => navigate('/venues')}>Back to Venues</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative h-64 bg-gradient-primary overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-32 w-32 text-primary/30" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
            <div className="container mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/venues')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Venues
              </Button>
              <h1 className="text-4xl font-bold text-foreground">{venue.name}</h1>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {venue.description || "A professional event venue with modern facilities and flexible spaces to accommodate your event needs."}
                  </p>
                </CardContent>
              </Card>

              {/* Halls */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Halls ({halls.length})</CardTitle>
                  <CardDescription>Choose from our variety of event spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {halls.map((hall) => (
                      <Card key={hall.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{hall.hall_name}</CardTitle>
                              <CardDescription className="mt-2">
                                {hall.description || "Versatile event space"}
                              </CardDescription>
                            </div>
                            <Badge variant={
                              hall.layout_type === 'fixed' ? 'default' :
                              hall.layout_type === 'configurable' ? 'secondary' : 'outline'
                            }>
                              {hall.layout_type.charAt(0).toUpperCase() + hall.layout_type.slice(1)} Layout
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Dimensions</p>
                              <p className="font-semibold flex items-center gap-1">
                                <Maximize2 className="h-4 w-4" />
                                {hall.dimensions_length}' × {hall.dimensions_width}'
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Capacity</p>
                              <p className="font-semibold flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {hall.capacity} guests
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Stage</p>
                              <p className="font-semibold">
                                {hall.has_stage ? "Included" : "Not Available"}
                              </p>
                            </div>
                            {hall.pricing_per_day && (
                              <div>
                                <p className="text-muted-foreground mb-1">Price/Day</p>
                                <p className="font-semibold flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {hall.pricing_per_day}
                                </p>
                              </div>
                            )}
                          </div>
                          {hall.has_lobby && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium">✨ Includes Lobby Space</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              {amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Check className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{amenity.amenity_name}</p>
                            {amenity.description && (
                              <p className="text-sm text-muted-foreground">{amenity.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{venue.address}</p>
                      <p className="text-sm">{venue.city}, {venue.state} {venue.postal_code}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{venue.contact_phone || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{venue.contact_email}</p>
                    </div>
                  </div>
                  
                  {venue.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a 
                          href={venue.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Capacity</span>
                    <span className="font-semibold">{venue.total_capacity || "Varies"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Number of Halls</span>
                    <span className="font-semibold">{halls.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Venue Type</span>
                    <Badge>{venue.venue_type.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-gradient-primary">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Interested in this venue?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact us to check availability and book your event
                  </p>
                  <Button className="w-full">Request Booking</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueDetail;
