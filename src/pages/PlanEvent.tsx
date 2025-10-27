import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, ArrowRight } from "lucide-react";

const PlanEvent = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Event Type</h1>
          <p className="text-xl text-muted-foreground">
            What kind of event would you like to plan?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-outreach-event')}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Outreach / Community Event</CardTitle>
              </div>
              <CardDescription className="text-base">
                For public events, conferences, workshops, and community gatherings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Full venue management with buildings and rooms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Volunteer and sponsor management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Vendor coordination and contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Structured schedule with session types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Food planning with costs and restrictions</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                Create Outreach Event
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-personal-event')}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Personal Event</CardTitle>
              </div>
              <CardDescription className="text-base">
                For weddings, birthdays, anniversaries, and private celebrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Simple venue management (no building/room complexity)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Organizer and co-organizer collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Free-flow schedule without dropdowns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Food planning without costs or restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Assign tasks to guests (e.g., bring cake)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Future marketplace for decorations & entertainment</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" variant="secondary">
                Create Personal Event
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanEvent;
