import { useState } from "react";
import { useVendors } from "@/hooks/useVendors";
import { useVendorBookings } from "@/hooks/useVendorBookings";
import { VendorCard } from "@/components/vendor/VendorCard";
import { VendorBookingCard } from "@/components/vendor/VendorBookingCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { BookVendorDialog } from "@/components/vendor/BookVendorDialog";

interface EventVendorsTabProps {
  eventId: string;
  eventDate: string;
}

export const EventVendorsTab = ({ eventId, eventDate }: EventVendorsTabProps) => {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessType, setBusinessType] = useState("all");
  
  const { vendors, loading: vendorsLoading } = useVendors({
    searchTerm,
    businessType: businessType === "all" ? undefined : businessType,
  });
  
  const { bookings, loading: bookingsLoading } = useVendorBookings('organizer');
  
  const eventBookings = bookings.filter(b => b.event_id === eventId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Vendors</h3>
          <p className="text-sm text-muted-foreground">
            Manage vendors for your event
          </p>
        </div>
        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Browse Vendors</DialogTitle>
              <DialogDescription>
                Search and book vendors for your event
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browse-search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="browse-search"
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="browse-type">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger id="browse-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="Catering">Catering</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Venue">Venue</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Decoration">Decoration</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vendor List */}
              <div className="max-h-[400px] overflow-y-auto">
                {vendorsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading vendors...
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No vendors found
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{vendor.business_name}</h4>
                            {vendor.business_type && (
                              <Badge variant="secondary" className="mt-1">
                                {vendor.business_type}
                              </Badge>
                            )}
                            {vendor.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {vendor.description}
                              </p>
                            )}
                          </div>
                          <BookVendorDialog 
                            vendor={vendor}
                            eventId={eventId}
                            eventDate={eventDate}
                          >
                            <Button size="sm">Book</Button>
                          </BookVendorDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bookings Tabs */}
      {bookingsLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading bookings...
        </div>
      ) : eventBookings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No vendors booked yet</p>
          <Button onClick={() => setBrowseOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Vendor
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({eventBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({eventBookings.filter(b => b.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({eventBookings.filter(b => b.status === 'accepted').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {eventBookings.map(booking => (
                <VendorBookingCard key={booking.id} booking={booking} userType="organizer" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {eventBookings.filter(b => b.status === 'pending').map(booking => (
                <VendorBookingCard key={booking.id} booking={booking} userType="organizer" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            <div className="grid gap-4">
              {eventBookings.filter(b => b.status === 'accepted').map(booking => (
                <VendorBookingCard key={booking.id} booking={booking} userType="organizer" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
