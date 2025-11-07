import { Button } from "@/components/ui/button";
import { Ticket, Search, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Search,
    title: "Discover Events",
    description: "Browse and search events by category, location, and date to find the perfect experience",
  },
  {
    icon: Ticket,
    title: "Easy Booking",
    description: "Simple ticket purchasing with secure payment processing and instant confirmation",
  },
  {
    icon: Calendar,
    title: "RSVP Management",
    description: "Respond to private invitations and manage all your event responses in one place",
  },
  {
    icon: User,
    title: "Personal Dashboard",
    description: "View all your bookings, RSVPs, and upcoming events in your personalized dashboard",
  },
];

const AttendeeServices = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">For Event Attendees</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing events, book tickets easily, and manage your RSVPs all in one place
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => navigate("/browse-events")} size="lg">
            Browse Events
          </Button>
          <Button onClick={() => navigate("/rsvp")} variant="outline" size="lg">
            Enter RSVP Code
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AttendeeServices;
