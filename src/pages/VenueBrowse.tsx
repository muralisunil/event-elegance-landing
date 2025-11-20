import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useVenues } from "@/hooks/useVenues";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Search, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const VenueBrowse = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [venueType, setVenueType] = useState("");

  const { venues, loading } = useVenues({ searchTerm, city, state, venueType });

  const handleSearch = () => {
    // Trigger search by updating state
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Find Your Perfect Venue
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Browse through our curated collection of event venues with detailed layouts and seating configurations
              </p>
              
              {/* Search Filters */}
              <Card className="bg-card/95 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search venues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Input
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <Select value={venueType} onValueChange={setVenueType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Venue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="event_hall">Event Hall</SelectItem>
                        <SelectItem value="conference_center">Conference Center</SelectItem>
                        <SelectItem value="banquet_hall">Banquet Hall</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="outdoor">Outdoor Venue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Venues Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Available Venues</h2>
                <p className="text-muted-foreground">
                  {loading ? "Loading..." : `${venues.length} venues found`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No venues found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <Card key={venue.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="h-48 bg-gradient-subtle relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-primary/50" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{venue.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-2">
                            <MapPin className="h-4 w-4" />
                            {venue.city}{venue.state && `, ${venue.state}`}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {venue.venue_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {venue.description || "Professional event venue with modern facilities"}
                      </p>
                      {venue.total_capacity && (
                        <div className="flex items-center gap-2 mt-4 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Capacity: {venue.total_capacity} guests</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full group"
                        onClick={() => navigate(`/venues/${venue.id}`)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VenueBrowse;
