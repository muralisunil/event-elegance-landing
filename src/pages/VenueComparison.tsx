import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, MapPin, Users, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VenueComparison {
  id: string;
  name: string;
  city: string;
  state: string | null;
  venue_type: string;
  total_capacity: number | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  pricing_info: string | null;
  halls: { count: number }[];
  amenities: { amenity_name: string }[];
}

const VenueComparison = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    if (ids.length < 2) {
      navigate('/venues');
      return;
    }
    fetchVenues(ids);
  }, [searchParams]);

  const fetchVenues = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          halls:venue_halls(count),
          amenities:venue_amenities(amenity_name)
        `)
        .in('id', ids);

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const comparisonRows = [
    { label: 'Location', getValue: (v: VenueComparison) => `${v.city}, ${v.state || ''}` },
    { label: 'Venue Type', getValue: (v: VenueComparison) => v.venue_type.replace('_', ' ') },
    { label: 'Total Capacity', getValue: (v: VenueComparison) => v.total_capacity?.toString() || 'N/A' },
    { label: 'Number of Halls', getValue: (v: VenueComparison) => v.halls[0]?.count?.toString() || '0' },
    { label: 'Contact Email', getValue: (v: VenueComparison) => v.contact_email },
    { label: 'Contact Phone', getValue: (v: VenueComparison) => v.contact_phone || 'N/A' },
    { label: 'Website', getValue: (v: VenueComparison) => v.website ? 'Yes' : 'No' },
    { label: 'Pricing Available', getValue: (v: VenueComparison) => v.pricing_info ? 'Yes' : 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/venues')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Venues
          </Button>

          <h1 className="text-4xl font-bold mb-2">Venue Comparison</h1>
          <p className="text-muted-foreground mb-8">Compare venues side-by-side</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader>
                  <div className="h-32 bg-gradient-subtle rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-16 w-16 text-primary/50" />
                  </div>
                  <CardTitle className="text-xl">{venue.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit mt-2">
                    {venue.venue_type.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comparisonRows.map((row, idx) => (
                    <div key={idx}>
                      <p className="text-sm text-muted-foreground">{row.label}</p>
                      <p className="font-medium">{row.getValue(venue)}</p>
                      {idx < comparisonRows.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.length > 0 ? (
                        venue.amenities.slice(0, 5).map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {amenity.amenity_name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No amenities listed</span>
                      )}
                      {venue.amenities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{venue.amenities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/venues/${venue.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueComparison;
